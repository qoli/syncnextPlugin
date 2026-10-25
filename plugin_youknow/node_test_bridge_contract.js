#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');

// Model JSPromise.swift: callback results are forwarded without adopting thenables.
class SwiftPromise {
  then(resolve) { this.resolve = resolve; this.next = new SwiftPromise(); return this.next; }
  catch(reject) { this.reject = reject; this.next = new SwiftPromise(); return this.next; }
  success(value) { if (this.resolve) this.next?.success(this.resolve(value)); }
  fail(error) { if (this.reject) this.reject(error); else this.next?.fail(error); }
}

async function player(responses, input, respond) {
  const requests = [];
  return new Promise((resolve, reject) => {
    const context = {
      console: { log() {} },
      // JSCommunicationHandler replaces the native Promise constructor.
      Promise: {},
      $http: { fetch(request) {
        const promise = new SwiftPromise();
        requests.push(request.url);
        setImmediate(() => {
          const body = responses[request.url];
          if (respond) { respond(request.url, promise, body); return; }
          if (typeof body !== 'string') promise.fail('fixture network failure');
          else promise.success({ statusCode: 200, body });
        });
        return promise;
      } },
      $next: {
        toPlayerCandidates(payload) { resolve({ candidates: JSON.parse(payload), requests }); },
        toPlayer(payload) { reject(new Error('No media candidates: ' + payload)); },
      },
    };
    vm.createContext(context);
    for (const file of ['txml.js', 'app.js']) vm.runInContext(fs.readFileSync(__dirname + '/' + file, 'utf8'), context);
    try { context.Player(input); } catch (error) { reject(error); }
  });
}

test('nested resolver requests emit media URLs with the actual Swift promise contract', { timeout: 1000 }, async () => {
  const page = 'https://www.youknow.tv/p/414517-1-1/';
  const iframe = 'https://resolver.example/embed';
  const result = await player({
    [page]: '<script>var player_aaaa={"url":"https://media.example/main.m3u8","encrypt":0};</script>'
      + '<iframe class="embed-responsive-item" src="' + iframe + '"></iframe>',
    [iframe]: '<script>var player_aaaa={"url":"https://media.example/second.m3u8","encrypt":0};</script>',
  }, page);
  assert.deepEqual(result.requests, [page, iframe]);
  assert.deepEqual(result.candidates.map(c => c.url), ['https://media.example/main.m3u8', 'https://media.example/second.m3u8']);
  assert.equal(result.candidates[0].headers.Referer, page);
});

test('a rejected declared source advances to the next declared source', { timeout: 1000 }, async () => {
  const good = 'https://www.youknow.tv/p/414517-2-1/';
  const input = 'youknow-episode:' + encodeURIComponent(JSON.stringify({ candidates: [
    { episodeURL: 'https://www.youknow.tv/p/414517-1-1/' }, { episodeURL: good },
  ] }));
  const result = await player({ [good]: '<script>var player_aaaa={"url":"https://media.example/good.m3u8","encrypt":0};</script>' }, input);
  assert.equal(result.requests.length, 2);
  assert.equal(result.candidates[0].url, 'https://media.example/good.m3u8');
});

test('declared lines resolve concurrently while candidates retain source order', { timeout: 1000 }, async () => {
  const first = 'https://www.youknow.tv/p/414517-1-1/';
  const second = 'https://www.youknow.tv/p/414517-2-1/';
  const input = 'youknow-episode:' + encodeURIComponent(JSON.stringify({ candidates: [
    { episodeURL: first }, { episodeURL: second },
  ] }));
  let releaseFirst;
  const result = await player({
    [first]: '<script>var player_aaaa={"url":"https://media.example/first.m3u8","encrypt":0};</script>',
    [second]: '<script>var player_aaaa={"url":"https://media.example/second.m3u8","encrypt":0};</script>',
  }, input, (url, promise, body) => {
    if (url === first) releaseFirst = () => promise.success({ statusCode: 200, body });
    else { promise.success({ statusCode: 200, body }); releaseFirst(); }
  });
  assert.deepEqual(result.candidates.map(c => c.url), ['https://media.example/first.m3u8', 'https://media.example/second.m3u8']);
});

test('direct media resolves without a native Promise constructor', { timeout: 1000 }, async () => {
  const result = await player({}, 'https://media.example/direct.m3u8');
  assert.equal(result.requests.length, 0);
  assert.equal(result.candidates[0].url, 'https://media.example/direct.m3u8');
});
