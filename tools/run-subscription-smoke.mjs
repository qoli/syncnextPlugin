#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const harnessRoot = path.resolve(process.env.SYNCNEXT_CHALLENGE_HARNESS || path.join(repositoryRoot, "../Syncnext"));
const outputRoot = path.join(homedir(), "Library/Logs/SyncnextPluginSmoke");
const cacheRoot = path.join(homedir(), "Library/Caches/SyncnextPluginSmoke");
const coreRoot = path.join(cacheRoot, "challenge-core");
const targetsPath = path.join(harnessRoot, "Tests/ChallengeCanary/targets.json");
const swift = process.env.SYNCNEXT_CHALLENGE_SWIFT || path.join(
  homedir(), "Library/Developer/Toolchains/swift-6.4.1-RELEASE.xctoolchain/usr/bin/swift"
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: repositoryRoot, stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

mkdirSync(outputRoot, { recursive: true });
mkdirSync(cacheRoot, { recursive: true });
console.log(`[local-smoke] node=${process.version} harness=${harnessRoot}`);

run("/bin/bash", [path.join(harnessRoot, "Scripts/build_challenge_canary_core.sh"), coreRoot], {
  env: {
    ...process.env,
    SYNCNEXT_CHALLENGE_NODE: process.execPath,
    SYNCNEXT_CHALLENGE_SWIFT: swift,
    SYNCNEXT_CHALLENGE_SWIFT_SDK: process.env.SYNCNEXT_CHALLENGE_SWIFT_SDK || "swift-6.4.1-RELEASE_wasm",
    SYNCNEXT_CHALLENGE_BUILD_ROOT: path.join(cacheRoot, "build"),
  },
});
run(process.execPath, [
  path.join(harnessRoot, "Tools/challenge-canary/discover.mjs"),
  repositoryRoot,
  targetsPath,
  path.join(outputRoot, "managed-targets.json"),
]);
run(process.execPath, [
  path.join(repositoryRoot, "node_test_all_plugins.js"),
  "--discovery=subscriptions",
  "--subscriptions-url=https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json",
  `--output-dir=${outputRoot}`,
  "--history-mode=latest-only",
  "--strict-probe",
  "--smoke-fail-exit=soft",
  `--challenge-adapter-module=${path.join(harnessRoot, "Tools/challenge-smoke/adapter.mjs")}`,
  `--challenge-core-wasm=${path.join(coreRoot, "plugin-challenge-core-cli.wasm")}`,
  `--challenge-calculator-wasm=${path.join(coreRoot, "safeline-calculator.wasm")}`,
  `--challenge-targets-file=${targetsPath}`,
  "--require-managed-challenge",
]);
