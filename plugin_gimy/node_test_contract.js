const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const listHTML = `
  <a class="myui-vodlist__thumb lazyload" href="/vod/100.html" title="测试影片" style="background: url(https://img.example/cover.jpg);">
    <span class="pic-text">更新至第2集</span>
  </a>`;
const detailHTML = `
  <div class="myui-panel myui-panel-bg">
    <h3 class="title">线路 A</h3>
    <ul class="myui-content__list"><li><a href="/ep-100-1-1.html">第01集</a></li></ul>
  </div>
  <div class="myui-panel myui-panel-bg">
    <h3 class="title">线路 B</h3>
    <ul class="myui-content__list"><li><a href="/ep-100-2-1.html">第01集</a></li></ul>
  </div>`;
const playerHTML = `<script>var player_data={"encrypt":0,"url":"https:\/\/media.example\/video.m3u8"}</script>`;
const responses = {
  'https://gimy.tv/': listHTML,
  'https://gimy.tv/search/test----------1---.html': listHTML,
  'https://gimy.tv/vod/100.html': detailHTML,
  'https://gimy.tv/ep-100-1-1.html': playerHTML,
};
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
    fetch: function (request) {
      return Promise.resolve({ body: responses[request.url] || '' });
    },
  },
  $next: {
    toMedias: function (data, key) { calls.push(['medias', JSON.parse(data), key]); },
    toSearchMedias: function (data, key) { calls.push(['search', JSON.parse(data), key]); },
    toEpisodes: function (data) { calls.push(['episodes', JSON.parse(data)]); },
    toEpisodesCandidates: function (data) { calls.push(['candidates', JSON.parse(data)]); },
    toPlayerByJSON: function (data) { calls.push(['player', JSON.parse(data)]); },
    toPlayer: function (url) { calls.push(['player-url', url]); },
    emptyView: function (message) { calls.push(['empty', message]); },
  },
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), sandbox);

function settle() {
  return new Promise(function (resolve) { setImmediate(resolve); });
}

(async function () {
  sandbox.buildMedias('https://gimy.tv/', 'index');
  await settle();
  assert.equal(calls[0][0], 'medias');
  assert.equal(calls[0][1][0].title, '测试影片');
  assert.equal(calls[0][1][0].coverURLString, 'https://img.example/cover.jpg');

  sandbox.Search('https://gimy.tv/search/test----------1---.html', 'plugin-key');
  await settle();
  assert.equal(calls[1][0], 'search');
  assert.equal(calls[1][2], 'plugin-key');

  sandbox.Episodes('https://gimy.tv/vod/100.html');
  await settle();
  assert.equal(calls[2][0], 'candidates');
  assert.deepEqual(calls[2][1].map(function (item) { return item.source; }), ['线路 A', '线路 B']);

  sandbox.Player('https://gimy.tv/ep-100-1-1.html');
  await settle();
  assert.equal(calls[3][0], 'player');
  assert.equal(calls[3][1].url, 'https://media.example/video.m3u8');
  assert.equal(calls[3][1].headers.Referer, 'https://gimy.tv/ep-100-1-1.html');

  console.log('plugin_gimy contract tests passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
