import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const runner = path.resolve(import.meta.dirname, "../node_test_all_plugins.js");

for (const method of ["fetch", "head"]) {
  test(`ordinary $http.${method} rejects a transport failure and preserves the failed case`, async (t) => {
    const server = createServer((request, response) => {
      if (request.url === "/detail") {
        request.socket.destroy();
      } else {
        response.end("fixture-ready");
      }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const root = await mkdtemp(path.join(tmpdir(), "syncnext-http-transport-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    const pluginRoot = path.join(root, "plugins");
    const pluginDir = path.join(pluginRoot, "plugin_fixture");
    await mkdir(pluginDir, { recursive: true });
    await writeFile(path.join(pluginDir, "config.json"), JSON.stringify({
      name: "transport-fixture",
      host: origin,
      files: ["app.js"],
      pages: [{ key: "index", url: origin + "/list", javascript: "List" }],
      episodes: { javascript: "Episodes" },
      player: { javascript: "Player" },
    }));
    await writeFile(path.join(pluginDir, "app.js"), `
function HostsProbeRequest() {
  return { url: ${JSON.stringify(origin + "/ready")}, method: "GET", accept: { statusCodes: [200] } };
}
function List() {
  $next.toMedias(JSON.stringify([{ id: "one", title: "One", detailURLString: ${JSON.stringify(origin + "/detail")} }]));
}
function Episodes(url) {
  return $http.${method}({ url: url, method: "GET" }).then(function (response) {
    throw new Error("NETWORK_WAS_FULFILLED_WITH_EMPTY_BODY");
  }, function (error) {
    throw new Error("EXPECTED_TRANSPORT_REJECTION: " + error.message);
  });
}
function Player() { throw new Error("player must not run after transport failure"); }
`);
    const outputDir = path.join(root, "output");
    const result = await new Promise((resolve) => {
      const child = spawn(process.execPath, [runner, `--plugin-root=${pluginRoot}`, "--only=plugin_fixture",
        `--output-dir=${outputDir}`, "--history-mode=latest-only", "--strict-probe",
        "--require-managed-challenge", "--smoke-fail-exit=availability"]);
      let log = "";
      child.stdout.on("data", (data) => { log += data; });
      child.stderr.on("data", (data) => { log += data; });
      child.on("close", (code) => resolve({ code, log }));
    });
    const report = JSON.parse(await readFile(path.join(outputDir, "syncnextPlugin_all_plugin_test_runs/latest.json"), "utf8"));
    const plugin = report.plugins[0];
    assert.equal(result.code, 1, result.log);
    assert.equal(plugin.availability, "not-proven");
    const failure = plugin.cases.find((item) => item.stage === "episodes");
    assert.equal(failure.ok, false);
    assert.match(failure.error, /EXPECTED_TRANSPORT_REJECTION: fetch failed/);
    assert.doesNotMatch(failure.error, /NETWORK_WAS_FULFILLED/);
    assert.equal(failure.httpDiagnostics[0].status, 0);
    assert.equal(failure.httpDiagnostics[0].error, "fetch failed");
    assert.equal(failure.httpDiagnostics[0].method, method === "head" ? "HEAD" : "GET");
    assert.equal(plugin.summary.fail, 1);
  });
}

test("an explicit empty result preserves the failed list or search request", async (t) => {
  const server = createServer((request, response) => {
    if (request.url === "/list" || request.url === "/search") {
      request.socket.destroy();
      return;
    }
    response.setHeader("Content-Type", request.url === "/media.mp4" ? "video/mp4" : "text/plain");
    response.end("fixture-ready");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const root = await mkdtemp(path.join(tmpdir(), "syncnext-http-empty-view-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const pluginRoot = path.join(root, "plugins");
  for (const stage of ["list", "search"]) {
    const dir = path.join(pluginRoot, "plugin_" + stage);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "config.json"), JSON.stringify({
      name: stage,
      host: origin,
      files: ["app.js"],
      pages: [{ key: "index", url: origin + "/list", javascript: "List" }],
      search: stage === "search" ? { url: origin + "/search", javascript: "Search" } : undefined,
      episodes: { javascript: "Episodes" },
      player: { javascript: "Player" },
    }));
    await writeFile(path.join(dir, "app.js"), `
function HostsProbeRequest() {
  return { url: ${JSON.stringify(origin + "/ready")}, method: "GET", accept: { statusCodes: [200] } };
}
function failedRequest(url) {
  return $http.fetch({ url, method: "GET" }).catch(function () {
    $next.emptyView(${JSON.stringify(stage + " request failed")});
  });
}
function List(url) {
  if (${JSON.stringify(stage)} === "list") return failedRequest(url);
  $next.toMedias(JSON.stringify([{ id: "one", title: "One", detailURLString: ${JSON.stringify(origin + "/detail")} }]));
}
function Search(url) { return failedRequest(url); }
function Episodes() {
  $next.toEpisodes(JSON.stringify([{ title: "One", episodeDetailURL: ${JSON.stringify(origin + "/media.mp4")} }]));
}
function Player(url) { $next.toPlayer(url); }
`);
  }
  const outputDir = path.join(root, "output");
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [runner, `--plugin-root=${pluginRoot}`,
      `--output-dir=${outputDir}`, "--history-mode=latest-only", "--strict-probe",
      "--invoke-timeout-ms=1000", "--smoke-fail-exit=availability"]);
    let log = "";
    child.stdout.on("data", (data) => { log += data; });
    child.stderr.on("data", (data) => { log += data; });
    child.on("close", (code) => resolve({ code, log }));
  });
  const report = JSON.parse(await readFile(path.join(outputDir, "syncnextPlugin_all_plugin_test_runs/latest.json"), "utf8"));
  assert.equal(result.code, 1, result.log);
  const list = report.plugins.find((item) => item.pluginFolder === "plugin_list");
  const search = report.plugins.find((item) => item.pluginFolder === "plugin_search");
  assert.deepEqual(list.errors, ["emptyView: list request failed"]);
  assert.equal(list.availability, "unavailable");
  assert.equal(search.cases.some((item) => item.stage === "player" && item.ok), true);
  for (const [plugin, stage] of [[list, "list"], [search, "search"]]) {
    const failure = plugin.cases.find((item) => item.stage === stage);
    assert.equal(failure.ok, false);
    assert.equal(failure.error, `emptyView: ${stage} request failed`);
    assert.equal(failure.reasonCode, "plugin_empty_view");
    assert.deepEqual(failure.httpDiagnostics, [{
      method: "GET", url: origin + "/" + stage, status: 0, safeLine: false, error: "fetch failed",
    }]);
  }
});
