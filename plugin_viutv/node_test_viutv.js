const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const config = require("./config.json");
const script = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const stream = "https://example.test/live/master.m3u8?signature=fixture";
const success = { responseCode: "SUCCESS", asset: [stream], drmToken: "fixture-token" };

function fixture() {
  const requests = [];
  const context = vm.createContext({ __syncnextPrimaryHost: config.host });
  vm.runInContext(script, context);
  function select(channelID, upstream, manifest = "#EXTM3U\n") {
    return new Promise((resolve, reject) => {
      context.$http = {
        fetch: async request => {
          requests.push(request);
          if (request.method === "POST") {
            return { statusCode: 200, body: JSON.stringify(upstream) };
          }
          return { statusCode: 200, body: manifest };
        }
      };
      context.$next = {
        toPlayerByJSON: json => resolve({ playback: JSON.parse(json) }),
        emptyView: reason => resolve({ reason })
      };
      try {
        context[config.player.javascript](channelID);
      } catch (error) {
        reject(error);
      }
    });
  }
  return { context, requests, select };
}

test("one live plugin lists 99 and 96 with 99 as default", () => {
  const { context } = fixture();
  assert.equal(config.type, "live");
  assert.deepEqual(JSON.parse(JSON.stringify(context[config.live.javascript]())), {
    defaultChannelId: "99",
    channels: [{ id: "99", title: "ViuTV 99" }, { id: "96", title: "ViuTVsix 96" }]
  });
});

test("selecting either channel requests fresh HLS and hands FairPlay to the app", async () => {
  const { requests, select } = fixture();
  for (const channel of ["99", "96"]) {
    const { playback } = await select(channel, success);
    const [request, probe] = requests.splice(0);
    assert.equal(request.url, "https://api.viu.now.com/p8/3/getLiveURL");
    assert.equal(request.headers["Content-Type"], "text/plain");
    const body = JSON.parse(request.body);
    assert.equal(body.channelno, "0" + channel);
    assert.equal(body.contentId, "0" + channel);
    assert.equal(body.contentType, "Channel");
    assert.equal(body.mode, "prod");
    assert.equal(body.deviceType, "IOS_WEB");
    assert.equal(body.format, "HLS");
    assert.match(body.callerReferenceNo, /^\d{14}$/);
    assert.match(body.deviceId, /^[a-f0-9]{18}$/);
    assert.equal(body.cookie, body.deviceId);
    assert.equal(probe.url, stream);
    assert.equal(probe.method, "GET");
    assert.equal(playback.url, stream);
    assert.deepEqual(playback.headers, {});
    assert.equal(playback.drm.type, "fairplay");
    assert.equal(playback.drm.contentID, "skdSuffix");
    assert.equal(playback.drm.certificate.url, "https://static.viu.tv/drm/fairplay-now.cer");
    assert.equal(playback.drm.license.url, "https://fwp.nowe.com/wrapperFP");
    assert.equal(playback.drm.license.responseEncoding, "base64");
    assert.deepEqual(playback.drm.license.jsonBody, {
      rawLicenseRequestBase64: "${spcBase64}",
      contentKID: "${contentID}",
      drmToken: "fixture-token"
    });
  }
});

test("region refusal, missing token, and an invalid HLS response are explicit failures", async () => {
  const { requests, select } = fixture();
  assert.match((await select("99", { responseCode: "GEO_CHECK_FAIL" })).reason, /播放地區/);
  assert.equal(requests.length, 1);
  assert.match((await select("99", { ...success, drmToken: "" })).reason, /資料不完整/);
  assert.equal(requests.length, 2);
  assert.match((await select("96", success, "<html>denied</html>")).reason, /串流目前無法讀取/);
  assert.equal(requests.length, 4);
});
