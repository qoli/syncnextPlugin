const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const escapedURLs = String.raw`https:\/\/one.example/video.m3u8 https:\/\/two.example/video.m3u8`;
const calls = [];
let response = { statusCode: 200, body: escapedURLs };
let transportError = '';
const sandbox = {
  console: { log: function () {} },
  JSON: JSON,
  String: String,
  Number: Number,
  RegExp: RegExp,
  Object: Object,
  decodeURIComponent: decodeURIComponent,
  unescape: unescape,
  $http: {
    fetch: function () {
      const error = transportError;
      const result = response;
      return {
        then: function (resolve) {
          assert.equal(arguments.length, 1, 'JSPromise.then accepts only the resolve callback');
          if (!error) queueMicrotask(function () { resolve(result); });
          return {
            catch: function (reject) {
              if (error) queueMicrotask(function () { reject(error); });
            },
          };
        },
      };
    },
  },
  $next: {
    toPlayerCandidates: function (data) { calls.push(JSON.parse(data)); },
    toPlayerByJSON: function () { throw new Error('expected multiple candidates'); },
    toPlayer: function () { throw new Error('expected multiple candidates'); },
    emptyView: function (message) { calls.push(message); },
  },
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), sandbox);

function settle() {
  return new Promise(function (resolve) { setImmediate(resolve); });
}

(async function () {
  const playerURL = 'https://www.thanju.com/play/1-1-1.html';
  sandbox.Player(playerURL);
  await settle();

  assert.equal(calls.length, 1);
  assert.ok(Array.isArray(calls[0]), 'toPlayerCandidates must receive a JSON array');
  assert.deepEqual(calls[0].map(function (item) { return item.url; }), [
    'https://one.example/video.m3u8',
    'https://two.example/video.m3u8',
  ]);
  assert.equal(calls[0][0].headers.Referer, playerURL);

  const operations = [
    ['buildMedias', 'https://www.thanju.com/', '韓劇網列表載入失敗，請稍後再試。'],
    ['buildSearchMedias', 'https://www.thanju.com/search/test.html', '韓劇網搜尋請求失敗，請稍後再試。'],
    ['Episodes', 'https://www.thanju.com/detail/1.html', '韓劇網分集頁載入失敗，請稍後再試。'],
    ['Player', playerURL, '韓劇網播放頁載入失敗，請稍後再試。'],
  ];
  for (const [operation, url, message] of operations) {
    transportError = 'connection reset';
    calls.length = 0;
    sandbox[operation](url);
    await settle();
    assert.deepEqual(calls, [message], operation + ' rejected transport');

    transportError = '';
    response = { statusCode: 503, body: escapedURLs };
    calls.length = 0;
    sandbox[operation](url);
    await settle();
    assert.deepEqual(calls, [message], operation + ' rejected HTTP status');
  }

  response = { statusCode: 200, body: '<html>no player here</html>' };
  calls.length = 0;
  sandbox.Player(playerURL);
  await settle();
  assert.deepEqual(calls, ['未解析到播放地址']);

  console.log('plugin_thanju player-candidate and HTTP error contracts passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
