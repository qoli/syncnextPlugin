const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const origin = "http://192.0.2.1:18771";
const fixtures = {
  "/api/catalog": [{id: "youtube:PL-test:premium", title: "SEED", detailURLString: origin + "/api/playlists/PL-test?profile=premium"}],
  "/api/search": [{id: "youtube:PL-test:premium", title: "SEED", detailURLString: origin + "/api/playlists/PL-test?profile=premium"}],
  "/api/playlists/PL-test": [{id: "youtube:RJ4FLf15XeE", title: "Episode 10", resumeKey: "youtube:RJ4FLf15XeE", episodeDetailURL: origin + "/api/play/RJ4FLf15XeE?profile=premium"}],
  "/api/play/RJ4FLf15XeE": {url: origin + "/sessions/example/master.m3u8", headers: {}},
};

async function invoke(entry, route, expectedCallback, response) {
  return new Promise((resolve, reject) => {
    const next = {};
    for (const name of ["toMedias", "toSearchMedias", "toEpisodes", "toPlayerByJSON"]) {
      next[name] = function (json, key) {
        try {
          assert.equal(name, expectedCallback);
          if (name === "toSearchMedias") assert.equal(key, "owned-search");
          resolve(JSON.parse(json));
        } catch (error) { reject(error); }
      };
    }
    next.emptyView = message => {
      if (expectedCallback === "emptyView") resolve(message);
      else reject(new Error(message));
    };
    const context = vm.createContext({
      $next: next,
      $http: {fetch: async request => {
        assert.equal(request.method, "GET");
        assert.ok(request.url.startsWith(origin));
        assert.deepEqual(Object.keys(request.headers), []);
        return response || {statusCode: 200, body: JSON.stringify(fixtures[new URL(request.url).pathname])};
      }},
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "app.js"), "utf8"), context);
    context[entry](origin + route, "owned-search");
  });
}

(async () => {
  assert.equal((await invoke("Medias", "/api/catalog?profile=premium", "toMedias"))[0].id, "youtube:PL-test:premium");
  assert.equal((await invoke("Search", "/api/search?keyword=SEED", "toSearchMedias"))[0].title, "SEED");
  const episode = (await invoke("Episodes", "/api/playlists/PL-test?profile=premium", "toEpisodes"))[0];
  assert.equal(episode.resumeKey, "youtube:RJ4FLf15XeE");
  const player = await invoke("Player", "/api/play/RJ4FLf15XeE?profile=premium", "toPlayerByJSON");
  assert.deepEqual(player, fixtures["/api/play/RJ4FLf15XeE"]);
  assert.deepEqual(Object.keys(player).sort(), ["headers", "url"]);
  const premium = {url: origin + "/sessions/example/manifest.mpd", headers: {},
    subtitle: {url: origin + "/api/subtitles/RJ4FLf15XeE/zh-TW.vtt", name: "繁體中文", language: "zh-TW"}};
  assert.deepEqual(await invoke("Player", "/api/play/RJ4FLf15XeE?profile=premium", "toPlayerByJSON", {
    statusCode: 200, body: JSON.stringify(premium),
  }), premium);
  assert.equal(await invoke("Player", "/api/play/RJ4FLf15XeE", "emptyView", {
    statusCode: 401, body: JSON.stringify({error: {message: "Premium 畫質需要先匯入 Cookie。"}}),
  }), "Premium 畫質需要先匯入 Cookie。");
  assert.match(await invoke("Medias", "/api/catalog", "emptyView", {statusCode: 502, body: "invalid JSON"}), /Mac 代理請求失敗/);
  console.log("YouTube playlists/search/episodes/released player/error fixtures passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
