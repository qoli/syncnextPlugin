#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');

const CONFIG = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
const KEYWORD = '转生了的大圣女，拼死隐瞒';
const SEARCH = CONFIG.search.url.replace('${keyword}', encodeURIComponent(KEYWORD));

async function search(response, transportError) {
  const calls = [];
  const context = {
    console,
    Promise: {},
    $http: { fetch(request) {
      assert.equal(request.url, SEARCH);
      assert.equal(request.headers['X-Requested-With'], 'XMLHttpRequest');
      return transportError ? Promise.reject(new Error(transportError)) : Promise.resolve(response);
    } },
    $next: {
      toSearchMedias(payload, key) { calls.push({ medias: JSON.parse(payload), key }); },
      toMedias() { assert.fail('search must use the search callback'); },
      emptyView(message) { calls.push({ error: message }); },
    },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), context);
  context.buildSearchMedias(SEARCH, 'source-key');
  await new Promise(resolve => setImmediate(resolve));
  return calls;
}

test('search uses the official search-box API and preserves stable detail IDs', async () => {
  assert.match(SEARCH, /^https:\/\/www\.youknow\.tv\/index\.php\/ajax\/suggest\?/);
  const calls = await search({ statusCode: 200, body: JSON.stringify({ code: 1, list: [
    { id: 414517, name: '转生了的大圣女，拼死隐瞒自己身为圣女', pic: '//img.example/cover.jpg' },
    { id: 134953, name: '你好，星期六', pic: '/cover.jpg' },
  ] }) });
  assert.deepEqual(calls, [{ key: 'source-key', medias: [
    { id: 'https://www.youknow.tv/d/414517/', coverURLString: 'https://img.example/cover.jpg', title: '转生了的大圣女，拼死隐瞒自己身为圣女', descriptionText: '', detailURLString: 'https://www.youknow.tv/d/414517/' },
    { id: 'https://www.youknow.tv/d/134953/', coverURLString: 'https://www.youknow.tv/cover.jpg', title: '你好，星期六', descriptionText: '', detailURLString: 'https://www.youknow.tv/d/134953/' },
  ] }]);
});

test('legitimate empty results preserve the search callback and key', async () => {
  assert.deepEqual(await search({ statusCode: 200, body: '{"code":1,"list":[]}' }), [{ medias: [], key: 'source-key' }]);
});

test('Cloudflare HTML and API rejection remain explicit failures', async () => {
  for (const response of [
    { statusCode: 403, body: '<html>Just a moment...</html>' },
    { statusCode: 200, body: '{"code":0,"msg":"request failed"}' },
  ]) {
    const calls = await search(response);
    assert.ok(calls[0].error);
    assert.deepEqual(calls[1], { medias: [], key: 'source-key' });
  }
});

test('transport errors complete as explicit search failures', async () => {
  const calls = await search(null, 'network failed');
  assert.ok(calls[0].error);
  assert.deepEqual(calls[1], { medias: [], key: 'source-key' });
});
