import assert from "node:assert/strict";
import test from "node:test";
import { netscapeCookies } from "./cookies_from_arc.mjs";

test("export only active, unpartitioned YouTube cookies and preserve HttpOnly", () => {
  const base = { path: "/", secure: true, expires: 200, session: false, httpOnly: false };
  const result = netscapeCookies([
    { ...base, domain: ".youtube.com", name: "SID", value: "fictional-youtube-session", httpOnly: true },
    { ...base, domain: "www.youtube.com", name: "PREF", value: "fictional-preference", session: true },
    { ...base, domain: ".google.com", name: "SID", value: "must-not-export" },
    { ...base, domain: "notyoutube.com", name: "SID", value: "must-not-export" },
    { ...base, domain: ".youtube.com", name: "expired", value: "must-not-export", expires: 50 },
    { ...base, domain: ".youtube.com", name: "partitioned", value: "must-not-export", partitionKey: {} },
  ], 100);
  assert.equal(result.count, 2);
  assert.ok(result.text.startsWith("# Netscape HTTP Cookie File\n#HttpOnly_.youtube.com\tTRUE\t/\tTRUE\t200\tSID\tfictional-youtube-session"));
  assert.ok(result.text.includes("www.youtube.com\tFALSE\t/\tTRUE\t0\tPREF"));
  assert.ok(!result.text.includes("must-not-export"));
});
