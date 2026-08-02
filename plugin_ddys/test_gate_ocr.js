const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

function loadPlugin() {
  const context = vm.createContext({
    console,
    CryptoJS: {},
    tXml: {},
    $http: {},
    $next: {},
    $vision: {},
  });
  const directory = __dirname;
  vm.runInContext(
    fs.readFileSync(path.join(directory, 'crypto-js.min.js'), 'utf8'),
    context,
    { filename: 'crypto-js.min.js' }
  );
  vm.runInContext(
    fs.readFileSync(path.join(directory, 'util.js'), 'utf8'),
    context,
    { filename: 'util.js' }
  );
  vm.runInContext(
    fs.readFileSync(path.join(directory, 'app.js'), 'utf8'),
    context,
    { filename: 'app.js' }
  );
  return context;
}

function testAltchaRequiresTheExactChallengeSolution() {
  const context = loadPlugin();
  const salt = 'fixture-salt?expires=1&';
  const expectedNumber = 73;
  const challenge = crypto
    .createHash('sha256')
    .update(salt + String(expectedNumber))
    .digest('hex');

  assert.strictEqual(
    context.solveAltcha({
      algorithm: 'SHA-256',
      challenge,
      maxNumber: 100,
      salt,
      signature: 'fixture-signature',
    }),
    expectedNumber
  );
  assert.throws(
    function () {
      context.solveAltcha({
        algorithm: 'SHA-256',
        challenge,
        maxNumber: 72,
        salt,
        signature: 'fixture-signature',
      });
    },
    /ALTCHA solution was not found/
  );
}

function observation(text, x, y, w, h) {
  return {
    text,
    confidence: 0.9,
    bbox: { x, y, w, h },
  };
}

function testOCRCompletesOnceWhenChallengeFinishesFirst() {
  const context = loadPlugin();
  const callbacks = {};
  const completions = [];
  context.$vision.recognizeText = function (image, callback) {
    callbacks[image] = callback;
  };

  context.visionRecognize('hint', 'challenge', function (points, error) {
    completions.push({ points, error });
  });

  callbacks.challenge({
    observations: [
      observation('影', 20, 30, 10, 12),
      observation('視', 50, 60, 14, 16),
    ],
  });
  callbacks.hint({
    observations: [
      observation('視', 0, 0, 1, 1),
      observation('影', 0, 0, 1, 1),
    ],
  });

  assert.strictEqual(completions.length, 1);
  assert.strictEqual(completions[0].error, null);
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(completions[0].points)),
    [
      { x: 57, y: 68 },
      { x: 25, y: 36 },
    ]
  );
}

function testOCRErrorFailsOnceWithoutSubmittingPoints() {
  const context = loadPlugin();
  const callbacks = {};
  const completions = [];
  context.$vision.recognizeText = function (image, callback) {
    callbacks[image] = callback;
  };

  context.visionRecognize('hint', 'challenge', function (points, error) {
    completions.push({ points, error });
  });

  callbacks.hint({
    observations: [],
    error: { code: 'recognition_failed' },
  });
  callbacks.challenge({
    observations: [observation('影', 20, 30, 10, 12)],
  });

  assert.strictEqual(completions.length, 1);
  assert.strictEqual(completions[0].points, null);
  assert.strictEqual(completions[0].error, 'Hint OCR failed: recognition_failed');
}

function cookiePool(entries) {
  return JSON.stringify({ schemaVersion: 1, cookies: entries });
}

function cookieEntry(cookie, addedAt, validUntil) {
  return { cookie, addedAt, validUntil };
}

function testCookieSelectionUsesOnlyValidEntries() {
  const context = loadPlugin();
  const json = cookiePool([
    cookieEntry('ddys_protect_expired=old', '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z'),
    cookieEntry('ddys_protect_first=one', '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z'),
    cookieEntry('ddys_protect_second=two', '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z'),
  ]);
  const selected = context.selectRandomValidCookie(
    json,
    Date.parse('2026-08-03T00:00:00Z'),
    0.75
  );
  assert.strictEqual(selected.cookie, 'ddys_protect_second=two');
}

function testCookiePoolRejectsMalformedAndEmptyPools() {
  const context = loadPlugin();
  assert.throws(function () {
    context.selectRandomValidCookie(
      cookiePool([]),
      Date.parse('2026-08-03T00:00:00Z'),
      0
    );
  }, /no valid cookie/);
  assert.throws(function () {
    context.parseCookiePool(
      cookiePool([
        cookieEntry('not-a-pass-cookie=value', '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z'),
      ]),
      Date.parse('2026-08-03T00:00:00Z')
    );
  }, /malformed entry/);
}

async function testSafeFetchInjectsCookie() {
  const context = loadPlugin();
  let requestCount = 0;
  const selectedCookie = 'ddys_protect_fixture=secret; burst_uid=fixture';
  context.$http.fetch = function (request) {
    requestCount++;
    if (requestCount === 1) {
      return Promise.resolve({
        body: cookiePool([
          cookieEntry(selectedCookie, '2026-01-01T00:00:00Z', '2999-01-01T00:00:00Z'),
        ]),
      });
    }
    assert.strictEqual(request.headers.Cookie, selectedCookie);
    return Promise.resolve({ body: '[{"id":1}]' });
  };

  const result = await new Promise(function (resolve, reject) {
    context.safeFetch(
      'https://ddys.app/wp-json/wp/v2/posts',
      'GET',
      null,
      null,
      function (response, error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      }
    );
  });

  assert.strictEqual(requestCount, 2);
  assert.strictEqual(result.body, '[{"id":1}]');
}

async function testRejectedCookieFailsWithoutGateBypass() {
  const context = loadPlugin();
  let requestCount = 0;
  let bypassCount = 0;
  context.$http.fetch = function () {
    requestCount++;
    if (requestCount === 1) {
      return Promise.resolve({
        body: cookiePool([
          cookieEntry('ddys_protect_fixture=secret', '2026-01-01T00:00:00Z', '2999-01-01T00:00:00Z'),
        ]),
      });
    }
    return Promise.resolve({ body: '{"code":"ddys_protect_rest_blocked"}' });
  };
  context.bypassGate = function () {
    bypassCount++;
  };

  const error = await new Promise(function (resolve) {
    context.safeFetch(
      'https://ddys.app/wp-json/wp/v2/posts',
      'GET',
      null,
      null,
      function (_response, fetchError) {
        resolve(fetchError);
      }
    );
  });
  assert.match(String(error), /selected cookie was rejected/);
  assert.strictEqual(requestCount, 2);
  assert.strictEqual(bypassCount, 0);
}

async function main() {
  testAltchaRequiresTheExactChallengeSolution();
  testOCRCompletesOnceWhenChallengeFinishesFirst();
  testOCRErrorFailsOnceWithoutSubmittingPoints();
  testCookieSelectionUsesOnlyValidEntries();
  testCookiePoolRejectsMalformedAndEmptyPools();
  await testSafeFetchInjectsCookie();
  await testRejectedCookieFailsWithoutGateBypass();
  console.log('plugin_ddys gate/OCR/cookie-pool tests passed');
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
