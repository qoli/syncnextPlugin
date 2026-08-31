#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

let emittedCandidates = null;
let unavailableMessage = "";
let directPlayerPayload = null;
const now = Date.UTC(2026, 6, 30, 10, 12, 19);

class FixedDate extends Date {
  static now() {
    return now;
  }
}

const sandbox = {
  console: { log: function () {} },
  Date: FixedDate,
  JSON,
  Number,
  String,
  RegExp,
  Object,
  Promise,
  decodeURIComponent,
  encodeURIComponent,
  isFinite,
  $http: {},
  $next: {
    toPlayerCandidates: function (payload) {
      emittedCandidates = JSON.parse(payload);
    },
    toPlayerByJSON: function (payload) {
      directPlayerPayload = JSON.parse(payload);
    },
    emptyView: function (message) {
      unavailableMessage = message;
    },
  },
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + "/app.js", "utf8"), sandbox);

function candidate(name, signedAt, expires) {
  return {
    name,
    url:
      "https://media.example/video?" +
      "X-Amz-Date=" +
      signedAt +
      "&X-Amz-Expires=" +
      expires,
    headers: {},
  };
}

const longLived = candidate("long", "20260730T101215Z", 10800);
const shortLived = candidate("short", "20260730T100159Z", 900);
const anotherShortLived = candidate("short-2", "20260730T100500Z", 900);
const expired = candidate("expired", "20260730T090000Z", 900);
const unsigned = {
  name: "unsigned",
  url: "https://media.example/video.mp4",
  headers: {},
};
const upstreamNotice = {
  name: "upstream-notice",
  url: "https://notice.libvio.mov/notice.mp4",
  headers: {},
};

assert.equal(
  sandbox.signedURLRemainingSeconds(shortLived.url, now),
  280,
  "remaining TTL should use X-Amz-Date plus X-Amz-Expires"
);
assert.equal(
  sandbox.signedURLRemainingSeconds(
    "https://media.example/video?X-Amz-Date=invalid&X-Amz-Expires=900",
    now
  ),
  null,
  "malformed signature dates must remain unknown"
);
assert.equal(
  sandbox.signedURLRemainingSeconds(
    "https://media.example/video?X-Amz-Date=20261340T256199Z&X-Amz-Expires=900",
    now
  ),
  null,
  "out-of-range signature dates must remain unknown"
);
assert.equal(
  sandbox.signedURLRemainingSeconds(
    "https://media.example/video?X-Amz-Date=%ZZ&X-Amz-Expires=900",
    now
  ),
  null,
  "malformed query encoding must not crash TTL classification"
);
assert.deepEqual(
  sandbox
    .preferCandidatesWithSufficientSignedURLTTL([shortLived, longLived], now)
    .map(function (item) {
      return item.name;
    }),
  ["long"],
  "short-lived candidates must not compete with a sufficient candidate"
);
assert.deepEqual(
  sandbox
    .preferCandidatesWithSufficientSignedURLTTL(
      [shortLived, anotherShortLived],
      now
    )
    .map(function (item) {
      return item.name;
    }),
  ["short", "short-2"],
  "all valid short-lived candidates must remain playable"
);
assert.deepEqual(
  sandbox
    .preferCandidatesWithSufficientSignedURLTTL([expired, shortLived], now)
    .map(function (item) {
      return item.name;
    }),
  ["short"],
  "expired candidates must not be restored by the short-lived fallback"
);
assert.deepEqual(
  sandbox.preferCandidatesWithSufficientSignedURLTTL([expired], now),
  [],
  "an expired-only candidate set must fail explicitly"
);
assert.deepEqual(
  sandbox
    .preferCandidatesWithSufficientSignedURLTTL([shortLived, unsigned], now)
    .map(function (item) {
      return item.name;
    }),
  ["unsigned"],
  "unknown TTL must remain unknown and must not be treated as short-lived"
);
assert.equal(
  sandbox.isUpstreamPlaybackNoticeURL(upstreamNotice.url),
  true,
  "the upstream notice video must be classified as an error sentinel"
);
assert.equal(
  sandbox.isUpstreamPlaybackNoticeURL("https://media.example/notice.mp4"),
  false,
  "a filename alone must not classify an unrelated media host as a notice"
);
assert.equal(
  sandbox.buildPlayerCandidate(upstreamNotice.url),
  null,
  "the upstream notice video must not become a player candidate"
);

emittedCandidates = null;
sandbox.gotoPlayCandidates([upstreamNotice, unsigned]);
assert.deepEqual(
  emittedCandidates.map(function (item) {
    return item.name;
  }),
  ["unsigned"],
  "the upstream notice video must be removed before App candidate scoring"
);

emittedCandidates = null;
unavailableMessage = "";
sandbox.gotoPlayCandidates([upstreamNotice]);
assert.equal(emittedCandidates, null, "a notice-only set must not reach the player");
assert.equal(
  unavailableMessage,
  "libvio: 找不到可用的播放地址",
  "a notice-only set must fail explicitly"
);

directPlayerPayload = null;
unavailableMessage = "";
sandbox.gotoPlay(upstreamNotice.url);
assert.equal(directPlayerPayload, null, "a direct notice URL must not reach the player");
assert.equal(
  unavailableMessage,
  "libvio: 找不到可用的播放地址",
  "a direct notice URL must fail explicitly"
);

sandbox.gotoPlayCandidates([expired]);
assert.equal(
  unavailableMessage,
  "libvio: 播放地址已過期",
  "an expired-only handoff must fail explicitly"
);

sandbox.gotoPlayCandidates([shortLived, longLived]);
assert.deepEqual(
  emittedCandidates.map(function (item) {
    return item.name;
  }),
  ["long"],
  "candidate handoff must apply TTL preference before App scoring"
);

console.log("plugin_libvio signed URL TTL contract test passed");
