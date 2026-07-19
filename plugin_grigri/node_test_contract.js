const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const listHTML = `
  <div class="public-list-div">
    <a href="/GV100/" title="測試動畫">
      <img data-src="/upload/cover.webp">
      <span class="public-list-prb">更新至01集</span>
    </a>
  </div>`;
const detailHTML = `
  <ul class="anthology-list-play">
    <li><a href="/playGV100-1-1/">01</a></li>
    <li><a href="/playGV100-1-2/">02</a></li>
  </ul>`;
const mediaURL = 'https://media.example/video/playlist.m3u8';
const encodedMediaURL = Buffer.from(encodeURIComponent(mediaURL)).toString('base64');
const playerHTML = `<script>var player_aaaa={"url":"${encodedMediaURL}"}</script>`;
const searchJSON = JSON.stringify({
  list: [
    {
      vod_id: 100,
      vod_name: '搜尋動畫',
      vod_pic: 'https://img.example/search.webp',
      vod_remarks: '已完結',
    },
  ],
});
const responses = {
  'https://ani.girigirilove.com/show/2--------1---/': listHTML,
  'https://ani.girigirilove.com/GV100/': detailHTML,
  'https://ani.girigirilove.com/playGV100-1-1/': playerHTML,
  'https://m3u8.girigirilove.com/api.php/provide/vod/?ac=detail&wd=test': searchJSON,
};
const calls = [];
const sandbox = {
  console: { log: function () {}, error: function () {} },
  JSON: JSON,
  String: String,
  Number: Number,
  RegExp: RegExp,
  Object: Object,
  Array: Array,
  TypeError: TypeError,
  decodeURIComponent: decodeURIComponent,
  __syncnextPrimaryHost: 'https://ani.girigirilove.com',
  $http: {
    fetch: function (request) {
      return Promise.resolve({ body: responses[request.url] || '' });
    },
  },
  $next: {
    toMedias: function (data) { calls.push(['medias', JSON.parse(data)]); },
    toSearchMedias: function (data, key) { calls.push(['search', JSON.parse(data), key]); },
    toEpisodes: function (data) { calls.push(['episodes', JSON.parse(data)]); },
    toPlayer: function (url) { calls.push(['player', url]); },
  },
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/txml.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/base64.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), sandbox);

function settle() {
  return new Promise(function (resolve) { setImmediate(resolve); });
}

(async function () {
  assert.equal(
    sandbox.HostsProbeRequest().url,
    'https://ani.girigirilove.com/show/2--------1---/'
  );
  assert.equal(
    sandbox.rebaseSiteURL('https://bgm.girigirilove.com/GV100/'),
    'https://ani.girigirilove.com/GV100/'
  );

  sandbox.buildMedias('https://ani.girigirilove.com/show/2--------1---/');
  await settle();
  assert.equal(calls[0][0], 'medias');
  assert.equal(calls[0][1][0].title, '測試動畫');
  assert.equal(calls[0][1][0].detailURLString, 'https://ani.girigirilove.com/GV100/');
  assert.equal(
    calls[0][1][0].coverURLString,
    'https://ani.girigirilove.com/upload/cover.webp'
  );

  sandbox.Search(
    'https://m3u8.girigirilove.com/api.php/provide/vod/?ac=detail&wd=test',
    'plugin-key'
  );
  await settle();
  assert.equal(calls[1][0], 'search');
  assert.equal(calls[1][1][0].title, '搜尋動畫');
  assert.equal(calls[1][1][0].detailURLString, 'https://ani.girigirilove.com/GV100/');
  assert.equal(calls[1][2], 'plugin-key');

  sandbox.Episodes('https://ani.girigirilove.com/GV100/');
  await settle();
  assert.equal(calls[2][0], 'episodes');
  assert.equal(calls[2][1].length, 2);
  assert.equal(
    calls[2][1][0].episodeDetailURL,
    'https://ani.girigirilove.com/playGV100-1-1/'
  );

  sandbox.Player('https://ani.girigirilove.com/playGV100-1-1/');
  await settle();
  assert.equal(calls[3][0], 'player');
  assert.equal(calls[3][1], mediaURL);

  console.log('plugin_grigri contract tests passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
