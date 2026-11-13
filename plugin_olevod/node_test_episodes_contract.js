const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const app = fs.readFileSync(path.join(__dirname, "main.js"), "utf8");
const detailURL = "https://api.olelive.com/v1/pub/vod/detail/87289/true";
const mediaURL = "https://media.example/episode.m3u8";

async function requestEpisodes(fetch) {
  const calls = [];
  const requests = [];
  const context = vm.createContext({
    $http: {
      fetch(request) {
        requests.push(request);
        return Promise.resolve().then(fetch);
      },
    },
    $next: {
      toEpisodes(value) { calls.push(["episodes", JSON.parse(value)]); },
      emptyView(message) { calls.push(["empty", message]); },
    },
  });
  vm.runInContext(app, context);
  context.signature = () => "fixture-signature";
  context.getEpisodes(detailURL);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, `${detailURL}?_vv=fixture-signature`);
  assert.equal(requests[0].method, "GET");
  return calls;
}

async function main() {
  const successful = await requestEpisodes(() => ({
    statusCode: 200,
    body: JSON.stringify({ data: { urls: [
      { vip: true, title: "VIP", url: "" },
      { vip: false, title: "第1集", url: mediaURL },
    ] } }),
  }));
  assert.deepEqual(successful, [["episodes", [
    { id: mediaURL, title: "第1集", episodeDetailURL: mediaURL },
  ]]]);

  const failed = await requestEpisodes(() => {
    throw new Error("fixture transport failure containing a private URL");
  });
  assert.deepEqual(failed, [["empty", "歐樂分集請求失敗，請稍後再試。"]]);

  const unavailable = await requestEpisodes(() => ({ statusCode: 503, body: "<html>Unavailable</html>" }));
  assert.deepEqual(unavailable, [["empty", "歐樂分集請求失敗（HTTP 503）。"]]);

  for (const body of ["<html>Unexpected page</html>", '{"data":{}}']) {
    const invalid = await requestEpisodes(() => ({ statusCode: 200, body }));
    assert.deepEqual(invalid, [["empty", "歐樂分集資料格式有誤。"]]);
  }
  console.log("plugin_olevod episode response and failure contracts passed");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
