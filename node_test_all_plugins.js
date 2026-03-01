#!/usr/bin/env node

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const vm = require("vm");

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  if (!hit) return fallback;
  return hit.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function toInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function tsCompact() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    p2(d.getMonth() + 1) +
    p2(d.getDate()) +
    "-" +
    p2(d.getHours()) +
    p2(d.getMinutes()) +
    p2(d.getSeconds())
  );
}

function isoNow() {
  return new Date().toISOString();
}

function createLogger(logPath) {
  const stream = fs.createWriteStream(logPath, { flags: "a" });
  return {
    log(msg) {
      const line = String(msg == null ? "" : msg);
      process.stdout.write(line + "\n");
      stream.write(line + "\n");
    },
    error(msg) {
      const line = String(msg == null ? "" : msg);
      process.stderr.write(line + "\n");
      stream.write(line + "\n");
    },
    close() {
      stream.end();
    },
  };
}

function createFetchImpl() {
  if (typeof fetch === "function") {
    return fetch.bind(globalThis);
  }

  try {
    const mod = require("node-fetch");
    return (mod.default || mod);
  } catch (_) {}

  try {
    const fallback = require(path.resolve(
      __dirname,
      "..",
      "SyncnextPlugin_official",
      "node_modules",
      "node-fetch"
    ));
    return fallback.default || fallback;
  } catch (_) {}

  throw new Error("fetch is unavailable. Use Node 18+ or install node-fetch.");
}

const fetchImpl = createFetchImpl();

async function fetchWithTimeout(url, options, timeoutMs) {
  const ms = toInt(timeoutMs, 20000);
  if (typeof AbortController === "function") {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), ms);
    try {
      return await fetchImpl(url, Object.assign({}, options || {}, { signal: ac.signal }));
    } finally {
      clearTimeout(timer);
    }
  }

  return await Promise.race([
    fetchImpl(url, options || {}),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    }),
  ]);
}

function looksLikeURL(input) {
  return /^https?:\/\//i.test(String(input || ""));
}

function removeSyncnextPluginScheme(apiValue) {
  return String(apiValue || "").replace(/^syncnextplugin:\/\//i, "");
}

function headersToObject(headers) {
  const out = {};
  if (headers && typeof headers.forEach === "function") {
    headers.forEach((value, key) => {
      out[key] = value;
    });
  }

  const setCookies = extractSetCookies(headers);
  if (setCookies.length > 0) {
    out["set-cookie"] = setCookies;
    out["Set-Cookie"] = setCookies;
  }
  return out;
}

function extractSetCookies(headers) {
  if (!headers) return [];

  if (typeof headers.getSetCookie === "function") {
    const arr = headers.getSetCookie();
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  }

  if (typeof headers.raw === "function") {
    const raw = headers.raw();
    const arr = raw && raw["set-cookie"];
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  }

  if (typeof headers.get === "function") {
    const value = headers.get("set-cookie");
    if (value) return [value];
  }

  return [];
}

function safeJSONParse(input, fallback) {
  try {
    return JSON.parse(input);
  } catch (_) {
    return fallback;
  }
}

function containsSafeLineMarkers(text) {
  return /safeline|SafeLineChallenge|雷池|\/\.safeline\/|Protected By .*WAF|访问已被拦截|Access Forbidden/i.test(
    String(text || "")
  );
}

function extractHeaderValue(headers, key) {
  const lowerKey = String(key || "").toLowerCase();
  if (!headers || typeof headers !== "object") return "";
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === lowerKey) {
      return String(headers[k] || "");
    }
  }
  return "";
}

function isSafeLineChallenge(status, body, headers) {
  if (Number(status) === 468) return true;
  const text = String(body || "");
  const contentType = extractHeaderValue(headers, "content-type");
  if (/text\/html/i.test(contentType) && containsSafeLineMarkers(text)) return true;
  return containsSafeLineMarkers(text);
}

function compactHTTPEvents(events) {
  return (events || []).slice(-6).map((item) => ({
    method: item.method,
    url: item.url,
    status: item.status,
    safeLine: !!item.safeLine,
    error: item.error || "",
  }));
}

function explainFailure(errorText, httpEvents) {
  const text = String(errorText || "");
  const events = Array.isArray(httpEvents) ? httpEvents : [];
  const safeLineEvents = events.filter((item) => item && item.safeLine);
  if (safeLineEvents.length > 0) {
    return {
      reasonCode: "safeline_challenge_blocked",
      reasonText: "偵測到 SafeLine 挑戰頁，導致播放器頁未返回原始 HTML",
    };
  }

  if (/emptyView:/i.test(text)) {
    return {
      reasonCode: "plugin_empty_view",
      reasonText: "插件回傳 emptyView，未取得可播放地址",
    };
  }

  if (/callback timeout/i.test(text)) {
    return {
      reasonCode: "callback_timeout",
      reasonText: "等待插件回調超時，可能是站點回應慢或頁面結構改版",
    };
  }

  return {
    reasonCode: "unknown",
    reasonText: text || "unknown error",
  };
}

function parseArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload == null) return [];
  if (typeof payload === "string") {
    const text = payload.trim();
    if (!text) return [];
    const parsed = safeJSONParse(text, null);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
    return [];
  }
  if (typeof payload === "object") return [payload];
  return [];
}

function pickMediaDetailURL(media) {
  if (!media || typeof media !== "object") return "";
  const candidates = [
    media.detailURLString,
    media.detailURL,
    media.episodeDetailURL,
    media.href,
    media.url,
    media.id,
  ];

  for (const value of candidates) {
    const text = String(value || "").trim();
    if (looksLikeURL(text)) return text;
  }

  for (const value of candidates) {
    const text = String(value || "").trim();
    if (text) return text;
  }

  return "";
}

function pickEpisodeURL(episode) {
  if (!episode || typeof episode !== "object") return "";
  const candidates = [
    episode.episodeDetailURL,
    episode.detailURLString,
    episode.playURL,
    episode.url,
    episode.id,
  ];
  for (const value of candidates) {
    const text = String(value || "").trim();
    if (looksLikeURL(text)) return text;
  }
  for (const value of candidates) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function normalizePageURL(urlTemplate) {
  return String(urlTemplate || "")
    .replace(/\$\{pageNumber\}/g, "1")
    .replace(/\$\{keyword\}/g, "test");
}

function normalizeSearchURL(urlTemplate, keyword) {
  const safeKeyword = String(keyword || "test").trim() || "test";
  return String(urlTemplate || "")
    .replace(/\$\{keyword\}/g, encodeURIComponent(safeKeyword))
    .replace(/\$\{pageNumber\}/g, "1");
}

function pickSearchKeyword(options, medias) {
  const forced = String(options.searchKeyword || "").trim();
  if (forced) return forced;

  const list = Array.isArray(medias) ? medias : [];
  for (let i = 0; i < list.length; i++) {
    const title = String(list[i] && list[i].title || "").trim();
    if (!title) continue;
    const compact = title.replace(/\s+/g, " ").trim();
    const firstToken = compact.split(" ")[0] || compact;
    return firstToken.slice(0, 12);
  }
  return "test";
}

function pickIndexPage(config) {
  const pages = Array.isArray(config && config.pages) ? config.pages : [];
  if (pages.length === 0) return null;

  let page = pages.find((item) => String(item && item.key || "").toLowerCase() === "index");
  if (!page) {
    page = pages.find((item) => /最近|更新|首頁|首页/i.test(String(item && item.title || "")));
  }
  if (!page) page = pages[0];
  return page;
}

function toAbsoluteFilePathIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) return path.resolve(filePath);
  } catch (_) {}
  return "";
}

async function readLocalText(filePath) {
  return await fsp.readFile(filePath, "utf8");
}

async function readRemoteText(url, timeoutMs) {
  const res = await fetchWithTimeout(
    url,
    {
      method: "GET",
      headers: {
        "User-Agent": DEFAULT_UA,
        Accept: "*/*",
      },
      redirect: "follow",
    },
    timeoutMs
  );

  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  return await res.text();
}

async function listLocalPlugins(pluginRoot) {
  const entries = await fsp.readdir(pluginRoot, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!/^plugin_/i.test(entry.name)) continue;

    const dir = path.join(pluginRoot, entry.name);
    const configPath = path.join(dir, "config.json");
    if (!toAbsoluteFilePathIfExists(configPath)) continue;

    dirs.push({
      folder: entry.name,
      dir,
      configPath,
    });
  }

  dirs.sort((a, b) => a.folder.localeCompare(b.folder));
  return dirs;
}

async function resolvePluginSource(pluginEntry, options) {
  const localDir = pluginEntry.dir;
  const configPath = pluginEntry.configPath;
  const configText = await readLocalText(configPath);

  const config = safeJSONParse(configText, null);
  if (!config || typeof config !== "object") {
    throw new Error(`config.json parse failed: ${configPath}`);
  }

  const files = Array.isArray(config.files) ? config.files.slice() : [];
  if (files.length === 0) {
    throw new Error("config.files is empty");
  }

  const loadedFiles = [];

  for (const fileName of files) {
    const name = String(fileName || "").trim();
    if (!name) continue;

    if (looksLikeURL(name)) {
      const content = await readRemoteText(name, options.requestTimeoutMs);
      loadedFiles.push({ name, source: name, content });
      continue;
    }

    if (/^syncnextplugin:\/\//i.test(name)) {
      const remoteURL = removeSyncnextPluginScheme(name);
      const content = await readRemoteText(remoteURL, options.requestTimeoutMs);
      loadedFiles.push({ name, source: remoteURL, content });
      continue;
    }

    const abs = path.join(localDir, name);
    if (!toAbsoluteFilePathIfExists(abs)) {
      throw new Error(`missing file in config.files: ${abs}`);
    }

    const content = await readLocalText(abs);
    loadedFiles.push({ name, source: abs, content });
  }

  return {
    pluginEntry,
    apiURL: `syncnextplugin://local/${pluginEntry.folder}/config.json`,
    configPath,
    pluginFolder: pluginEntry.folder,
    mode: "local",
    config,
    files: loadedFiles,
  };
}

function buildPlayerResult(callbackType, payload) {
  if (callbackType === "toPlayer") {
    return {
      url: String(payload == null ? "" : payload).trim(),
      headers: {},
      raw: payload,
    };
  }

  if (callbackType === "toPlayerByJSON") {
    const parsed =
      typeof payload === "string"
        ? safeJSONParse(payload, {})
        : (payload && typeof payload === "object" ? payload : {});

    return {
      url: String(parsed.url || "").trim(),
      headers: parsed.headers && typeof parsed.headers === "object" ? parsed.headers : {},
      raw: payload,
    };
  }

  if (callbackType === "toPlayerCandidates") {
    const parsed =
      typeof payload === "string"
        ? safeJSONParse(payload, {})
        : (payload && typeof payload === "object" ? payload : {});
    const list = Array.isArray(parsed.candidates) ? parsed.candidates : [];
    const first = list[0] || {};
    const url = typeof first === "string" ? first : String(first.url || "");
    const headers =
      first && typeof first === "object" && first.headers && typeof first.headers === "object"
        ? first.headers
        : {};
    return {
      url: url.trim(),
      headers,
      raw: payload,
    };
  }

  return { url: "", headers: {}, raw: payload };
}

function buildInvocationAdapter(options) {
  const state = {
    pending: null,
    emptyViews: [],
  };

  function reset() {
    state.pending = null;
    state.emptyViews = [];
  }

  function setPending(expected, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        state.pending = null;
        const hint =
          state.emptyViews.length > 0
            ? `; emptyView=${state.emptyViews[state.emptyViews.length - 1]}`
            : "";
        reject(new Error(`callback timeout (${expected})${hint}`));
      }, timeoutMs);

      state.pending = {
        expected,
        resolve,
        reject,
        timer,
      };
    });
  }

  function clearPending() {
    if (!state.pending) return;
    clearTimeout(state.pending.timer);
    state.pending = null;
  }

  function failPending(error) {
    if (!state.pending) return false;
    const pending = state.pending;
    clearPending();
    const err = error instanceof Error ? error : new Error(String(error || "unknown error"));
    pending.reject(err);
    return true;
  }

  function isAccepted(expected, callbackType) {
    if (expected === "medias") {
      return callbackType === "toMedias" || callbackType === "toSearchMedias";
    }
    if (expected === "episodes") {
      return callbackType === "toEpisodes" || callbackType === "toEpisodesCandidates";
    }
    if (expected === "player") {
      return (
        callbackType === "toPlayer" ||
        callbackType === "toPlayerByJSON" ||
        callbackType === "toPlayerCandidates"
      );
    }
    return false;
  }

  function onCallback(callbackType, payload, key) {
    if (!state.pending) return;
    if (!isAccepted(state.pending.expected, callbackType)) return;

    const pending = state.pending;
    clearPending();
    pending.resolve({
      callbackType,
      payload,
      key,
      emptyViews: state.emptyViews.slice(),
    });
  }

  function onEmptyView(message) {
    const text = String(message == null ? "" : message);
    state.emptyViews.push(text);

    if (
      options.failOnEmptyView &&
      state.pending &&
      (state.pending.expected === "player" || state.pending.expected === "episodes")
    ) {
      const pending = state.pending;
      clearPending();
      pending.reject(new Error(`emptyView: ${text || "unknown"}`));
    }
  }

  async function invoke(context, fnName, args, expected, timeoutMs) {
    reset();
    const fn = context[fnName];
    if (typeof fn !== "function") {
      throw new Error(`function not found: ${fnName}`);
    }

    const waitCallback = setPending(expected, timeoutMs);

    try {
      const ret = fn.apply(context, args || []);
      if (ret && typeof ret.then === "function") {
        ret.catch((error) => {
          if (state.pending) {
            const pending = state.pending;
            clearPending();
            pending.reject(error);
          }
        });
      }
    } catch (error) {
      clearPending();
      throw error;
    }

    return await waitCallback;
  }

  return {
    onCallback,
    onEmptyView,
    invoke,
    failPending,
  };
}

function createPluginRuntime(pluginSource, options, logger) {
  const adapter = buildInvocationAdapter(options);
  const httpEvents = [];

  function pushHTTPEvent(event) {
    httpEvents.push(event);
    if (httpEvents.length > 500) {
      httpEvents.shift();
    }
  }

  async function doHTTP(req, methodOverride) {
    const request = req && typeof req === "object" ? req : {};
    const url = String(request.url || "").trim();
    if (!url) {
      throw new Error("$http.fetch missing req.url");
    }

    const method = String(methodOverride || request.method || "GET").toUpperCase();
    const headers = Object.assign({}, request.headers || {});
    if (!headers["User-Agent"] && !headers["user-agent"]) {
      headers["User-Agent"] = DEFAULT_UA;
    }

    const fetchOptions = {
      method,
      headers,
      redirect: "follow",
    };

    if (method !== "HEAD" && request.body != null && method !== "GET") {
      fetchOptions.body = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
    }

    const event = {
      at: isoNow(),
      method,
      url,
      status: 0,
      safeLine: false,
      error: "",
    };

    try {
      const response = await fetchWithTimeout(url, fetchOptions, options.requestTimeoutMs);
      const responseHeaders = headersToObject(response.headers);
      let body = method === "HEAD" ? "" : await response.text();
      let status = response.status;
      let finalURL = response.url;

      event.status = status;
      event.safeLine = method === "GET" && isSafeLineChallenge(status, body, responseHeaders);

      pushHTTPEvent(event);

      return {
        status,
        statusCode: status,
        headers: responseHeaders,
        body,
        url: finalURL,
      };
    } catch (error) {
      event.error = error.message || String(error);
      if (options.verboseConsole) {
        logger.error(`[http-error] ${method} ${url} -> ${error.message || error}`);
      }
      pushHTTPEvent(event);
      return {
        status: 0,
        statusCode: 0,
        headers: {},
        body: "",
        url,
        error: error.message || String(error),
      };
    }
  }

  const context = {
    console: {
      log: (...args) => {
        if (!options.verboseConsole) return;
        logger.log(
          `[plugin-log] ${args
            .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
            .join(" ")}`
        );
      },
      error: (...args) => {
        logger.error(
          `[plugin-error] ${args
            .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
            .join(" ")}`
        );
      },
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Promise,
    Buffer,
    URL,
    URLSearchParams,
    atob: (input) => Buffer.from(String(input || ""), "base64").toString("binary"),
    btoa: (input) => Buffer.from(String(input || ""), "binary").toString("base64"),
    print: (...args) => {
      if (!options.verboseConsole) return;
      logger.log(
        `[plugin-print] ${args
          .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
          .join(" ")}`
      );
    },
    $http: {
      fetch: (req) => doHTTP(req, null),
      head: (req) => doHTTP(req, "HEAD"),
    },
    $next: {
      toMedias: (json, key) => adapter.onCallback("toMedias", json, key),
      toSearchMedias: (json, key) => adapter.onCallback("toSearchMedias", json, key),
      toEpisodes: (json, key) => adapter.onCallback("toEpisodes", json, key),
      toEpisodesCandidates: (json, key) => adapter.onCallback("toEpisodesCandidates", json, key),
      toPlayer: (value, key) => adapter.onCallback("toPlayer", value, key),
      toPlayerByJSON: (json, key) => adapter.onCallback("toPlayerByJSON", json, key),
      toPlayerCandidates: (json, key) => adapter.onCallback("toPlayerCandidates", json, key),
      emptyView: (msg) => adapter.onEmptyView(msg),
      aliLink: () => {},
      aliPlay: () => {},
    },
  };

  context.window = context;
  context.global = context;
  context.self = context;

  vm.createContext(context);

  for (const file of pluginSource.files) {
    vm.runInContext(file.content, context, {
      filename: file.name,
      timeout: options.vmLoadTimeoutMs,
    });
  }

  function stringifyError(input) {
    if (!input) return "unknown error";
    if (input instanceof Error) return input.message || String(input);
    if (typeof input === "string") return input;
    if (typeof input === "object") {
      if (typeof input.message === "string" && input.message.trim()) {
        return input.message.trim();
      }
      if (typeof input.stack === "string" && input.stack.trim()) {
        return input.stack.trim();
      }
    }
    try {
      return JSON.stringify(input);
    } catch (_) {
      return String(input);
    }
  }

  const onUnhandledRejection = (reason) => {
    const text = stringifyError(reason);
    adapter.failPending(new Error(`plugin unhandledRejection: ${text}`));
    logger.error(`[plugin-unhandledRejection] ${text}`);
  };

  const onUncaughtException = (error) => {
    const text = stringifyError(error);
    adapter.failPending(new Error(`plugin uncaughtException: ${text}`));
    logger.error(`[plugin-uncaughtException] ${text}`);
  };

  process.on("unhandledRejection", onUnhandledRejection);
  process.on("uncaughtException", onUncaughtException);

  return {
    context,
    invoke: (fnName, args, expected, timeoutMs) =>
      adapter.invoke(context, fnName, args, expected, timeoutMs),
    getHTTPEvents: () => httpEvents.slice(),
    getHTTPEventsSince: (index) => httpEvents.slice(index || 0),
    dispose: () => {
      process.off("unhandledRejection", onUnhandledRejection);
      process.off("uncaughtException", onUncaughtException);
    },
  };
}

function stageTimeoutMs(stageConfig, fallbackMs) {
  const sec = Number(stageConfig && stageConfig.timeout);
  if (Number.isFinite(sec) && sec > 0) {
    return Math.max(fallbackMs, Math.floor(sec * 1000) + 5000);
  }
  return fallbackMs;
}

function uniqueList(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const text = String(item || "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

async function checkConnectivityURL(url, options) {
  const result = {
    url: String(url || ""),
    ok: false,
    method: "HEAD",
    status: 0,
    error: "",
  };

  const target = String(url || "").trim();
  if (!looksLikeURL(target)) {
    result.error = "non-http url";
    return result;
  }

  const headers = {
    "User-Agent": DEFAULT_UA,
    Accept: "*/*",
  };

  try {
    const headRes = await fetchWithTimeout(
      target,
      { method: "HEAD", headers, redirect: "follow" },
      options.connectivityTimeoutMs
    );
    result.status = headRes.status;
    if (headRes.status >= 200 && headRes.status < 400) {
      result.ok = true;
      return result;
    }
  } catch (error) {
    result.error = error.message || String(error);
  }

  result.method = "GET";
  try {
    const getRes = await fetchWithTimeout(
      target,
      {
        method: "GET",
        headers: Object.assign({}, headers, { Range: "bytes=0-1023" }),
        redirect: "follow",
      },
      options.connectivityTimeoutMs
    );
    result.status = getRes.status;
    if (getRes.status >= 200 && getRes.status < 400) {
      result.ok = true;
      result.error = "";
      return result;
    }
    if (!result.error) {
      result.error = `status ${getRes.status}`;
    }
  } catch (error) {
    result.error = error.message || String(error);
  }

  return result;
}

async function runConnectivityCheck(source, indexURL, options) {
  const searchTemplate = String(
    source && source.config && source.config.search && source.config.search.url || ""
  ).trim();
  const searchURL = searchTemplate ? normalizeSearchURL(searchTemplate, "test") : "";

  const targets = uniqueList([
    source && source.config ? source.config.host : "",
    indexURL,
    searchURL,
  ]).filter((item) => looksLikeURL(item));

  const checks = [];
  for (const target of targets) {
    checks.push(await checkConnectivityURL(target, options));
  }

  return {
    ok: checks.some((item) => item.ok),
    targets: checks,
  };
}

async function probePlayableURL(url, headers, options) {
  const result = {
    ok: false,
    method: "HEAD",
    status: 0,
    contentType: "",
    error: "",
  };

  const target = String(url || "").trim();
  if (!looksLikeURL(target)) {
    result.error = "non-http url";
    return result;
  }

  const reqHeaders = Object.assign({}, headers || {});
  if (!reqHeaders["User-Agent"] && !reqHeaders["user-agent"]) {
    reqHeaders["User-Agent"] = DEFAULT_UA;
  }

  try {
    const headRes = await fetchWithTimeout(
      target,
      {
        method: "HEAD",
        headers: reqHeaders,
        redirect: "follow",
      },
      options.probeTimeoutMs
    );
    result.status = headRes.status;
    result.contentType = headRes.headers.get("content-type") || "";

    if (headRes.status >= 200 && headRes.status < 400) {
      result.ok = true;
      return result;
    }
  } catch (error) {
    result.error = error.message || String(error);
  }

  result.method = "GET";
  const getHeaders = Object.assign({}, reqHeaders, { Range: "bytes=0-1023" });

  try {
    const getRes = await fetchWithTimeout(
      target,
      {
        method: "GET",
        headers: getHeaders,
        redirect: "follow",
      },
      options.probeTimeoutMs
    );

    const body = await getRes.text();
    const contentType = getRes.headers.get("content-type") || "";

    result.status = getRes.status;
    result.contentType = contentType;

    const looksLikeMediaType =
      /mpegurl|video|octet-stream|application\/vnd\.apple\.mpegurl|audio/i.test(contentType);
    const looksLikeM3U8 = /^#EXTM3U/i.test(String(body || "").trim());
    const looksLikeMediaURL = /\.(m3u8|mp4|m4v|mov|flv|ts)(\?|$)/i.test(target);

    if (getRes.status >= 200 && getRes.status < 400 && (looksLikeMediaType || looksLikeM3U8 || looksLikeMediaURL)) {
      result.ok = true;
      return result;
    }

    if (!result.error) {
      result.error = `status ${getRes.status}`;
    }
  } catch (error) {
    result.error = error.message || String(error);
  }

  return result;
}

function buildSubscriptionLabel(entry, index) {
  const name = String(entry && (entry.folder || entry.name || entry.title) || "").trim();
  if (name) return name;
  return `plugin-${index + 1}`;
}

function isReservedPluginFolder(folderName) {
  return String(folderName || "").trim().toLowerCase() === "plugin_blueprint";
}

function isIgnoredInvalidFailure(pluginReport, caseItem) {
  const reasonCode = String(caseItem && caseItem.reasonCode || "");
  const stage = String(caseItem && caseItem.stage || "");
  const pluginFolder = String(pluginReport && pluginReport.pluginFolder || "").toLowerCase();

  // "失效播放源"只看播放鏈路，不把搜尋與連通性納入失效來源。
  if (stage === "search" || stage === "connectivity") {
    return true;
  }

  // Safeline 阻擋屬於防火牆挑戰，不視為來源失效。
  if (pluginFolder === "plugin_czzy" && reasonCode === "safeline_challenge_blocked") {
    return true;
  }

  return false;
}

function buildInvalidSourcesReport(pluginReports) {
  const invalidPlugins = [];

  for (const plugin of pluginReports || []) {
    if (isReservedPluginFolder(plugin && plugin.pluginFolder)) {
      continue;
    }

    const failedCases = (plugin.cases || []).filter((item) => !item.ok);
    const effectiveFailedCases = failedCases.filter((item) => !isIgnoredInvalidFailure(plugin, item));
    const hasFatalErrors = Array.isArray(plugin.errors) && plugin.errors.length > 0;

    if (!hasFatalErrors && effectiveFailedCases.length === 0) {
      continue;
    }

    const reasonCounts = {};
    for (const item of effectiveFailedCases) {
      const key = String(item.reasonCode || "unknown");
      reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    }
    if (hasFatalErrors && Object.keys(reasonCounts).length === 0) {
      reasonCounts.fatal_error = (plugin.errors || []).length;
    }

    invalidPlugins.push({
      pluginFolder: plugin.pluginFolder || "",
      pluginName: plugin.pluginName || plugin.subscriptionName || "",
      api: plugin.api || "",
      reasonCounts,
      fatalErrors: plugin.errors || [],
      failedCases: effectiveFailedCases,
    });
  }

  return {
    generatedAt: isoNow(),
    invalidPluginsCount: invalidPlugins.length,
    invalidPlugins,
  };
}

async function runSinglePlugin(pluginEntry, index, options, logger) {
  const startedAt = isoNow();
  const pluginReport = {
    index: index + 1,
    subscriptionName: buildSubscriptionLabel(pluginEntry, index),
    api: `syncnextplugin://local/${pluginEntry.folder}/config.json`,
    startedAt,
    endedAt: "",
    mode: "",
    pluginName: "",
    pluginFolder: "",
    indexPage: null,
    connectivity: null,
    summary: {
      casesTotal: 0,
      ok: 0,
      fail: 0,
    },
    cases: [],
    errors: [],
  };

  let runtime = null;
  try {
    const source = await resolvePluginSource(pluginEntry, options);
    pluginReport.mode = source.mode;
    pluginReport.pluginFolder = source.pluginFolder;
    pluginReport.pluginName = String(source.config.name || pluginReport.subscriptionName);
    runtime = createPluginRuntime(source, options, logger);

    function buildFailureMeta(errorText, stageEvents) {
      const explained = explainFailure(errorText, stageEvents);
      return {
        reasonCode: explained.reasonCode,
        reasonText: explained.reasonText,
        httpDiagnostics: compactHTTPEvents(stageEvents),
      };
    }

    const indexPage = pickIndexPage(source.config);
    if (!indexPage || !indexPage.javascript || !indexPage.url) {
      throw new Error("index page config missing");
    }

    const indexURL = normalizePageURL(indexPage.url);
    const indexTimeout = stageTimeoutMs(indexPage, options.invokeTimeoutMs);
    const episodesTimeout = stageTimeoutMs(source.config.episodes, options.invokeTimeoutMs);
    const playerTimeout = stageTimeoutMs(source.config.player, options.invokeTimeoutMs);
    pluginReport.indexPage = {
      key: indexPage.key || "",
      title: indexPage.title || "",
      url: indexURL,
      javascript: indexPage.javascript,
    };

    logger.log(
      `[plugin ${index + 1}] ${pluginReport.pluginName} | mode=${source.mode} | index=${indexURL}`
    );

    if (options.enableConnectivityCheck) {
      const connectivity = await runConnectivityCheck(source, indexURL, options);
      pluginReport.connectivity = connectivity;
      const firstOK = (connectivity.targets || []).find((item) => item.ok);
      logger.log(
        `[${connectivity.ok ? "OK" : "FAIL"}] ${pluginReport.pluginName} | connectivity -> ${connectivity.targets.length} target(s)` +
        (firstOK ? `, pass=${firstOK.url}` : "")
      );
      pluginReport.cases.push({
        ok: connectivity.ok,
        stage: "connectivity",
        mediaTitle: "",
        episodeTitle: "",
        detailURL: firstOK ? firstOK.url : ((connectivity.targets[0] && connectivity.targets[0].url) || ""),
        episodeURL: "",
        playURL: "",
        probe: null,
        error: connectivity.ok ? "" : "all connectivity targets failed",
        reasonCode: connectivity.ok ? "" : "connectivity_failed",
        reasonText: connectivity.ok ? "" : "插件站點連通性檢查失敗",
        httpDiagnostics: (connectivity.targets || []).map((item) => ({
          method: item.method,
          url: item.url,
          status: item.status,
          error: item.error || "",
        })),
      });
      if (!connectivity.ok && options.strictConnectivityCheck) {
        throw new Error("connectivity check failed");
      }
    }

    const mediasResult = await runtime.invoke(
      indexPage.javascript,
      [indexURL, source.apiURL],
      "medias",
      indexTimeout
    );
    const medias = parseArrayPayload(mediasResult.payload);
    const selectedMedias =
      options.limitMedias > 0 ? medias.slice(0, options.limitMedias) : medias.slice();

    logger.log(
      `[plugin ${index + 1}] medias total=${medias.length}, testing=${selectedMedias.length}`
    );
    if (options.printMediasSample && medias.length > 0) {
      const sampleIndex = Math.max(0, Math.min(options.printMediasSampleIndex, medias.length - 1));
      const sample = medias[sampleIndex];
      logger.log(
        `[plugin ${index + 1}] buildMedias sample(index=${sampleIndex})\n${JSON.stringify(sample, null, 2)}`
      );
    }

    if (options.enableSearchTest && source.config && source.config.search) {
      const searchConfig = source.config.search || {};
      const searchFunc = String(searchConfig.javascript || "").trim();
      const searchURLTemplate = String(searchConfig.url || "").trim();

      if (searchFunc && searchURLTemplate) {
        const searchKeyword = pickSearchKeyword(options, medias);
        const searchURL = normalizeSearchURL(searchURLTemplate, searchKeyword);
        const searchTimeout = stageTimeoutMs(searchConfig, options.invokeTimeoutMs);
        logger.log(
          `[plugin ${index + 1}] search keyword=${searchKeyword} url=${searchURL}`
        );

        const searchHTTPIndex = runtime.getHTTPEvents().length;
        try {
          const searchResult = await runtime.invoke(
            searchFunc,
            [searchURL, source.apiURL],
            "medias",
            searchTimeout
          );
          const searchMedias = parseArrayPayload(searchResult.payload);
          logger.log(
            `[plugin ${index + 1}] search results=${searchMedias.length}`
          );
          if (options.printSearchSample && searchMedias.length > 0) {
            const sampleIndex = Math.max(
              0,
              Math.min(options.printSearchSampleIndex, searchMedias.length - 1)
            );
            const sample = searchMedias[sampleIndex];
            logger.log(
              `[plugin ${index + 1}] search sample(index=${sampleIndex})\n${JSON.stringify(sample, null, 2)}`
            );
          }

          const ok = searchMedias.length > 0;
          pluginReport.cases.push({
            ok,
            stage: "search",
            mediaTitle: `keyword:${searchKeyword}`,
            episodeTitle: "",
            detailURL: searchURL,
            episodeURL: "",
            playURL: "",
            probe: null,
            error: ok ? "" : "search returned empty medias",
            reasonCode: ok ? "" : "search_empty",
            reasonText: ok ? "" : "搜尋執行成功但結果為空",
            httpDiagnostics: ok ? [] : compactHTTPEvents(runtime.getHTTPEventsSince(searchHTTPIndex)),
          });
          logger.log(
            `[${ok ? "OK" : "FAIL"}] ${pluginReport.pluginName} | search(${searchKeyword}) -> ${searchMedias.length}`
          );
        } catch (error) {
          const stageEvents = runtime.getHTTPEventsSince(searchHTTPIndex);
          const failureMeta = buildFailureMeta(error.message || String(error), stageEvents);
          pluginReport.cases.push({
            ok: false,
            stage: "search",
            mediaTitle: `keyword:${searchKeyword}`,
            episodeTitle: "",
            detailURL: searchURL,
            episodeURL: "",
            playURL: "",
            probe: null,
            error: error.message || String(error),
            reasonCode: failureMeta.reasonCode,
            reasonText: failureMeta.reasonText,
            httpDiagnostics: failureMeta.httpDiagnostics,
          });
          logger.log(
            `[FAIL] ${pluginReport.pluginName} | search(${searchKeyword}) -> ${error.message || error} | reason=${failureMeta.reasonCode}`
          );
        }
      } else {
        logger.log(
          `[plugin ${index + 1}] search skipped: missing search.url or search.javascript`
        );
      }
    }

    if (selectedMedias.length === 0) {
      const mediaFailure = explainFailure("no medias returned", runtime.getHTTPEvents());
      throw new Error(`no medias returned; ${mediaFailure.reasonText}`);
    }

    for (let mediaIndex = 0; mediaIndex < selectedMedias.length; mediaIndex++) {
      const media = selectedMedias[mediaIndex];
      const mediaTitle = String(media && media.title || `media-${mediaIndex + 1}`);
      const detailURL = pickMediaDetailURL(media);

      if (!detailURL) {
        const failureMeta = buildFailureMeta("detailURL missing", []);
        pluginReport.cases.push({
          ok: false,
          stage: "episodes",
          mediaTitle,
          episodeTitle: "",
          detailURL: "",
          episodeURL: "",
          playURL: "",
          probe: null,
          error: "detailURL missing",
          reasonCode: failureMeta.reasonCode,
          reasonText: failureMeta.reasonText,
          httpDiagnostics: failureMeta.httpDiagnostics,
        });
        logger.log(`[FAIL] ${pluginReport.pluginName} | ${mediaTitle} | detailURL missing`);
        continue;
      }

      let episodesResult;
      const episodesHTTPIndex = runtime.getHTTPEvents().length;
      try {
        episodesResult = await runtime.invoke(
          source.config.episodes && source.config.episodes.javascript,
          [detailURL],
          "episodes",
          episodesTimeout
        );
      } catch (error) {
        const stageEvents = runtime.getHTTPEventsSince(episodesHTTPIndex);
        const failureMeta = buildFailureMeta(error.message || String(error), stageEvents);
        pluginReport.cases.push({
          ok: false,
          stage: "episodes",
          mediaTitle,
          episodeTitle: "",
          detailURL,
          episodeURL: "",
          playURL: "",
          probe: null,
          error: error.message || String(error),
          reasonCode: failureMeta.reasonCode,
          reasonText: failureMeta.reasonText,
          httpDiagnostics: failureMeta.httpDiagnostics,
        });
        logger.log(
          `[FAIL] ${pluginReport.pluginName} | ${mediaTitle} | episodes -> ${error.message || error} | reason=${failureMeta.reasonCode}`
        );
        continue;
      }

      let episodes = [];
      if (episodesResult.callbackType === "toEpisodesCandidates") {
        const parsed =
          typeof episodesResult.payload === "string"
            ? safeJSONParse(episodesResult.payload, {})
            : (episodesResult.payload && typeof episodesResult.payload === "object"
                ? episodesResult.payload
                : {});
        const candidates = Array.isArray(parsed)
          ? parsed
          : (Array.isArray(parsed.candidates) ? parsed.candidates : []);
        const firstCandidate = candidates[0] || {};
        episodes = parseArrayPayload(firstCandidate.list || firstCandidate.episodes || []);
      } else {
        episodes = parseArrayPayload(episodesResult.payload);
      }

      const targetEpisodes = options.allEpisodes ? episodes : episodes.slice(0, 1);
      if (targetEpisodes.length === 0) {
        const failureMeta = buildFailureMeta("no episodes", runtime.getHTTPEventsSince(episodesHTTPIndex));
        pluginReport.cases.push({
          ok: false,
          stage: "episodes",
          mediaTitle,
          episodeTitle: "",
          detailURL,
          episodeURL: "",
          playURL: "",
          probe: null,
          error: "no episodes",
          reasonCode: failureMeta.reasonCode,
          reasonText: failureMeta.reasonText,
          httpDiagnostics: failureMeta.httpDiagnostics,
        });
        logger.log(
          `[FAIL] ${pluginReport.pluginName} | ${mediaTitle} | no episodes | reason=${failureMeta.reasonCode}`
        );
        continue;
      }

      for (let epIndex = 0; epIndex < targetEpisodes.length; epIndex++) {
        const episode = targetEpisodes[epIndex];
        const episodeTitle = String(episode && episode.title || `episode-${epIndex + 1}`);
        const episodeURL = pickEpisodeURL(episode);

        if (!episodeURL) {
          const failureMeta = buildFailureMeta("episodeURL missing", []);
          pluginReport.cases.push({
            ok: false,
            stage: "player",
            mediaTitle,
            episodeTitle,
            detailURL,
            episodeURL: "",
            playURL: "",
            probe: null,
            error: "episodeURL missing",
            reasonCode: failureMeta.reasonCode,
            reasonText: failureMeta.reasonText,
            httpDiagnostics: failureMeta.httpDiagnostics,
          });
          logger.log(
            `[FAIL] ${pluginReport.pluginName} | ${mediaTitle} | ${episodeTitle} | episodeURL missing | reason=${failureMeta.reasonCode}`
          );
          continue;
        }

        const playerHTTPIndex = runtime.getHTTPEvents().length;
        try {
          const playerCallback = await runtime.invoke(
            source.config.player && source.config.player.javascript,
            [episodeURL],
            "player",
            playerTimeout
          );

          const player = buildPlayerResult(playerCallback.callbackType, playerCallback.payload);
          const playURL = String(player.url || "").trim();
          if (!playURL) {
            const failureMeta = buildFailureMeta("empty play url", runtime.getHTTPEventsSince(playerHTTPIndex));
            pluginReport.cases.push({
              ok: false,
              stage: "player",
              mediaTitle,
              episodeTitle,
              detailURL,
              episodeURL,
              playURL: "",
              probe: null,
              error: "empty play url",
              reasonCode: failureMeta.reasonCode,
              reasonText: failureMeta.reasonText,
              httpDiagnostics: failureMeta.httpDiagnostics,
            });
            logger.log(
              `[FAIL] ${pluginReport.pluginName} | ${mediaTitle} | ${episodeTitle} -> empty play url | reason=${failureMeta.reasonCode}`
            );
            continue;
          }

          let probe = null;
          if (options.enableProbe) {
            probe = await probePlayableURL(playURL, player.headers, options);
          }

          const ok = options.strictProbe ? !!(probe && probe.ok) : true;
          pluginReport.cases.push({
            ok,
            stage: "player",
            mediaTitle,
            episodeTitle,
            detailURL,
            episodeURL,
            playURL,
            probe,
            error: ok ? "" : (probe && probe.error ? probe.error : "probe failed"),
            reasonCode: ok ? "" : "probe_failed",
            reasonText: ok ? "" : "播放鏈可取得，但 probe 檢測未通過",
            httpDiagnostics: ok ? [] : compactHTTPEvents(runtime.getHTTPEventsSince(playerHTTPIndex)),
          });

          logger.log(
            `[${ok ? "OK" : "FAIL"}] ${pluginReport.pluginName} | ${mediaTitle} | ${episodeTitle} -> ${playURL}`
          );
        } catch (error) {
          const stageEvents = runtime.getHTTPEventsSince(playerHTTPIndex);
          const failureMeta = buildFailureMeta(error.message || String(error), stageEvents);
          pluginReport.cases.push({
            ok: false,
            stage: "player",
            mediaTitle,
            episodeTitle,
            detailURL,
            episodeURL,
            playURL: "",
            probe: null,
            error: error.message || String(error),
            reasonCode: failureMeta.reasonCode,
            reasonText: failureMeta.reasonText,
            httpDiagnostics: failureMeta.httpDiagnostics,
          });
          logger.log(
            `[FAIL] ${pluginReport.pluginName} | ${mediaTitle} | ${episodeTitle} -> ${error.message || error} | reason=${failureMeta.reasonCode}`
          );
        }
      }
    }
  } catch (error) {
    pluginReport.errors.push(error.message || String(error));
  } finally {
    if (runtime && typeof runtime.dispose === "function") {
      runtime.dispose();
    }
  }

  pluginReport.summary.casesTotal = pluginReport.cases.length;
  pluginReport.summary.ok = pluginReport.cases.filter((item) => item.ok).length;
  pluginReport.summary.fail = pluginReport.cases.filter((item) => !item.ok).length;
  pluginReport.endedAt = isoNow();

  return pluginReport;
}

async function main() {
  const timestamp = tsCompact();
  const pluginRoot = path.resolve(getArg("plugin-root", __dirname));
  const outputDir = path.resolve(getArg("output-dir", __dirname));
  const outputFolderName = getArg("output-folder", "syncnextPlugin_all_plugin_test_runs");
  const managedOutputRoot = path.join(outputDir, outputFolderName);
  const runOutputDir = path.join(managedOutputRoot, timestamp);
  const limitMedias = toInt(getArg("limit-medias", "3"), 3);
  const invokeTimeoutMs = toInt(getArg("invoke-timeout-ms", "45000"), 45000);
  const requestTimeoutMs = toInt(getArg("request-timeout-ms", "25000"), 25000);
  const probeTimeoutMs = toInt(getArg("probe-timeout-ms", "15000"), 15000);
  const vmLoadTimeoutMs = toInt(getArg("vm-load-timeout-ms", "8000"), 8000);
  const connectivityTimeoutMs = toInt(getArg("connectivity-timeout-ms", "12000"), 12000);
  const maxPlugins = toInt(getArg("max-plugins", "0"), 0);
  const printMediasSampleIndex = toInt(getArg("print-medias-sample-index", "0"), 0);
  const printSearchSampleIndex = toInt(getArg("print-search-sample-index", "0"), 0);
  const searchKeyword = String(getArg("search-keyword", "") || "").trim();
  const onlyFilter = String(getArg("only", "") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const excludeFilter = String(getArg("exclude", "") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const options = {
    pluginRoot,
    limitMedias,
    allEpisodes: hasFlag("all-episodes"),
    strictProbe: hasFlag("strict-probe"),
    enableProbe: !hasFlag("no-probe"),
    failOnEmptyView: !hasFlag("allow-emptyview"),
    invokeTimeoutMs,
    requestTimeoutMs,
    probeTimeoutMs,
    connectivityTimeoutMs,
    vmLoadTimeoutMs,
    verboseConsole: hasFlag("verbose-console"),
    printMediasSample: !hasFlag("no-print-medias-sample"),
    printMediasSampleIndex,
    enableConnectivityCheck: !hasFlag("skip-connectivity-check"),
    strictConnectivityCheck: hasFlag("strict-connectivity-check"),
    enableSearchTest: !hasFlag("skip-search-test"),
    printSearchSample: !hasFlag("no-print-search-sample"),
    printSearchSampleIndex,
    searchKeyword,
  };

  await fsp.mkdir(runOutputDir, { recursive: true });

  const logPath = path.join(runOutputDir, "run.log");
  const reportPath = path.join(runOutputDir, "report.json");
  const latestPath = path.join(managedOutputRoot, "latest.json");
  const latestLogPath = path.join(managedOutputRoot, "latest.log");
  const invalidSourcesDir = path.join(runOutputDir, "invalid_sources");
  const invalidSourcesPath = path.join(invalidSourcesDir, "invalid_sources.json");
  const invalidSourcesTxtPath = path.join(invalidSourcesDir, "invalid_sources.txt");
  const invalidSourcesLatestPath = path.join(managedOutputRoot, "invalid_sources_latest.json");
  const invalidSourcesLatestTxtPath = path.join(managedOutputRoot, "invalid_sources_latest.txt");

  const logger = createLogger(logPath);
  logger.log(`[log] ${logPath}`);
  logger.log(`[plugin-root] ${pluginRoot}`);
  logger.log(`[output] ${reportPath}`);

  try {
    const discoveredAll = await listLocalPlugins(pluginRoot);
    const discovered = discoveredAll.filter((entry) => !isReservedPluginFolder(entry.folder));
    let filtered = discovered.slice();
    if (onlyFilter.length > 0) {
      filtered = filtered.filter((entry) => {
        const folder = entry.folder.toLowerCase();
        const short = folder.replace(/^plugin_/, "");
        return onlyFilter.includes(folder) || onlyFilter.includes(short);
      });
    }
    if (excludeFilter.length > 0) {
      filtered = filtered.filter((entry) => {
        const folder = entry.folder.toLowerCase();
        const short = folder.replace(/^plugin_/, "");
        return !excludeFilter.includes(folder) && !excludeFilter.includes(short);
      });
    }
    if (maxPlugins > 0) {
      filtered = filtered.slice(0, maxPlugins);
    }

    logger.log(
      `[plugins] discovered=${discovered.length}, testing=${filtered.length}, reservedSkipped=${discoveredAll.length - discovered.length}`
    );

    const pluginReports = [];
    for (let i = 0; i < filtered.length; i++) {
      const entry = filtered[i];
      const report = await runSinglePlugin(entry, i, options, logger);
      pluginReports.push(report);
    }

    const allCases = pluginReports.flatMap((item) => item.cases);
    const invalidSources = buildInvalidSourcesReport(pluginReports);
    const report = {
      generatedAt: isoNow(),
      pluginRoot,
      outputDir: runOutputDir,
      options: {
        limitMedias: options.limitMedias,
        allEpisodes: options.allEpisodes,
        strictProbe: options.strictProbe,
        enableProbe: options.enableProbe,
        invokeTimeoutMs: options.invokeTimeoutMs,
        requestTimeoutMs: options.requestTimeoutMs,
        probeTimeoutMs: options.probeTimeoutMs,
        connectivityTimeoutMs: options.connectivityTimeoutMs,
        pluginRoot: options.pluginRoot,
        only: onlyFilter,
        exclude: excludeFilter,
        enableConnectivityCheck: options.enableConnectivityCheck,
        strictConnectivityCheck: options.strictConnectivityCheck,
        printMediasSample: options.printMediasSample,
        printMediasSampleIndex: options.printMediasSampleIndex,
        enableSearchTest: options.enableSearchTest,
        printSearchSample: options.printSearchSample,
        printSearchSampleIndex: options.printSearchSampleIndex,
        searchKeyword: options.searchKeyword,
      },
      summary: {
        pluginsTotal: pluginReports.length,
        pluginsWithFatalErrors: pluginReports.filter((item) => item.errors.length > 0).length,
        casesTotal: allCases.length,
        ok: allCases.filter((item) => item.ok).length,
        fail: allCases.filter((item) => !item.ok).length,
        invalidSourcesPlugins: invalidSources.invalidPluginsCount,
      },
      testedPluginFolders: filtered.map((item) => item.folder),
      reservedSkippedPluginFolders: discoveredAll
        .map((item) => item.folder)
        .filter((folder) => isReservedPluginFolder(folder)),
      invalidSourcesSummary: {
        invalidPluginsCount: invalidSources.invalidPluginsCount,
      },
      plugins: pluginReports,
    };

    await fsp.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
    await fsp.writeFile(latestPath, JSON.stringify(report, null, 2) + "\n", "utf8");
    await fsp.copyFile(logPath, latestLogPath);
    await fsp.mkdir(invalidSourcesDir, { recursive: true });
    await fsp.writeFile(invalidSourcesPath, JSON.stringify(invalidSources, null, 2) + "\n", "utf8");
    await fsp.writeFile(
      invalidSourcesTxtPath,
      (invalidSources.invalidPlugins || [])
        .map((item) => {
          const reasonText = Object.entries(item.reasonCounts || {})
            .map((entry) => `${entry[0]}:${entry[1]}`)
            .join(",");
          return [
            item.pluginFolder || "",
            item.pluginName || "",
            item.api || "",
            reasonText || "-",
            `fatal=${Array.isArray(item.fatalErrors) ? item.fatalErrors.length : 0}`,
          ].join("\t");
        })
        .join("\n") + "\n",
      "utf8"
    );
    await fsp.writeFile(invalidSourcesLatestPath, JSON.stringify(invalidSources, null, 2) + "\n", "utf8");
    await fsp.copyFile(invalidSourcesTxtPath, invalidSourcesLatestTxtPath);

    logger.log(
      `[summary] plugins=${report.summary.pluginsTotal}, fatal=${report.summary.pluginsWithFatalErrors}, cases=${report.summary.casesTotal}, ok=${report.summary.ok}, fail=${report.summary.fail}, invalidSources=${report.summary.invalidSourcesPlugins}`
    );
    logger.log(`[report] ${reportPath}`);
    logger.log(`[latest] ${latestPath}`);
    logger.log(`[latest-log] ${latestLogPath}`);
    logger.log(`[invalid-sources] ${invalidSourcesPath}`);
    logger.log(`[invalid-sources-latest] ${invalidSourcesLatestPath}`);

    if (report.summary.fail > 0 || report.summary.pluginsWithFatalErrors > 0) {
      process.exitCode = 1;
    }
  } finally {
    logger.close();
  }
}

main().catch((error) => {
  process.stderr.write(`[fatal] ${error.message || error}\n`);
  process.exit(1);
});
