#!/usr/bin/env node

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const RESOLVER = 'https://resolver.example:8443/vip/?url=age_fixture';
const MEDIA = 'https://media.example/video.mp4?token=fixture%2Bvalue';
const KEY = Buffer.from('ni po jie ni ** ');
const ENCRYPTED_URL = '0123456789ABCDEF0123456789ABCDEF';
const HTML = '<meta http-equiv="Content-Type" id="1234">'
  + '<meta name="viewport" id="viewport5678">'
  + 'var Api="https://resolver.example:8443/vip";var Time="1792926048";'
  + 'var Ref="";var Version="V3.2";var Vurl="' + ENCRYPTED_URL + '";';

function encrypt(text, key = KEY, iv = KEY) {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('hex').toUpperCase();
}

function decrypt(text) {
  const cipher = crypto.createDecipheriv('aes-128-cbc', KEY, KEY);
  return Buffer.concat([cipher.update(Buffer.from(text, 'hex')), cipher.final()]).toString('utf8');
}

function responseFor(code = 10, info = {}) {
  const reply = { Status: 1, Code: code, Appkey: 'fixture-app-key', Version: 'V3.2' };
  const digest = crypto.createHash('md5').update(String(code) + (code === 10 ? '12345678' : '')
    + reply.Appkey + reply.Version).digest('hex');
  const media = Object.assign({ type: 'auto', url: code === 10 ? encrypt(encodeURIComponent(MEDIA)) : encodeURIComponent(MEDIA) }, info);
  reply.Data = encrypt(JSON.stringify(media), Buffer.from(digest.slice(0, 16)), Buffer.from(digest.slice(16)));
  return reply;
}

async function play({ html = HTML, reply = responseFor(), checkRequest } = {}) {
  const requests = [];
  return new Promise((resolve, reject) => {
    const context = {
      $http: {
        fetch(request) {
          requests.push(request);
          const promise = Promise.resolve().then(() => {
            if (requests.length === 1) return { statusCode: 200, body: html };
            if (checkRequest) checkRequest(request);
            return { statusCode: 200, body: JSON.stringify(reply) };
          });
          // Match App JSPromise: then returns a catch-only continuation.
          return { then(callback) { return { catch(handler) { promise.then(callback).catch(handler); } }; } };
        },
      },
      $next: {
        toPlayerCandidates(payload) { resolve({ candidates: JSON.parse(payload), requests }); },
        emptyView(message) { resolve({ error: message, requests }); },
      },
    };
    vm.createContext(context);
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    try {
      for (const file of config.files) vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
      context.Player(RESOLVER);
    } catch (error) {
      reject(error);
    }
  });
}

test('VIP resolves Code 10 with page-bound metadata and the public request protocol', async () => {
  let checked = false;
  const result = await play({ checkRequest(request) {
    assert.equal(request.url, 'https://resolver.example:8443/vip/Api.php');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers.Origin, 'https://resolver.example:8443');
    assert.equal(request.headers.Referer, '');
    assert.match(request.headers['Video-Parse-Uuid'], /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
    const params = new URLSearchParams(request.body).get('Params');
    assert.deepEqual(JSON.parse(decrypt(params)), {
      url: ENCRYPTED_URL, wap: '0', ios: '0', host: 'resolver.example', referer: '', time: '1792926048',
    });
    assert.equal(decrypt(request.headers['Video-Parse-Sign']), [
      'resolver.example', request.headers['Video-Parse-Uuid'], '1792926048', 'V3.2', params,
    ].join(' | '));
    checked = true;
  } });
  assert.equal(checked, true);
  assert.deepEqual(result.candidates, [{ url: MEDIA, headers: {
    Origin: '', Referer: '', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  } }]);
});

test('non-Code-10 response uses its unwrapped URL contract', async () => {
  const result = await play({ reply: responseFor(0) });
  assert.equal(result.candidates[0].url, MEDIA);
});

test('plain Vurl retains the existing resolver path', async () => {
  const result = await play({ html: 'var Vurl="https://media.example/plain.m3u8";' });
  assert.equal(result.requests.length, 1);
  assert.equal(result.candidates[0].url, 'https://media.example/plain.m3u8');
  assert.equal(result.candidates[0].headers.Referer, RESOLVER);
});

test('encrypted Vurl without metadata never escapes as a relative media URL', async () => {
  const result = await play({ html: 'var Vurl="' + ENCRYPTED_URL + '";' });
  assert.ok(result.error);
  assert.equal(result.requests.length, 1);
});

test('API rejection emits a playback failure', async () => {
  assert.ok((await play({ reply: { Status: 0, Message: 'fixture rejection' } })).error);
});

test('Code 10 response fails when page metadata is missing or mismatched', async () => {
  assert.ok((await play({ html: HTML.replace('id="1234"', '') })).error);
  assert.ok((await play({ html: HTML.replace('id="1234"', 'id="9999"') })).error);
});

test('iframe response is not emitted as a direct media candidate', async () => {
  assert.ok((await play({ reply: responseFor(10, { type: 'url' }) })).error);
});
