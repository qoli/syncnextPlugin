import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const runnerPath = path.join(repositoryRoot, "node_test_all_plugins.js");

async function fixture(status) {
  const root = await mkdtemp(path.join(tmpdir(), "syncnext-managed-smoke-"));
  const pluginRoot = path.join(root, "plugins");
  const pluginDir = path.join(pluginRoot, "plugin_fixture");
  const outputDir = path.join(root, "output");
  await mkdir(pluginDir, { recursive: true });

  await writeFile(path.join(pluginDir, "config.json"), JSON.stringify({
    name: "managed-fixture",
    host: "https://fixture.invalid",
    hosts: ["https://fixture.invalid"],
    challenge: { schema: 1, mode: "managed", scope: "hosts" },
    files: ["app.js"],
    pages: [{ key: "index", title: "Index", url: "https://fixture.invalid/list", javascript: "buildMedias" }],
    search: { url: "https://fixture.invalid/search?q=${keyword}", javascript: "Search", smokeKeyword: "fixture" },
    episodes: { javascript: "Episodes" },
    player: { javascript: "Player" },
  }, null, 2));

  await writeFile(path.join(pluginDir, "app.js"), `
function requireAdapter(url, callback) {
  $http.fetch({ url: url, method: "GET" }).then(function (response) {
    if (response.body !== "adapter-ok") throw new Error("managed adapter was bypassed");
    callback();
  });
}
function buildMedias(url) {
  requireAdapter(url, function () {
    $next.toMedias(JSON.stringify([{ id: "fixture", title: "Fixture", detailURLString: "https://fixture.invalid/detail" }]));
  });
}
function Search(url) {
  requireAdapter(url, function () {
    $next.toSearchMedias(JSON.stringify([{ id: "fixture", title: "Fixture", detailURLString: "https://fixture.invalid/detail" }]));
  });
}
function Episodes(url) {
  requireAdapter(url, function () {
    $next.toEpisodes(JSON.stringify([{ id: "episode", title: "Episode", episodeDetailURL: "https://fixture.invalid/episode" }]));
  });
}
function Player(url) {
  requireAdapter(url, function () { $next.toPlayer("https://fixture.invalid/video.m3u8"); });
}
`);

  const adapterPath = path.join(root, "adapter.mjs");
  await writeFile(adapterPath, `
export async function createChallengeAdapter() {
  const state = ${JSON.stringify(status)};
  return {
    handles(url) { return new URL(url).origin === "https://fixture.invalid"; },
    async request(input) {
      return { status: 200, statusCode: 200, headers: { "content-type": "text/html" }, body: "adapter-ok", url: input.url };
    },
    snapshot() {
      return {
        managed: true,
        status: state,
        observed: state === "not-observed" ? 0 : 1,
        exercised: state === "exercised" ? 1 : 0,
        failed: state === "failed" ? 1 : 0,
        families: state === "not-observed" ? [] : ["safeline"],
        lastFailure: state === "failed" ? "VERIFY_API_FAILED" : "",
      };
    },
  };
}
`);

  const targetsPath = path.join(root, "targets.json");
  await writeFile(targetsPath, JSON.stringify({
    schema: 1,
    targets: [{ plugin: "plugin_fixture", url: "https://fixture.invalid/challenge", expectedFamily: "safeline", minimumBodyBytes: 1 }],
  }));

  return { root, pluginRoot, outputDir, adapterPath, targetsPath };
}

async function runSmoke(paths, includeAdapter = true) {
  const args = [
    runnerPath,
    `--plugin-root=${paths.pluginRoot}`,
    `--output-dir=${paths.outputDir}`,
    "--only=plugin_fixture",
    "--history-mode=latest-only",
    "--smoke-fail-exit=availability",
    "--require-managed-challenge",
    "--no-probe",
    "--invoke-timeout-ms=1000",
    `--challenge-targets-file=${paths.targetsPath}`,
  ];
  if (includeAdapter) {
    args.push(`--challenge-adapter-module=${paths.adapterPath}`);
    args.push("--challenge-core-wasm=unused-core.wasm");
    args.push("--challenge-calculator-wasm=unused-calculator.wasm");
  }

  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: repositoryRoot });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
  const reportPath = path.join(paths.outputDir, "syncnextPlugin_all_plugin_test_runs", "latest.json");
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  return { ...result, report };
}

test("managed adapter drives list, search, episodes, and player", async () => {
  const result = await runSmoke(await fixture("exercised"));
  assert.equal(result.code, 0, result.stderr || result.stdout);
  const plugin = result.report.plugins[0];
  assert.equal(plugin.availability, "usable");
  assert.equal(plugin.challenge.status, "exercised");
  assert.deepEqual(plugin.cases.map((item) => [item.stage, item.ok]), [
    ["connectivity", true],
    ["list", true],
    ["search", true],
    ["player", true],
  ]);
});

test("not-observed remains distinct from plugin availability", async () => {
  const result = await runSmoke(await fixture("not-observed"));
  assert.equal(result.code, 0, result.stderr || result.stdout);
  assert.equal(result.report.plugins[0].availability, "usable");
  assert.equal(result.report.plugins[0].challenge.status, "not-observed");
});

test("required managed plugins fail closed without an adapter", async () => {
  const result = await runSmoke(await fixture("exercised"), false);
  assert.equal(result.code, 1);
  assert.equal(result.report.plugins[0].availability, "unavailable");
  assert.match(result.report.plugins[0].errors.join("\n"), /managed challenge adapter is required/);
});

test("challenge failure cannot be hidden by a successful plugin journey", async () => {
  const result = await runSmoke(await fixture("failed"));
  assert.equal(result.code, 1);
  assert.equal(result.report.plugins[0].availability, "usable");
  assert.equal(result.report.plugins[0].challenge.status, "failed");
  assert.equal(result.report.plugins[0].challenge.lastFailure, "VERIFY_API_FAILED");
});
