#!/usr/bin/env node

const crypto = require("crypto");
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..");
const arguments = process.argv.slice(2);
const checkOnly = arguments.includes("--check");
const requestedPlugins = arguments.filter((argument) => argument !== "--check");

function discoverPlugins() {
  return fs.readdirSync(repositoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith("plugin_") && !name.endsWith("_regression"))
    .filter((name) => fs.existsSync(path.join(repositoryRoot, name, "config.json")))
    .sort();
}

function fail(message) {
  console.error(`Plugin cache manifest error: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`Plugin cache manifest warning: ${message}`);
}

function gitObjectID(resourcePath, repositoryRelativePath, noFilters) {
  const gitArguments = ["hash-object"];
  gitArguments.push(noFilters ? "--no-filters" : `--path=${repositoryRelativePath}`);
  gitArguments.push(resourcePath);
  return childProcess.execFileSync("git", gitArguments, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function warnIfGitChangesPublishedBytes(resourcePath, repositoryRelativePath) {
  let workingTreeObjectID;
  let publishedObjectID;
  try {
    workingTreeObjectID = gitObjectID(resourcePath, repositoryRelativePath, true);
    publishedObjectID = gitObjectID(resourcePath, repositoryRelativePath, false);
  } catch {
    warn(`${repositoryRelativePath} could not be checked against Git clean filters`);
    return;
  }

  if (workingTreeObjectID === publishedObjectID) {
    return;
  }

  warn(
    `${repositoryRelativePath} is changed by Git clean filters before publication; `
      + "the generated Hash may not match GitHub Raw. Normalize the file or add an explicit .gitattributes rule.",
  );
}

function validateChallenge(pluginName, config) {
  if (config.challenge === undefined) {
    return;
  }

  const challenge = config.challenge;
  const expectedKeys = ["mode", "schema", "scope"];
  if (!challenge || typeof challenge !== "object" || Array.isArray(challenge)
      || JSON.stringify(Object.keys(challenge).sort()) !== JSON.stringify(expectedKeys)) {
    throw new Error(
      `${pluginName}/config.json challenge must contain exactly schema, mode, and scope`,
    );
  }
  if (challenge.schema !== 1 || challenge.mode !== "managed" || challenge.scope !== "hosts") {
    throw new Error(`${pluginName}/config.json contains an unsupported challenge configuration`);
  }

  const declaredOrigins = [config.host, ...(config.hosts || [])];
  if (declaredOrigins.length === 0 || !declaredOrigins.every((value) => typeof value === "string")) {
    throw new Error(`${pluginName}/config.json challenge requires string host/hosts origins`);
  }
  for (const value of declaredOrigins) {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${pluginName}/config.json contains an invalid challenge origin: ${value}`);
    }
    if (!["http:", "https:"].includes(url.protocol)
        || url.username || url.password || url.search || url.hash
        || (url.pathname !== "/" && url.pathname !== "")) {
      throw new Error(`${pluginName}/config.json challenge origin must be an exact HTTP(S) origin: ${value}`);
    }
  }
}

function expectedCache(pluginName, config) {
  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error(`${pluginName}/config.json must declare a non-empty files array`);
  }
  if (new Set(config.files).size !== config.files.length) {
    throw new Error(`${pluginName}/config.json files must be unique`);
  }

  const pluginRoot = path.join(repositoryRoot, pluginName);
  const resources = {};
  for (const file of config.files) {
    if (typeof file !== "string" || file.length === 0) {
      throw new Error(`${pluginName}/config.json contains an invalid file path`);
    }
    const resourcePath = path.resolve(pluginRoot, file);
    if (!resourcePath.startsWith(`${pluginRoot}${path.sep}`)) {
      throw new Error(`${pluginName}/${file} is outside the plugin directory`);
    }
    if (!fs.statSync(resourcePath).isFile()) {
      throw new Error(`${pluginName}/${file} is not a regular file`);
    }
    const repositoryRelativePath = path.relative(repositoryRoot, resourcePath);
    warnIfGitChangesPublishedBytes(resourcePath, repositoryRelativePath);
    const data = fs.readFileSync(resourcePath);
    resources[file] = {
      sha256: crypto.createHash("sha256").update(data).digest("hex"),
      bytes: data.length,
    };
  }
  return { schema: 1, resources };
}

const plugins = requestedPlugins.length > 0 ? requestedPlugins : discoverPlugins();
if (plugins.length === 0) {
  fail("no plugin directories selected");
}

for (const pluginName of plugins) {
  try {
    if (!/^plugin_[a-z0-9_]+$/.test(pluginName)) {
      throw new Error(`invalid plugin directory: ${pluginName}`);
    }
    const configPath = path.join(repositoryRoot, pluginName, "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    validateChallenge(pluginName, config);
    const expected = expectedCache(pluginName, config);

    if (checkOnly) {
      if (JSON.stringify(config.cache) !== JSON.stringify(expected)) {
        throw new Error(`${pluginName}/config.json cache is missing or stale`);
      }
      console.log(`verified ${pluginName}`);
      continue;
    }

    config.cache = expected;
    const output = `${JSON.stringify(config, null, 2)}\n`;
    const temporaryPath = `${configPath}.tmp-${process.pid}`;
    fs.writeFileSync(temporaryPath, output);
    fs.renameSync(temporaryPath, configPath);
    console.log(`updated ${pluginName}`);
  } catch (error) {
    fail(error.message);
  }
}
