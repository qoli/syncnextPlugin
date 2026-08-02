#!/usr/bin/env node

const crypto = require("crypto");
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
