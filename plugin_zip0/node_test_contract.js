const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const listHTML = `
  <div class="results-grid">
    <article class="video-card">
      <a aria-label="播放 滑索惊魂" href="/watch?source=bfzy&amp;id=161011&amp;episode=1" class="video-card__poster-link">
        <img alt="滑索惊魂" class="video-card__poster" src="https://img.example/cover.webp"/>
        <span class="video-card__remarks">更新至HD</span>
      </a>
      <div class="video-card__body">
        <a href="/watch?source=bfzy&amp;id=161011&amp;episode=1" class="video-card__title">滑索惊魂</a>
        <div class="video-card__meta"><span>2026</span><i></i><span>动作片</span></div>
      </div>
    </article>
    <article class="video-card">
      <a aria-label="播放 护肝人" href="/watch?source=bfzy&amp;id=161010&amp;episode=1" class="video-card__poster-link">
        <img alt="护肝人" class="video-card__poster" src="https://img.example/cover2.webp"/>
      </a>
      <div class="video-card__body">
        <a href="/watch?source=bfzy&amp;id=161010&amp;episode=1" class="video-card__title">护肝人</a>
      </div>
    </article>
  </div>`;

const watchHTML = `<script>(function($R){return {matches:[$R[14]={i:"watchwatch",l:$R[15]={
  id:"160989",source:"bfzy",sourceName:"线路 3",title:"示例剧",
  episodes:$R[16]=[$R[17]={name:"第1集",url:"https://media.example/a/index.m3u8"},$R[18]={name:"第2集",url:"https://media.example/b/index.m3u8"}]}
}]})($R["tsr"]);</script>`;

function serovalItem(id, source, sourceName, title) {
  return '{"t":10,"i":3,"p":{"k":["id","source","sourceName","title","poster","year","remarks","category"],"v":[' +
    '{"t":1,"s":"' + id + '"},{"t":1,"s":"' + source + '"},{"t":1,"s":"' + sourceName + '"},' +
    '{"t":1,"s":"' + title + '"},{"t":1,"s":"https://img.example/' + id + '.jpg"},' +
    '{"t":1,"s":"2026"},{"t":1,"s":"已完结"},{"t":1,"s":"国产剧"}]},"o":0}';
}

function serovalResponse(items) {
  return '{"t":10,"i":0,"p":{"k":["result","error","context"],"v":[' +
    '{"t":10,"i":1,"p":{"k":["items","health"],"v":[{"t":9,"i":2,"a":[' + items.join(',') + '],"o":0},{"t":10,"i":5,"p":{"k":["status"],"v":[{"t":1,"s":"healthy"}]},"o":0}]},"o":0},' +
    '{"t":2,"s":1},{"t":11,"i":6,"p":{"k":[],"v":[]},"o":0}]},"o":0}';
}

const listURL = 'https://zip0.com/category/movie?page=1';
const watchURL = 'https://zip0.com/watch?source=bfzy&id=160989&episode=1';
const calls = [];
let rejectedServerSource = '';
let headStatus = 200;
let headError = '';
let listError = '';
let invalidSearchResponse = false;

// Match Syncnext's JSPromise shape: then() returns a catch-only continuation.
// This deliberately rejects native Promise chaining so tests cannot hide App-only bugs.
function bridgePromise(value, error) {
  return {
    then: function (resolve) {
      if (!error) Promise.resolve().then(function () { resolve(value); });
      return {
        catch: function (reject) {
          if (error) Promise.resolve().then(function () { reject(error); });
        },
      };
    },
  };
}

const sandbox = {
  console: { log: function () {} },
  JSON: JSON,
  String: String,
  Number: Number,
  RegExp: RegExp,
  Object: Object,
  Array: Array,
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  $http: {
    fetch: function (request) {
      const url = request.url;
      if (url.indexOf('/_serverFn/') !== -1) {
        const payload = decodeURIComponent(url.split('payload=')[1] || '');
        if (invalidSearchResponse) return bridgePromise({ statusCode: 200, body: '<html>blocked</html>' });
        if (rejectedServerSource && payload.indexOf('"' + rejectedServerSource + '"') !== -1) {
          return bridgePromise(null, 'network failed');
        }
        if (payload.indexOf('"dyttzy"') !== -1) {
          return bridgePromise({ statusCode: 200, body: serovalResponse([serovalItem('45206', 'dyttzy', '线路 1', '琅琊榜')]) });
        }
        if (payload.indexOf('"ruyi"') !== -1) {
          return bridgePromise({ statusCode: 200, body: serovalResponse([
            serovalItem('11751', 'ruyi', '线路 2', '琅琊榜'),
            serovalItem('3185', 'ruyi', '线路 2', '琅琊榜之风起长林'),
          ]) });
        }
        return bridgePromise({ statusCode: 200, body: serovalResponse([]) });
      }
      if (url === listURL) return bridgePromise({ statusCode: 200, body: listHTML }, listError);
      if (url === watchURL) return bridgePromise({ statusCode: 200, body: watchHTML });
      return bridgePromise({ statusCode: 200, body: '' });
    },
    head: function () {
      return bridgePromise({ statusCode: headStatus }, headError);
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
  sandbox.buildMedias(listURL, 'index');
  await settle();
  assert.equal(calls[0][0], 'medias');
  assert.equal(calls[0][1].length, 2);
  assert.equal(calls[0][1][0].id, 'https://zip0.com/watch?source=bfzy&id=161011&episode=1');
  assert.equal(calls[0][1][0].title, '滑索惊魂');
  assert.equal(calls[0][1][0].coverURLString, 'https://img.example/cover.webp');
  assert.equal(calls[0][1][0].descriptionText, '更新至HD · 2026 · 动作片');
  assert.equal(calls[0][1][1].descriptionText, '');

  sandbox.Search('https://zip0.com/search?q=%E7%90%85%E7%90%8A%E6%A6%9C', 'plugin-key');
  for (let i = 0; i < 12; i++) await settle();
  assert.equal(calls[1][0], 'search');
  assert.equal(calls[1][2], 'plugin-key');
  assert.equal(calls[1][1].length, 3);
  assert.equal(calls[1][1][0].detailURLString, 'https://zip0.com/watch?source=dyttzy&id=45206&episode=1');
  assert.equal(calls[1][1][0].title, '琅琊榜');
  assert.ok(calls[1][1][0].descriptionText.indexOf('线路 1') === 0);

  sandbox.Episodes(watchURL);
  await settle();
  assert.equal(calls[2][0], 'episodes');
  assert.equal(calls[2][1].length, 2);
  assert.equal(calls[2][1][0].title, '第1集');
  assert.equal(calls[2][1][0].episodeDetailURL, 'https://media.example/a/index.m3u8');

  sandbox.Player('https://media.example/a/index.m3u8');
  await settle();
  assert.equal(calls[3][0], 'player');
  assert.equal(calls[3][1].url, 'https://media.example/a/index.m3u8');
  assert.equal(calls[3][1].headers.Referer, 'https://zip0.com/');

  sandbox.Player(watchURL);
  await settle();
  await settle();
  assert.deepEqual(calls[4], ['empty', '播放地址不是直连媒体']);

  sandbox.Episodes('https://zip0.com/watch?source=bfzy&id=missing&episode=1');
  await settle();
  assert.deepEqual(calls[5], ['empty', '剧集页面请求失败']);

  rejectedServerSource = 'dyttzy';
  sandbox.Search('https://zip0.com/search?q=%E7%90%85%E7%90%8A%E6%A6%9C', 'plugin-key');
  await settle();
  assert.deepEqual(calls[6], ['empty', '搜索线路 1请求失败']);

  rejectedServerSource = '';
  invalidSearchResponse = true;
  sandbox.Search('https://zip0.com/search?q=test', 'plugin-key');
  await settle();
  assert.deepEqual(calls[7], ['empty', '搜索线路 1请求失败']);

  headStatus = 403;
  sandbox.Player('https://media.example/a/index.m3u8');
  await settle();
  assert.deepEqual(calls[8], ['empty', '播放地址不可用']);

  headError = 'network failed';
  sandbox.Player('https://media.example/a/index.m3u8');
  await settle();
  assert.deepEqual(calls[9], ['empty', '播放地址检查失败']);

  listError = 'network failed';
  sandbox.buildMedias(listURL, 'index');
  await settle();
  assert.deepEqual(calls[10], ['empty', '影片列表请求失败']);

  headStatus = 200;
  headError = '';
  delete sandbox.$next.toPlayerByJSON;
  sandbox.Player('https://media.example/a/index.m3u8');
  await settle();
  assert.deepEqual(calls[11], ['empty', '当前版本不支持播放请求头']);
  assert.equal(calls.filter(function (call) { return call[0] === 'player-url'; }).length, 0);

  const probe = sandbox.HostsProbeRequest();
  assert.equal(probe.url, 'https://zip0.com/category/movie');
  assert.ok(probe.accept.bodyIncludesAny.indexOf('video-card') !== -1);

  console.log('plugin_zip0 contract tests passed');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
