const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const listHTML = `
  <a class="poster" href="/detail/426347.html">
    <span class="poster__thumb">
      <img src="https://img.example/cover.jpg" alt="榮耀">
      <span class="poster__status">更新至第12集</span>
    </span>
    <h3 class="poster__title">榮耀</h3>
    <p class="poster__meta">主演甲,主演乙</p>
  </a>`;
const detailHTML = `
  <div class="route-title">藍光線路 ᴴᴰ <span class="hd">HD</span></div>
  <div class="eps episodes-route is-open" data-route-sid="12">
    <a class="ep" href="/play/426347-12-1.html">HD中字</a>
  </div>
  <div class="route-title">高清線路 ᴴᴰ <span class="hd">HD</span></div>
  <div class="eps episodes-route" data-route-sid="1">
    <a class="ep" href="/play/426347-1-1.html">第01集</a>
    <a class="ep" href="/play/426347-1-2.html">第02集</a>
  </div>`;
const playerHTML = `<script>window.player_data={"encrypt":0,"url":"https:\/\/media.example\/video.m3u8","vod_data":{"vod_name":"榮耀"}};</script>`;
const opaquePlayerHTML = `<script>window.player_data={"encrypt":0,"url":"opaque-player-key","vod_data":{"vod_name":"榮耀"}};</script>`;
const legacyDetailHTML = `<div class="myui-panel"><h3 class="title">舊線路</h3><ul class="myui-content__list"><li><a href="/ep-100-1-1.html">第01集</a></li></ul></div>`;
const responses = {
  'https://gimyai.tw/': listHTML,
  'https://gimyai.tw/find/-------------.html?wd=榮耀': listHTML,
  'https://gimyai.tw/detail/426347.html': detailHTML,
  'https://gimyai.tw/play/426347-12-1.html': playerHTML,
  'https://gimyai.tw/play/426347-1-1.html': opaquePlayerHTML,
  'https://gimyai.tw/detail/legacy.html': legacyDetailHTML,
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
  sandbox.buildMedias('https://gimyai.tw/', 'index');
  await settle();
  assert.equal(calls[0][0], 'medias');
  assert.equal(calls[0][1][0].id, 'https://gimyai.tw/detail/426347.html');
  assert.equal(calls[0][1][0].title, '榮耀');
  assert.equal(calls[0][1][0].coverURLString, 'https://img.example/cover.jpg');
  assert.equal(calls[0][1][0].descriptionText, '更新至第12集');

  sandbox.Search('https://gimyai.tw/find/-------------.html?wd=榮耀', 'plugin-key');
  await settle();
  assert.equal(calls[1][0], 'search');
  assert.equal(calls[1][2], 'plugin-key');

  sandbox.Episodes('https://gimyai.tw/detail/426347.html');
  await settle();
  assert.equal(calls[2][0], 'candidates');
  assert.deepEqual(calls[2][1].map(function (item) { return item.source; }), ['藍光線路 ᴴᴰ HD', '高清線路 ᴴᴰ HD']);
  assert.equal(calls[2][1][0].episodes[0].id, 'https://gimyai.tw/play/426347-12-1.html');

  sandbox.Player('https://gimyai.tw/play/426347-12-1.html');
  await settle();
  assert.equal(calls[3][0], 'player');
  assert.equal(calls[3][1].url, 'https://media.example/video.m3u8');
  assert.equal(calls[3][1].headers.Referer, 'https://gimyai.tw/play/426347-12-1.html');

  sandbox.Player('https://gimyai.tw/play/426347-1-1.html');
  await settle();
  assert.deepEqual(calls[4], ['empty', '未解析到播放地址']);

  sandbox.Episodes('https://gimyai.tw/detail/legacy.html');
  await settle();
  assert.deepEqual(calls[5], ['empty', '未找到符合目前 Gimy 結構的播放線路']);

  console.log('plugin_gimy contract tests passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
