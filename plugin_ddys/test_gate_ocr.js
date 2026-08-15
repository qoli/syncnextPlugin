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

function testHTMLMediaCardsParser() {
  const context = loadPlugin();
  const html = [
    '<article id="post-27305" class="post-box post-27305 post" data-href="https://ddys.app/colony/">',
    '<div class="post-box-image" style="background-image: url(https://img.example/cover.jpg);"></div>',
    '<div class="post-box-text"><h2 class="post-box-title">',
    '<a href="https://ddys.app/colony/" rel="bookmark">群体 &amp; 同伴</a>',
    '</h2><p>每周二&nbsp;更新</p></div></article>',
    '<article id="post-27306" class="post-27306 post type-post">',
    '<h2 class="post-title"><a href="https://ddys.app/search-result/">搜尋結果</a></h2>',
    '</article>',
    '<article id="post-ignored" class="related-post"><h2>ignore</h2></article>',
  ].join('');

  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(context.parseMediaCardsFromHTML(html))),
    [
      {
        id: '27305',
        coverURLString: 'https://img.example/cover.jpg',
        title: '群体 & 同伴',
        descriptionText: '每周二 更新',
        detailURLString: 'https://ddys.app/colony/',
      },
      {
        id: '27306',
        coverURLString: '',
        title: '搜尋結果',
        descriptionText: '',
        detailURLString: 'https://ddys.app/search-result/',
      },
    ]
  );
}

function testManifestUsesHTMLRoutes() {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  const urls = config.pages.map(function (page) {
    return page.url;
  }).concat(config.search.url);
  assert.strictEqual(urls.some(function (url) {
    return url.indexOf('/wp-json/') >= 0;
  }), false);
  assert.strictEqual(config.pages[0].url, 'https://ddys.app/page/${pageNumber}/');
  assert.strictEqual(config.search.url, 'https://ddys.app/?s=${keyword}&post_type=post');
}

function playlistFixture() {
  return [
    '<div class="ddys-playlist-player">',
    '<script class="ddys-playlist-data" type="application/json">',
    '{"playlistType":"drama","seasons":[',
    '{"title":"第1季","season":1,"tracks":[',
    '{"src":"\\/v2\\/movie\\/Colony.2026.re.mp4","server":"v3","episode":1,"title":"群体"}',
    ']},',
    '{"title":"第2季","season":2,"tracks":[',
    '{"src":"https:\/\/media.example\/episode-2.m3u8","server":"","episode":2,"title":"下一集"}',
    ']}',
    ']}</script></div>',
  ].join('');
}

function testPlaylistProducesResolvedEpisodeURLs() {
  const context = loadPlugin();
  const playlist = context.parsePlaylistData(playlistFixture());
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(context.buildPlaylistEpisodes(playlist))),
    [
      {
        id: 'ddys-s1-e1-https://v3.ddys.app/v2/movie/Colony.2026.re.mp4',
        title: 'S1E1 群体',
        episodeDetailURL: 'https://v3.ddys.app/v2/movie/Colony.2026.re.mp4',
      },
      {
        id: 'ddys-s2-e1-https://media.example/episode-2.m3u8',
        title: 'S2E2 下一集',
        episodeDetailURL: 'https://media.example/episode-2.m3u8',
      },
    ]
  );
}

function testPlaylistMissingDataFailsExplicitly() {
  const context = loadPlugin();
  assert.throws(function () {
    context.parsePlaylistData('<html></html>');
  }, /playlist data is missing/);
  assert.throws(function () {
    context.buildPlaylistEpisodes({
      seasons: [{ season: 1, tracks: [{ src: '/movie.mp4', episode: 1, title: 'Missing server' }] }],
    });
  }, /track server is missing or invalid/);
}

function testPlayerResolvesPlaybackInputs() {
  const context = loadPlugin();
  let playerJSON = null;
  let errorText = null;
  context.$next.toPlayerByJSON = function (json) {
    playerJSON = JSON.parse(json);
  };
  context.$next.emptyView = function (text) {
    errorText = text;
  };

  context.Player('https://v3.ddys.app/v2/movie/Colony.2026.re.mp4');
  assert.strictEqual(playerJSON.url, 'https://v3.ddys.app/v2/movie/Colony.2026.re.mp4');
  assert.strictEqual(playerJSON.headers.Referer, 'https://ddys.app/');
  assert.strictEqual(errorText, null);

  playerJSON = null;
  context.Player('ddys-s1-e1-https://v3.ddys.app/v2/movie/Colony.2026.re.mp4');
  assert.strictEqual(playerJSON.url, 'https://v3.ddys.app/v2/movie/Colony.2026.re.mp4');

  playerJSON = null;
  context.Player('https://ddys.app/colony/');
  assert.strictEqual(playerJSON, null);
  assert.match(errorText, /not a resolved media URL/);

  errorText = null;
  context.Player('ddys-s1-e1-https://ddys.app/colony/');
  assert.strictEqual(playerJSON, null);
  assert.match(errorText, /not a resolved media URL/);
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
      'https://ddys.app/page/1/',
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
      'https://ddys.app/',
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
  testHTMLMediaCardsParser();
  testManifestUsesHTMLRoutes();
  testPlaylistProducesResolvedEpisodeURLs();
  testPlaylistMissingDataFailsExplicitly();
  testPlayerResolvesPlaybackInputs();
  await testSafeFetchInjectsCookie();
  await testRejectedCookieFailsWithoutGateBypass();
  console.log('plugin_ddys gate/OCR/cookie-pool tests passed');
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
