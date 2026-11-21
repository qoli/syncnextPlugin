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
const transportFailureURL = 'https://bg.girigirilove.com/playGV100-1-6/';
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
  'https://bg.girigirilove.com/show/2--------1---/': listHTML,
  'https://bg.girigirilove.com/GV100/': detailHTML,
  'https://bg.girigirilove.com/playGV100-1-1/': playerHTML,
  'https://bg.girigirilove.com/playGV100-1-2/': '<html><h1>暫時無法提供影片</h1></html>',
  'https://bg.girigirilove.com/playGV100-1-3/': '<script>var player_aaaa={"url":</script>',
  'https://bg.girigirilove.com/playGV100-1-4/': '<script>var player_aaaa={"url":"' +
    Buffer.from('%E0%A4%A').toString('base64') + '"}</script>',
  'https://bg.girigirilove.com/playGV100-1-5/': '<script>var player_aaaa={"url":"' +
    Buffer.from('not-a-media-url').toString('base64') + '"}</script>',
  'https://m3u8.girigirilove.com/api.php/provide/vod/?ac=detail&wd=test': searchJSON,
};
const calls = [];
const requests = [];
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
  __syncnextPrimaryHost: 'https://bg.girigirilove.com',
  $http: {
    fetch: function (request) {
      requests.push(request);
      if (request.url === transportFailureURL) {
        return Promise.reject(new Error('fixture transport failure with private request details'));
      }
      assert.ok(responses[request.url], 'Unexpected request: ' + request.url);
      return Promise.resolve({ body: responses[request.url] || '' });
    },
  },
  $next: {
    toMedias: function (data) { calls.push(['medias', JSON.parse(data)]); },
    toSearchMedias: function (data, key) { calls.push(['search', JSON.parse(data), key]); },
    toEpisodes: function (data) { calls.push(['episodes', JSON.parse(data)]); },
    toPlayer: function (url) { calls.push(['player', url]); },
    emptyView: function (message) { calls.push(['empty', message]); },
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
  const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
  assert.equal(config.host, 'https://bg.girigirilove.com');
  assert.ok(config.pages.every(function (page) {
    return page.url.startsWith(config.host + '/show/');
  }));
  assert.equal(
    sandbox.HostsProbeRequest().url,
    'https://bg.girigirilove.com/show/2--------1---/'
  );
  assert.equal(
    sandbox.rebaseSiteURL('https://bgm.girigirilove.com/GV100/'),
    'https://bg.girigirilove.com/GV100/'
  );
  assert.equal(
    sandbox.rebaseSiteURL('https://ani.girigirilove.com/GV100/'),
    'https://bg.girigirilove.com/GV100/'
  );
  assert.equal(
    sandbox.buildURL('//jpg.girigirilove.com/cover.webp'),
    'https://jpg.girigirilove.com/cover.webp'
  );

  // Existing page, favourite and playback inputs can still carry the SPA host.
  sandbox.buildMedias('https://ani.girigirilove.com/show/2--------1---/');
  await settle();
  assert.equal(calls[0][0], 'medias');
  assert.equal(calls[0][1][0].title, '測試動畫');
  assert.equal(calls[0][1][0].detailURLString, 'https://bg.girigirilove.com/GV100/');
  assert.equal(
    calls[0][1][0].coverURLString,
    'https://bg.girigirilove.com/upload/cover.webp'
  );

  sandbox.Search(
    'https://m3u8.girigirilove.com/api.php/provide/vod/?ac=detail&wd=test',
    'plugin-key'
  );
  await settle();
  assert.equal(calls[1][0], 'search');
  assert.equal(calls[1][1][0].title, '搜尋動畫');
  assert.equal(calls[1][1][0].detailURLString, 'https://bg.girigirilove.com/GV100/');
  assert.equal(calls[1][2], 'plugin-key');

  sandbox.Episodes('https://ani.girigirilove.com/GV100/');
  await settle();
  assert.equal(calls[2][0], 'episodes');
  assert.equal(calls[2][1].length, 2);
  assert.equal(
    calls[2][1][0].episodeDetailURL,
    'https://bg.girigirilove.com/playGV100-1-1/'
  );

  sandbox.Player('https://ani.girigirilove.com/playGV100-1-1/');
  await settle();
  assert.equal(calls[3][0], 'player');
  assert.equal(calls[3][1], mediaURL);

  for (const episode of [2, 3, 4, 5]) {
    const first = calls.length;
    sandbox.Player('https://bg.girigirilove.com/playGV100-1-' + episode + '/');
    await settle();
    assert.deepEqual(calls.slice(first), [
      ['empty', '播放頁面未提供有效影片資料，請稍後再試。'],
    ]);
  }
  const first = calls.length;
  sandbox.Player(transportFailureURL);
  await settle();
  assert.deepEqual(calls.slice(first), [
    ['empty', '播放頁面請求失敗，請稍後再試。'],
  ]);
  assert.ok(requests.filter(function (request) {
    return !request.url.startsWith('https://m3u8.girigirilove.com/');
  }).every(function (request) {
    return request.url.startsWith(config.host + '/') &&
      request.headers.Referer === config.host + '/';
  }));

  console.log('plugin_grigri contract tests passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
