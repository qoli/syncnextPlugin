#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const README_STATUS_START = "<!-- AUTO-SMOKE-STATUS:START -->";
const README_STATUS_END = "<!-- AUTO-SMOKE-STATUS:END -->";
const EXPECTED_SUBSCRIPTIONS_SOURCE =
  "https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json";
const OUTPUT_DIRECTORY = "syncnextPlugin_all_plugin_test_runs";
const FILE_LIMITS = new Map([
  ["latest.json", 5 * 1024 * 1024],
  ["latest.log", 2 * 1024 * 1024],
  ["latest.summary.log", 512 * 1024],
  ["invalid_sources_latest.json", 1024 * 1024],
  ["invalid_sources_latest.txt", 512 * 1024],
]);

function fail(message) {
  throw new Error(`invalid smoke artifact: ${message}`);
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
}

function assertNonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail(`${label} must be a non-negative integer`);
  }
}

function assertOnlyExpectedFiles(artifactDirectory) {
  const entries = fs.readdirSync(artifactDirectory, { withFileTypes: true });
  const actualNames = entries.map((entry) => entry.name).sort();
  const expectedNames = [...FILE_LIMITS.keys()].sort();

  if (
    actualNames.length !== expectedNames.length ||
    actualNames.some((name, index) => name !== expectedNames[index])
  ) {
    fail(`unexpected file set: ${actualNames.join(", ") || "(empty)"}`);
  }

  for (const entry of entries) {
    if (!entry.isFile() || entry.isSymbolicLink()) {
      fail(`${entry.name} must be a regular file`);
    }

    const filePath = path.join(artifactDirectory, entry.name);
    const stat = fs.lstatSync(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      fail(`${entry.name} must be a regular file`);
    }

    const limit = FILE_LIMITS.get(entry.name);
    if (stat.size <= 0 || stat.size > limit) {
      fail(`${entry.name} size ${stat.size} is outside 1..${limit} bytes`);
    }
  }
}

function readJSONFile(filePath, label) {
  let value;
  try {
    value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
  return value;
}

function validateReport(report) {
  assertPlainObject(report, "latest.json");
  assertPlainObject(report.options, "latest.json options");
  assertPlainObject(report.summary, "latest.json summary");

  if (
    typeof report.generatedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(report.generatedAt) ||
    !Number.isFinite(Date.parse(report.generatedAt))
  ) {
    fail("latest.json generatedAt must be an ISO-8601 UTC timestamp");
  }
  if (report.subscriptionsSource !== EXPECTED_SUBSCRIPTIONS_SOURCE) {
    fail("latest.json subscriptionsSource is not the trusted source");
  }
  if (report.options.discovery !== "subscriptions") {
    fail("latest.json discovery mode must be subscriptions");
  }
  if (!Array.isArray(report.plugins)) {
    fail("latest.json plugins must be an array");
  }

  const keys = [
    "pluginsTotal",
    "pluginsWithFatalErrors",
    "casesTotal",
    "ok",
    "fail",
    "invalidSourcesPlugins",
  ];
  for (const key of keys) {
    assertNonNegativeInteger(report.summary[key], `latest.json summary.${key}`);
  }
  if (report.summary.pluginsTotal !== report.plugins.length) {
    fail("latest.json pluginsTotal does not match plugins length");
  }
  if (report.summary.ok + report.summary.fail !== report.summary.casesTotal) {
    fail("latest.json case totals are inconsistent");
  }
  if (report.summary.pluginsWithFatalErrors > report.summary.pluginsTotal) {
    fail("latest.json fatal plugin count exceeds plugin count");
  }
}

function validateInvalidSources(invalidSources, report) {
  assertPlainObject(invalidSources, "invalid_sources_latest.json");
  assertNonNegativeInteger(
    invalidSources.invalidPluginsCount,
    "invalid_sources_latest.json invalidPluginsCount"
  );
  if (!Array.isArray(invalidSources.invalidPlugins)) {
    fail("invalid_sources_latest.json invalidPlugins must be an array");
  }
  if (invalidSources.invalidPluginsCount !== invalidSources.invalidPlugins.length) {
    fail("invalid_sources_latest.json count does not match array length");
  }
  if (invalidSources.invalidPluginsCount !== report.summary.invalidSourcesPlugins) {
    fail("invalid source counts disagree between JSON reports");
  }
}

function buildReadmeSection(report, invalidSources) {
  return [
    `Generated: \`${report.generatedAt}\``,
    `Enabled plugin source: [sourcesv3.json](${EXPECTED_SUBSCRIPTIONS_SOURCE})`,
    "",
    "> Bun/Node smoke status only.",
    "> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.",
    "",
    `- Plugins: \`${report.summary.pluginsTotal}\``,
    `- Cases: \`${report.summary.ok}/${report.summary.casesTotal}\` passed`,
    `- Fatal plugins: \`${report.summary.pluginsWithFatalErrors}\``,
    `- Invalid source entries: \`${invalidSources.invalidPluginsCount}\``,
    "",
    "Detailed diagnostics: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json), and [invalid sources](./syncnextPlugin_all_plugin_test_runs/invalid_sources_latest.json).",
    "Interpretation and rerun rules: [TESTING.md](./TESTING.md).",
  ].join("\n");
}

function updateReadme(repoDirectory, section) {
  const readmePath = path.join(repoDirectory, "README.md");
  const readmeStat = fs.lstatSync(readmePath);
  if (!readmeStat.isFile() || readmeStat.isSymbolicLink()) {
    fail("repository README.md must be a regular file");
  }
  const current = fs.readFileSync(readmePath, "utf8");
  const startCount = current.split(README_STATUS_START).length - 1;
  const endCount = current.split(README_STATUS_END).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    fail("README smoke markers must each occur exactly once");
  }

  const startIndex = current.indexOf(README_STATUS_START);
  const endIndex = current.indexOf(README_STATUS_END);
  if (startIndex >= endIndex) {
    fail("README smoke markers are out of order");
  }

  const block = `${README_STATUS_START}\n${section}\n${README_STATUS_END}`;
  const next =
    current.slice(0, startIndex) +
    block +
    current.slice(endIndex + README_STATUS_END.length);
  fs.writeFileSync(readmePath, next, "utf8");
}

function publishArtifact(artifactDirectory, repoDirectory) {
  const artifactRoot = path.resolve(artifactDirectory);
  const repoRoot = path.resolve(repoDirectory);

  const artifactRootStat = fs.lstatSync(artifactRoot);
  if (!artifactRootStat.isDirectory() || artifactRootStat.isSymbolicLink()) {
    fail("artifact path must be a directory");
  }
  const repoRootStat = fs.lstatSync(repoRoot);
  if (!repoRootStat.isDirectory() || repoRootStat.isSymbolicLink()) {
    fail("repository path must be a directory");
  }

  assertOnlyExpectedFiles(artifactRoot);

  const report = readJSONFile(path.join(artifactRoot, "latest.json"), "latest.json");
  const invalidSources = readJSONFile(
    path.join(artifactRoot, "invalid_sources_latest.json"),
    "invalid_sources_latest.json"
  );
  validateReport(report);
  validateInvalidSources(invalidSources, report);

  const destinationDirectory = path.join(repoRoot, OUTPUT_DIRECTORY);
  fs.mkdirSync(destinationDirectory, { recursive: true });
  const destinationStat = fs.lstatSync(destinationDirectory);
  if (!destinationStat.isDirectory() || destinationStat.isSymbolicLink()) {
    fail(`${OUTPUT_DIRECTORY} must be a regular directory`);
  }
  for (const fileName of FILE_LIMITS.keys()) {
    const destinationPath = path.join(destinationDirectory, fileName);
    if (fs.existsSync(destinationPath)) {
      const existingStat = fs.lstatSync(destinationPath);
      if (!existingStat.isFile() || existingStat.isSymbolicLink()) {
        fail(`${OUTPUT_DIRECTORY}/${fileName} must be a regular file`);
      }
    }
    fs.copyFileSync(
      path.join(artifactRoot, fileName),
      destinationPath
    );
  }

  updateReadme(repoRoot, buildReadmeSection(report, invalidSources));
}

function main(argv) {
  if (argv.length !== 2) {
    throw new Error(
      "usage: publish-smoke-artifact.js <artifact-directory> <repository-directory>"
    );
  }
  publishArtifact(argv[0], argv[1]);
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  buildReadmeSection,
  publishArtifact,
};
