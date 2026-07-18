const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const escapedURLs = String.raw`https:\/\/one.example/video.m3u8 https:\/\/two.example/video.m3u8`;
const calls = [];
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
      return Promise.resolve({ body: escapedURLs });
    },
  },
  $next: {
    toPlayerCandidates: function (data) { calls.push(JSON.parse(data)); },
    toPlayerByJSON: function () { throw new Error('expected multiple candidates'); },
    toPlayer: function () { throw new Error('expected multiple candidates'); },
    emptyView: function (message) { throw new Error(message); },
  },
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), sandbox);

function settle() {
  return new Promise(function (resolve) { setImmediate(resolve); });
}

(async function () {
  sandbox.Player('https://www.thanju.com/play/1-1-1.html');
  await settle();

  assert.equal(calls.length, 1);
  assert.ok(Array.isArray(calls[0]), 'toPlayerCandidates must receive a JSON array');
  assert.deepEqual(calls[0].map(function (item) { return item.url; }), [
    'https://one.example/video.m3u8',
    'https://two.example/video.m3u8',
  ]);
  assert.equal(calls[0][0].headers.Referer, 'https://www.thanju.com/play/1-1-1.html');

  console.log('plugin_thanju player-candidate contract test passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
