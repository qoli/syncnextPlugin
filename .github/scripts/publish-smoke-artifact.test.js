#!/usr/bin/env node

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { publishArtifact } = require("./publish-smoke-artifact");

function writeFixture(artifactDirectory) {
  const report = {
    generatedAt: "2026-07-29T12:34:56.789Z",
    subscriptionsSource:
      "https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json",
    options: {
      discovery: "subscriptions",
    },
    summary: {
      pluginsTotal: 1,
      pluginsWithFatalErrors: 0,
      casesTotal: 2,
      ok: 2,
      fail: 0,
      invalidSourcesPlugins: 0,
    },
    plugins: [{}],
  };
  const invalidSources = {
    generatedAt: report.generatedAt,
    invalidPluginsCount: 0,
    invalidPlugins: [],
  };

  fs.writeFileSync(
    path.join(artifactDirectory, "latest.json"),
    `${JSON.stringify(report)}\n`
  );
  fs.writeFileSync(path.join(artifactDirectory, "latest.log"), "log\n");
  fs.writeFileSync(path.join(artifactDirectory, "latest.summary.log"), "summary\n");
  fs.writeFileSync(
    path.join(artifactDirectory, "invalid_sources_latest.json"),
    `${JSON.stringify(invalidSources)}\n`
  );
  fs.writeFileSync(path.join(artifactDirectory, "invalid_sources_latest.txt"), "\n");
}

function makeRepoFixture(repoDirectory) {
  fs.writeFileSync(
    path.join(repoDirectory, "README.md"),
    [
      "# Keep this heading",
      "",
      "<!-- AUTO-SMOKE-STATUS:START -->",
      "old",
      "<!-- AUTO-SMOKE-STATUS:END -->",
      "",
      "Keep this footer.",
      "",
    ].join("\n")
  );
}

function testPublishesOnlyValidatedOutputs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smoke-publisher-valid-"));
  const artifactDirectory = path.join(root, "artifact");
  const repoDirectory = path.join(root, "repo");
  fs.mkdirSync(artifactDirectory);
  fs.mkdirSync(repoDirectory);
  writeFixture(artifactDirectory);
  makeRepoFixture(repoDirectory);

  publishArtifact(artifactDirectory, repoDirectory);

  const readme = fs.readFileSync(path.join(repoDirectory, "README.md"), "utf8");
  assert.match(readme, /# Keep this heading/);
  assert.match(readme, /Generated: `2026-07-29T12:34:56\.789Z`/);
  assert.match(readme, /- Cases: `2\/2` passed/);
  assert.match(readme, /Keep this footer\./);

  const outputNames = fs
    .readdirSync(path.join(repoDirectory, "syncnextPlugin_all_plugin_test_runs"))
    .sort();
  assert.deepEqual(outputNames, [
    "invalid_sources_latest.json",
    "invalid_sources_latest.txt",
    "latest.json",
    "latest.log",
    "latest.summary.log",
  ]);
}

function testRejectsUnexpectedFiles() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smoke-publisher-extra-"));
  const artifactDirectory = path.join(root, "artifact");
  const repoDirectory = path.join(root, "repo");
  fs.mkdirSync(artifactDirectory);
  fs.mkdirSync(repoDirectory);
  writeFixture(artifactDirectory);
  makeRepoFixture(repoDirectory);
  fs.writeFileSync(path.join(artifactDirectory, "payload.sh"), "exit 0\n");

  assert.throws(
    () => publishArtifact(artifactDirectory, repoDirectory),
    /unexpected file set/
  );
}

function testRejectsInconsistentReports() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smoke-publisher-invalid-"));
  const artifactDirectory = path.join(root, "artifact");
  const repoDirectory = path.join(root, "repo");
  fs.mkdirSync(artifactDirectory);
  fs.mkdirSync(repoDirectory);
  writeFixture(artifactDirectory);
  makeRepoFixture(repoDirectory);

  const reportPath = path.join(artifactDirectory, "latest.json");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  report.summary.casesTotal = 99;
  fs.writeFileSync(reportPath, `${JSON.stringify(report)}\n`);

  assert.throws(
    () => publishArtifact(artifactDirectory, repoDirectory),
    /case totals are inconsistent/
  );
}

function testRejectsSymlinkedArtifactFile() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smoke-publisher-symlink-"));
  const artifactDirectory = path.join(root, "artifact");
  const repoDirectory = path.join(root, "repo");
  fs.mkdirSync(artifactDirectory);
  fs.mkdirSync(repoDirectory);
  writeFixture(artifactDirectory);
  makeRepoFixture(repoDirectory);

  const latestLogPath = path.join(artifactDirectory, "latest.log");
  fs.unlinkSync(latestLogPath);
  fs.symlinkSync(path.join(artifactDirectory, "latest.summary.log"), latestLogPath);

  assert.throws(
    () => publishArtifact(artifactDirectory, repoDirectory),
    /latest\.log must be a regular file/
  );
}

testPublishesOnlyValidatedOutputs();
testRejectsUnexpectedFiles();
testRejectsInconsistentReports();
testRejectsSymlinkedArtifactFile();
process.stdout.write("publish-smoke-artifact tests passed\n");
