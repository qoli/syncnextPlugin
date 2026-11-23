const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const config = require("./config.json");
const script = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const plugins = {
  plugin_hdrip: ["114", 70],
  plugin_hdrip_news: ["181", 35],
  plugin_hdrip_sports: ["136", 20],
  plugin_hdrip_movies: ["84", 34],
  plugin_hdrip_lifestyle: ["48", 24],
  plugin_hdrip_learning: ["54", 30]
};

function fixture(responses = [], plugin = "plugin_hdrip") {
  const directory = path.join(__dirname, "..", plugin);
  const manifest = require(path.join(directory, "config.json"));
  const requests = [];
  let result;
  const context = vm.createContext({
    __syncnextPrimaryHost: manifest.host,
    $http: {
      fetch: async request => {
        requests.push(request);
        return responses.shift();
      }
    },
    $next: {
      toPlayerByJSON: payload => { result = { playback: JSON.parse(payload) }; },
      emptyView: reason => { result = { reason }; }
    }
  });
  for (const file of manifest.files) {
    vm.runInContext(fs.readFileSync(path.join(directory, file), "utf8"), context);
  }
  return {
    manifest,
    requests,
    channels: () => JSON.parse(JSON.stringify(context[manifest.live.javascript]())),
    async select(channelID) {
      result = undefined;
      await context[manifest.player.javascript](channelID);
      return result;
    }
  };
}

test("six independent live entries partition the catalog and retain the flat payload", () => {
  const allIDs = [];
  for (const [plugin, [defaultID, count]] of Object.entries(plugins)) {
    const { manifest, channels } = fixture([], plugin);
    const lineup = channels();
    assert.equal(manifest.type, "live");
    assert.equal(lineup.defaultChannelId, defaultID);
    assert.equal(lineup.channels.length, count);
    assert.ok(lineup.channels.some(channel => channel.id === defaultID));
    const groupIDs = lineup.groups.map(group => group.id);
    assert.equal(new Set(groupIDs).size, groupIDs.length);
    assert.ok(lineup.groups.every(group => group.id && group.title && group.channelIds.length));
    const flatIDs = lineup.channels.map(channel => channel.id);
    assert.deepEqual(lineup.groups.flatMap(group => group.channelIds), flatIDs);
    assert.ok(lineup.channels.every(channel => typeof channel.id === "string" && channel.title));
    assert.equal(new Set(lineup.channels.map(channel => channel.title)).size, count);
    allIDs.push(...flatIDs);
    assert.equal(fs.readFileSync(path.join(__dirname, "..", plugin, "app.js"), "utf8"), script);
  }
  assert.equal(allIDs.length, 213);
  assert.equal(new Set(allIDs).size, allIDs.length);
});

test("each selection signs a fresh URL and uses the session for playback", async () => {
  const channels = ["114", "52", "115", "114"];
  const setCookie = "hdrip_s=fixture; Expires=Wed, 23 Dec 2026 16:24:58 GMT; Secure; HttpOnly";
  const headerShapes = [{ "Set-Cookie": setCookie }, { "set-cookie": ["other=fixture; Path=/", setCookie] }];
  for (const headers of headerShapes) {
    const streams = channels.map((id, index) => `${config.host}/stream/channel-${id}/playlist.m3u8?e=1&s=fixture-${index}`);
    const { requests, select } = fixture([
      { statusCode: 200, headers },
      ...streams.flatMap(url => [
        { statusCode: 200, body: JSON.stringify({ url }) },
        { statusCode: 200, body: "#EXTM3U\n#EXTINF:10,\nsegment.ts\n" }
      ])
    ]);
    let userAgent;
    for (const [index, id] of channels.entries()) {
      const { playback } = await select(id);
      const page = `${config.host}/?ch=${id}`;
      if (index === 0) {
        const session = requests.shift();
        assert.equal(session.url, page);
        userAgent = session.headers["User-Agent"];
      }
      const [resolve, hls] = requests.splice(0);
      assert.equal(resolve.url, `${config.host}/api/play.php?id=${id}`);
      assert.equal(hls.url, streams[index]);
      assert.equal(playback.url, hls.url);
      assert.deepEqual(playback.headers, { "User-Agent": userAgent, Referer: page, Cookie: "hdrip_s=fixture" });
      assert.deepEqual({ ...resolve.headers }, playback.headers);
      assert.deepEqual({ ...hls.headers }, playback.headers);
    }
  }
});

test("unlisted channels, denied sessions and invalid playlists fail explicitly", async () => {
  const session = { statusCode: 200, headers: { "set-cookie": "hdrip_s=fixture; Secure" } };
  const playback = url => ({ statusCode: 200, body: JSON.stringify({ url }) });
  const scenarios = [
    ["unknown", [], 0, /未收錄/],
    ["181", [], 0, /未收錄/],
    ["114", [{ statusCode: 403 }], 1, /HTTP 403/],
    ["114", [{ statusCode: 200 }], 1, /未建立/],
    ["114", [session, { statusCode: 429 }], 2, /HTTP 429/],
    ["114", [session, playback("https://example.test/stream/rthk/playlist.m3u8?e=1")], 2, /有效的直播播放網址/],
    ["114", [session, playback(`${config.host}/stream/rthk/playlist.m3u8?e=1`), { statusCode: 200, body: "<html>denied</html>" }], 3, /清單目前無法讀取/]
  ];
  for (const [id, responses, count, reason] of scenarios) {
    const { requests, select } = fixture(responses);
    assert.match((await select(id)).reason, reason);
    assert.equal(requests.length, count);
  }
});
