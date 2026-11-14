import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const runner = path.resolve(import.meta.dirname, "../node_test_all_plugins.js");

test("X25519 scopes plugin HTTP and VOD probes independently, including redirect destinations", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "syncnext-media-tls-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const key = path.join(root, "fixture.key");
  const cert = path.join(root, "fixture.crt");
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes",
    "-days", "1", "-keyout", key, "-out", cert, "-subj", "/CN=127.0.0.1",
    "-addext", "subjectAltName=IP:127.0.0.1"], { stdio: "ignore" });
  const tls = { key: await readFile(key), cert: await readFile(cert) };
  const requests = [];
  let defaultOrigin;
  let selectedOrigin;
  let pluginOrigin;

  async function listen(identify) {
    const server = createServer(tls, (request, response) => {
      const { method, url, headers } = request;
      requests.push({ server: identify, method, path: url, referer: headers.referer, range: headers.range });
      if (url === "/redirect") {
        response.writeHead(302, { Location: pluginOrigin + "/redirect-to-media" }).end();
      } else if (url === "/redirect-to-media") {
        response.writeHead(302, { Location: selectedOrigin + "/playlist.m3u8" }).end();
      } else if (url === "/playlist.m3u8" && method === "HEAD") {
        response.writeHead(405).end();
      } else if (url === "/playlist.m3u8") {
        response.writeHead(206, { "Content-Type": "application/vnd.apple.mpegurl" }).end("#EXTM3U\n");
      } else {
        response.end("fixture");
      }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
    return `https://127.0.0.1:${server.address().port}`;
  }
  defaultOrigin = await listen("default");
  selectedOrigin = await listen("media");
  pluginOrigin = await listen("plugin");
  const pluginRoot = path.join(root, "plugins");
  const pluginDir = path.join(pluginRoot, "plugin_fixture");
  await mkdir(pluginDir, { recursive: true });
  await writeFile(path.join(pluginDir, "config.json"), JSON.stringify({
    name: "media-tls-fixture",
    host: defaultOrigin,
    files: ["app.js"],
    pages: [{ key: "index", url: defaultOrigin + "/list", javascript: "List" }],
    episodes: { javascript: "Episodes" },
    player: { javascript: "Player" },
  }));
  await writeFile(path.join(pluginDir, "app.js"), `
function HostsProbeRequest() {
  return { url: ${JSON.stringify(pluginOrigin + "/connectivity")}, method: "GET" };
}
function List() {
  return $http.fetch({ url: ${JSON.stringify(pluginOrigin + "/list")} })
    .then(() => $next.toMedias(JSON.stringify([{ id: "fixture", title: "Fixture",
      detailURLString: ${JSON.stringify(defaultOrigin + "/detail")} }])));
}
function Episodes() {
  return $http.fetch({ url: ${JSON.stringify(selectedOrigin + "/detail")} })
    .then(() => $next.toEpisodes(JSON.stringify([{ title: "One",
      episodeDetailURL: ${JSON.stringify(defaultOrigin + "/episode")} }])));
}
function Player() {
  $next.toPlayerByJSON(JSON.stringify({ url: ${JSON.stringify(defaultOrigin + "/redirect")},
    headers: { Referer: ${JSON.stringify(defaultOrigin + "/episode")} } }));
}
`);

  const trace = path.join(root, "tls-preload.cjs");
  const connections = path.join(root, "connections.jsonl");
  await writeFile(trace, `
const fs = require("node:fs");
const tls = require("node:tls");
const connect = tls.connect;
tls.connect = function (options) {
  fs.appendFileSync(${JSON.stringify(connections)}, JSON.stringify({
    port: options.port, curve: options.ecdhCurve || null,
    verifiesCertificate: options.rejectUnauthorized === true
  }) + "\\n");
  return connect.apply(this, arguments);
};
`);
  const output = path.join(root, "output");
  const args = ["--require", trace, runner, `--plugin-root=${pluginRoot}`,
    `--output-dir=${output}`, "--history-mode=latest-only", "--strict-probe",
    "--require-managed-challenge", `--media-probe-x25519-origins=${selectedOrigin}`,
    `--plugin-http-x25519-origins=${pluginOrigin}`];
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, args,
      { env: { ...process.env, NODE_EXTRA_CA_CERTS: cert, NODE_TLS_REJECT_UNAUTHORIZED: "1" } });
    let log = "";
    child.stdout.on("data", (data) => { log += data; });
    child.stderr.on("data", (data) => { log += data; });
    child.on("close", (code) => resolve({ code, log }));
  });
  assert.equal(result.code, 0, result.log);
  const reportDir = path.join(output, "syncnextPlugin_all_plugin_test_runs");
  const summary = await readFile(path.join(reportDir, "latest.summary.log"), "utf8");
  assert.match(summary, /^runner=node$/m);
  const report = JSON.parse(await readFile(path.join(reportDir, "latest.json"), "utf8"));
  assert.deepEqual(report.options.mediaProbeX25519Origins, [selectedOrigin]);
  assert.deepEqual(report.options.pluginHTTPX25519Origins, [pluginOrigin]);
  assert.equal(report.plugins[0].connectivity.ok, true);
  const probe = report.plugins[0].cases.find((item) => item.stage === "player").probe;
  assert.equal(probe.method, "GET");
  assert.equal(probe.status, 206);
  assert.equal(probe.ok, true);
  assert.deepEqual(requests.filter((row) => row.server === "plugin").map(({ path }) => path),
    ["/connectivity", "/list", "/redirect-to-media", "/redirect-to-media"]);
  assert.deepEqual(requests.filter((row) => row.path === "/playlist.m3u8"), [
    { server: "media", method: "HEAD", path: "/playlist.m3u8", referer: defaultOrigin + "/episode", range: undefined },
    { server: "media", method: "GET", path: "/playlist.m3u8", referer: defaultOrigin + "/episode", range: "bytes=0-1023" },
  ]);

  const entries = (await readFile(connections, "utf8")).trim().split("\n").map(JSON.parse);
  const selectedPort = Number(new URL(selectedOrigin).port);
  const pluginPort = Number(new URL(pluginOrigin).port);
  assert.ok(entries.some((entry) => Number(entry.port) === selectedPort && entry.curve === null));
  assert.ok(entries.some((entry) => Number(entry.port) === pluginPort && entry.curve === null));
  const scopedConnections = entries.filter((entry) => entry.curve === "X25519");
  assert.deepEqual(new Set(scopedConnections.map((entry) => Number(entry.port))), new Set([selectedPort, pluginPort]));
  assert.ok(scopedConnections.every((entry) => entry.verifiesCertificate));
});
