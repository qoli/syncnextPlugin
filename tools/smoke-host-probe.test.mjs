import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const runner = path.resolve(import.meta.dirname, "../node_test_all_plugins.js");

async function runFixture(t, { body = "<title>Catalog</title>catalog-ready", status = 200, throws = false } = {}) {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push({ url: request.url, method: request.method, headers: request.headers });
    if (request.url === "/signed-probe?signature=fixture" && request.headers["x-fixture"] === "signed") {
      response.writeHead(status, { "Content-Type": "text/html", "Set-Cookie": "fixture_session=ok; Path=/" });
      response.end(body);
    } else if (request.url === "/list" && request.headers.cookie === "fixture_session=ok") {
      response.end("list-ok");
    } else if (request.url === "/media.m3u8") {
      response.writeHead(200, { "Content-Type": "application/vnd.apple.mpegurl" });
      response.end("#EXTM3U\n#EXT-X-ENDLIST\n");
    } else {
      response.writeHead(401);
      response.end("signed probe and session required");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const root = await mkdtemp(path.join(tmpdir(), "syncnext-host-probe-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const pluginRoot = path.join(root, "plugins");
  const pluginDir = path.join(pluginRoot, "plugin_fixture");
  await mkdir(pluginDir, { recursive: true });
  await writeFile(path.join(pluginDir, "config.json"), JSON.stringify({
    name: "signed-host-probe",
    host: origin,
    files: ["app.js"],
    pages: [{ key: "index", url: origin + "/list", javascript: "List" }],
    episodes: { javascript: "Episodes" },
    player: { javascript: "Player" },
  }));
  await writeFile(path.join(pluginDir, "app.js"), `
function HostsProbeRequest() {
  ${throws ? 'throw new Error("declared probe failed");' : `return {
    url: ${JSON.stringify(origin + "/signed-probe?signature=fixture")},
    method: "GET",
    headers: { "X-Fixture": "signed" },
    accept: {
      statusCodes: [200],
      bodyIncludesAny: ["CATALOG-READY"],
      bodyExcludesAny: ["captcha"],
      titleIncludesAny: ["catalog"],
      titleExcludesAny: ["Just a moment"],
    },
  };`}
}
function List(url) {
  return $http.fetch({ url: url, method: "GET" }).then(function (response) {
    if (response.status !== 200 || response.body !== "list-ok") throw new Error("probe session was lost");
    $next.toMedias(JSON.stringify([{ id: "one", title: "One", detailURLString: ${JSON.stringify(origin + "/detail")} }]));
  });
}
function Episodes() {
  $next.toEpisodes(JSON.stringify([{ id: "one", title: "One", episodeDetailURL: ${JSON.stringify(origin + "/episode")} }]));
}
function Player() { $next.toPlayer(${JSON.stringify(origin + "/media.m3u8")}); }
`);
  const outputDir = path.join(root, "output");
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [runner, `--plugin-root=${pluginRoot}`, "--only=plugin_fixture",
      `--output-dir=${outputDir}`, "--history-mode=latest-only", "--strict-connectivity-check",
      "--strict-probe", "--smoke-fail-exit=availability", "--require-managed-challenge"]);
    let log = "";
    child.stdout.on("data", (data) => { log += data; });
    child.stderr.on("data", (data) => { log += data; });
    child.on("close", (code) => resolve({ code, log }));
  });
  const report = JSON.parse(await readFile(path.join(outputDir, "syncnextPlugin_all_plugin_test_runs/latest.json"), "utf8"));
  return { ...result, requests, plugin: report.plugins[0] };
}

test("declared signed probe preserves its headers and session for the real plugin journey", async (t) => {
  const result = await runFixture(t);
  assert.equal(result.code, 0, result.log);
  assert.equal(result.plugin.connectivity.source, "HostsProbeRequest");
  assert.equal(result.plugin.connectivity.targets.length, 1);
  assert.equal(result.plugin.summary.fail, 0);
  assert.equal(result.requests[0].url, "/signed-probe?signature=fixture");
  assert.equal(result.requests[0].headers["x-fixture"], "signed");
  assert.equal(result.requests.find((request) => request.url === "/list").headers.cookie, "fixture_session=ok");
});

for (const scenario of [
  { name: "rejected status", status: 401 },
  { name: "missing body marker", body: "<title>Catalog</title>unrelated page" },
  { name: "challenge body", body: "<title>Catalog</title>catalog-ready captcha" },
  { name: "rejected title", body: "<title>Just a moment</title>catalog-ready" },
  { name: "throwing declaration", throws: true },
]) {
  test(`declared probe fails closed for ${scenario.name} without trying unsigned targets`, async (t) => {
    const result = await runFixture(t, scenario);
    assert.equal(result.code, 1, result.log);
    assert.equal(result.plugin.connectivity.ok, false);
    assert.equal(result.requests.length, scenario.throws ? 0 : 1);
    assert.ok(result.plugin.connectivity.targets[0].error);
  });
}
