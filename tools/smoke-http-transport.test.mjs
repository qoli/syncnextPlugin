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
