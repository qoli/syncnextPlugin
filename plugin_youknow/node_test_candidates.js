#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DEFAULT_TIMEOUT_MS = 45000;
const ROOT = path.resolve(__dirname, "..");
const FILES = [
  path.join(__dirname, "txml.js"),
  path.join(__dirname, "app.js"),
];

const CASES = [
  {
    detailURL: "https://www.youknow.tv/d/199071/",
    expectedEpisodes: 13,
    episodeIndex: 1,
    expectedSources: 3,
  },
  {
    detailURL: "https://www.youknow.tv/d/198954/",
    expectedEpisodes: 12,
    episodeIndex: 8,
    expectedSources: 2,
  },
  {
    detailURL: "https://www.youknow.tv/d/136094/",
    expectedEpisodes: 65,
    episodeIndex: 60,
    expectedSources: 2,
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function headersToObject(headers) {
  const out = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

async function doHTTP(req, methodOverride) {
  const request = req && typeof req === "object" ? req : {};
  const url = String(request.url || "").trim();
  if (!url) {
    throw new Error("$http.fetch missing req.url");
  }

  const method = String(methodOverride || request.method || "GET").toUpperCase();
  const headers = Object.assign({}, request.headers || {});
  const options = {
    method,
    headers,
    redirect: "follow",
  };

  if (method !== "GET" && method !== "HEAD" && request.body != null) {
    options.body = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
  }

  const response = await fetch(url, options);
  const body = method === "HEAD" ? "" : await response.text();
  return {
    status: response.status,
    statusCode: response.status,
    headers: headersToObject(response.headers),
    body,
    url: response.url,
  };
}

function normalizeCandidates(payload) {
  const parsed =
    typeof payload === "string"
      ? JSON.parse(payload)
      : (payload && typeof payload === "object" ? payload : []);
  const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.candidates) ? parsed.candidates : []);
  return list.map((item) => ({
    url: String(item && item.url || "").trim(),
    headers: item && item.headers && typeof item.headers === "object" ? item.headers : {},
  })).filter((item) => item.url);
}

function createRuntime() {
  const state = {
    pending: null,
  };

  const context = {
    console,
    Buffer,
    URL,
    URLSearchParams,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    atob: (input) => Buffer.from(String(input || ""), "base64").toString("binary"),
    btoa: (input) => Buffer.from(String(input || ""), "binary").toString("base64"),
    print: (...args) => console.log("[plugin-print]", ...args),
    $http: {
      fetch: (req) => doHTTP(req, null),
      head: (req) => doHTTP(req, "HEAD"),
    },
    $next: {
      toMedias: (payload, key) => onCallback("toMedias", payload, key),
      toSearchMedias: (payload, key) => onCallback("toSearchMedias", payload, key),
      toEpisodes: (payload, key) => onCallback("toEpisodes", payload, key),
      toEpisodesCandidates: (payload, key) => onCallback("toEpisodesCandidates", payload, key),
      toPlayer: (payload, key) => onCallback("toPlayer", payload, key),
      toPlayerByJSON: (payload, key) => onCallback("toPlayerByJSON", payload, key),
      toPlayerCandidates: (payload, key) => onCallback("toPlayerCandidates", payload, key),
      emptyView: (message) => {
        if (!state.pending) return;
        const pending = state.pending;
        clearTimeout(pending.timer);
        state.pending = null;
        pending.reject(new Error(`emptyView: ${String(message || "")}`));
      },
      aliLink: () => {},
      aliPlay: () => {},
    },
  };

  function onCallback(type, payload, key) {
    if (!state.pending) return;
    if (!state.pending.expected.has(type)) return;
    const pending = state.pending;
    clearTimeout(pending.timer);
    state.pending = null;
    pending.resolve({ callbackType: type, payload, key });
  }

  context.window = context;
  context.global = context;
  context.self = context;

  vm.createContext(context);
  for (const filePath of FILES) {
    const code = fs.readFileSync(filePath, "utf8");
    vm.runInContext(code, context, {
      filename: path.relative(ROOT, filePath),
      timeout: 8000,
    });
  }

  async function invoke(fnName, args, expectedTypes, timeoutMs) {
    const fn = context[fnName];
    if (typeof fn !== "function") {
      throw new Error(`function not found: ${fnName}`);
    }

    return await new Promise((resolve, reject) => {
      state.pending = {
        expected: new Set(expectedTypes),
        resolve,
        reject,
        timer: setTimeout(() => {
          state.pending = null;
          reject(new Error(`callback timeout (${fnName})`));
        }, timeoutMs || DEFAULT_TIMEOUT_MS),
      };

      try {
        const ret = fn.apply(context, args || []);
        if (ret && typeof ret.then === "function") {
          ret.catch((error) => {
            if (!state.pending) return;
            const pending = state.pending;
            clearTimeout(pending.timer);
            state.pending = null;
            pending.reject(error);
          });
        }
      } catch (error) {
        const pending = state.pending;
        clearTimeout(pending.timer);
        state.pending = null;
        reject(error);
      }
    });
  }

  return { context, invoke };
}

async function runCase(runtime, testCase) {
  const episodesResult = await runtime.invoke(
    "Episodes",
    [testCase.detailURL],
    ["toEpisodes"],
    DEFAULT_TIMEOUT_MS
  );
  const episodes = JSON.parse(episodesResult.payload);

  assert(
    Array.isArray(episodes) && episodes.length === testCase.expectedEpisodes,
    `${testCase.detailURL} expected ${testCase.expectedEpisodes} episodes, got ${episodes.length}`
  );

  const episode = episodes[testCase.episodeIndex - 1];
  assert(episode, `${testCase.detailURL} missing aligned episode ${testCase.episodeIndex}`);

  const payload = runtime.context.parseEpisodePayload(episode.episodeDetailURL);
  assert(payload, `${testCase.detailURL} episode payload missing`);
  assert(
    Array.isArray(payload.candidates) && payload.candidates.length === testCase.expectedSources,
    `${testCase.detailURL} episode ${testCase.episodeIndex} expected ${testCase.expectedSources} sources, got ${payload.candidates && payload.candidates.length}`
  );

  const playerResult = await runtime.invoke(
    "Player",
    [episode.episodeDetailURL],
    ["toPlayerCandidates", "toPlayerByJSON", "toPlayer"],
    DEFAULT_TIMEOUT_MS
  );

  assert(
    playerResult.callbackType === "toPlayerCandidates",
    `${testCase.detailURL} episode ${testCase.episodeIndex} expected toPlayerCandidates, got ${playerResult.callbackType}`
  );

  const candidates = normalizeCandidates(playerResult.payload);
  assert(
    candidates.length === testCase.expectedSources,
    `${testCase.detailURL} episode ${testCase.episodeIndex} expected ${testCase.expectedSources} play candidates, got ${candidates.length}`
  );

  const seen = new Set();
  for (const candidate of candidates) {
    assert(/^https?:\/\//i.test(candidate.url), `invalid candidate url: ${candidate.url}`);
    assert(!seen.has(candidate.url), `duplicate candidate url: ${candidate.url}`);
    seen.add(candidate.url);
  }

  console.log(
    `[OK] ${testCase.detailURL} ep=${testCase.episodeIndex} episodes=${episodes.length} sources=${payload.candidates.length} candidates=${candidates.length}`
  );
}

async function main() {
  const runtime = createRuntime();
  for (const testCase of CASES) {
    await runCase(runtime, testCase);
  }
  console.log("[DONE] plugin_youknow candidate regression passed");
}

main().catch((error) => {
  console.error("[FAIL]", error && error.message ? error.message : error);
  process.exitCode = 1;
});
