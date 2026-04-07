#!/usr/bin/env node

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const vm = require("vm");

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
const DEFAULT_SUBSCRIPTIONS_URL =
  "https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json";
const README_STATUS_START = "<!-- AUTO-SMOKE-STATUS:START -->";
const README_STATUS_END = "<!-- AUTO-SMOKE-STATUS:END -->";

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

function isSyncnextPluginURL(input) {
  return /^syncnextplugin:\/\//i.test(String(input || "").trim());
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

function safeParseURL(input) {
  try {
    return new URL(String(input || ""));
  } catch (_) {
    return null;
  }
}

function defaultCookiePath(pathname) {
  const p = String(pathname || "");
  if (!p || p[0] !== "/") return "/";
  if (p === "/") return "/";
  const idx = p.lastIndexOf("/");
  if (idx <= 0) return "/";
  return p.slice(0, idx) || "/";
}

function getHeaderKeyCaseInsensitive(headers, key) {
  const lower = String(key || "").toLowerCase();
  if (!headers || typeof headers !== "object") return "";
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === lower) return k;
  }
  return "";
}

function getHeaderValueCaseInsensitive(headers, key) {
  const hit = getHeaderKeyCaseInsensitive(headers, key);
  if (!hit) return "";
  return String(headers[hit] || "");
}

function setHeaderValueCaseInsensitive(headers, key, value) {
  const hit = getHeaderKeyCaseInsensitive(headers, key);
  if (hit) {
    headers[hit] = value;
    return;
  }
  headers[key] = value;
}

function mergeCookieHeaderValues(values) {
  const seen = new Set();
  const out = [];
  for (const value of values || []) {
    const text = String(value || "").trim();
    if (!text) continue;
    const parts = text
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
    for (const token of parts) {
      const eq = token.indexOf("=");
      if (eq <= 0) continue;
      const name = token.slice(0, eq).trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key);
      out.push(token);
    }
  }
  return out.join("; ");
}

function parseSetCookieLine(line, requestURLObj) {
  const text = String(line || "").trim();
  if (!text) return null;

  const chunks = text.split(";").map((item) => item.trim()).filter(Boolean);
  if (chunks.length === 0) return null;

  const first = chunks.shift();
  const eq = first.indexOf("=");
  if (eq <= 0) return null;

  const name = first.slice(0, eq).trim();
  const value = first.slice(eq + 1).trim();
  if (!name) return null;

  const attrs = {};
  for (const chunk of chunks) {
    const idx = chunk.indexOf("=");
    if (idx < 0) {
      attrs[chunk.toLowerCase()] = true;
      continue;
    }
    const k = chunk.slice(0, idx).trim().toLowerCase();
    const v = chunk.slice(idx + 1).trim();
    attrs[k] = v;
  }

  const reqHost = String(requestURLObj && requestURLObj.hostname || "").toLowerCase();
  if (!reqHost) return null;

  let domain = String(attrs.domain || "").trim().toLowerCase().replace(/^\./, "");
  let hostOnly = true;
  if (!domain) {
    domain = reqHost;
  } else {
    hostOnly = false;
    if (!(reqHost === domain || reqHost.endsWith(`.${domain}`))) {
      return null;
    }
  }

  let cookiePath = String(attrs.path || "").trim();
  if (!cookiePath || cookiePath[0] !== "/") {
    cookiePath = defaultCookiePath(requestURLObj.pathname || "/");
  }

  let expiresAt = 0;
  if (attrs["max-age"] != null) {
    const sec = Number(attrs["max-age"]);
    if (Number.isFinite(sec)) {
      expiresAt = Date.now() + sec * 1000;
    }
  } else if (attrs.expires) {
    const ts = Date.parse(attrs.expires);
    if (Number.isFinite(ts)) {
      expiresAt = ts;
    }
  }

  return {
    name,
    value,
    domain,
    hostOnly,
    path: cookiePath,
    secure: !!attrs.secure,
    expiresAt,
  };
}

function isCookieExpired(cookie) {
  const t = Number(cookie && cookie.expiresAt || 0);
  return Number.isFinite(t) && t > 0 && t <= Date.now();
}

function upsertCookie(jar, cookie) {
  const list = Array.isArray(jar) ? jar : [];
  const idx = list.findIndex(
    (item) =>
      item &&
      item.name === cookie.name &&
      item.domain === cookie.domain &&
      item.path === cookie.path
  );

  if (!cookie.value || isCookieExpired(cookie)) {
    if (idx >= 0) list.splice(idx, 1);
    return;
  }

  if (idx >= 0) {
    list[idx] = cookie;
  } else {
    list.push(cookie);
  }
}

function buildCookieHeaderForURL(jar, inputURL) {
  const urlObj = safeParseURL(inputURL);
  if (!urlObj) return "";

  const host = String(urlObj.hostname || "").toLowerCase();
  const pathname = String(urlObj.pathname || "/");
  const isHTTPS = String(urlObj.protocol || "").toLowerCase() === "https:";
  const pairs = [];

  for (const cookie of Array.isArray(jar) ? jar : []) {
    if (!cookie || !cookie.name) continue;
    if (isCookieExpired(cookie)) continue;
    if (cookie.secure && !isHTTPS) continue;

    const domain = String(cookie.domain || "").toLowerCase();
    const hostOnly = !!cookie.hostOnly;
    const domainOK = hostOnly
      ? host === domain
      : host === domain || host.endsWith(`.${domain}`);
    if (!domainOK) continue;

    const cookiePath = String(cookie.path || "/");
    if (!pathname.startsWith(cookiePath)) continue;

    pairs.push(`${cookie.name}=${cookie.value}`);
  }

  return pairs.join("; ");
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

function derivePluginFolderFromConfigURL(configURL) {
  const urlObj = safeParseURL(configURL);
  if (!urlObj) return "";
  const parts = String(urlObj.pathname || "")
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^plugin_/i.test(parts[i])) {
      return parts[i];
    }
  }
  return "";
}

async function listSubscriptionPlugins(options) {
  const subscriptionsFile = String(options.subscriptionsFile || "").trim();
  const subscriptionsURL = String(options.subscriptionsURL || "").trim();

  if (!subscriptionsFile && !subscriptionsURL) {
    throw new Error("subscriptions discovery requires --subscriptions-url or --subscriptions-file");
  }

  let text = "";
  let source = "";
  if (subscriptionsFile) {
    const abs = path.resolve(subscriptionsFile);
    text = await readLocalText(abs);
    source = abs;
  } else {
    text = await readRemoteText(subscriptionsURL, options.requestTimeoutMs);
    source = subscriptionsURL;
  }

  const parsed = safeJSONParse(text, null);
  if (!Array.isArray(parsed)) {
    throw new Error(`subscriptions parse failed: ${source}`);
  }

  const items = [];
  for (let index = 0; index < parsed.length; index++) {
    const item = parsed[index];
    const api = String(item && item.api || "").trim();
    if (!isSyncnextPluginURL(api)) continue;

    const configURL = removeSyncnextPluginScheme(api);
    const pluginFolder = derivePluginFolderFromConfigURL(configURL);
    const sourceName = String(
      (item && (item.name || item.title)) || pluginFolder || `subscription-${index + 1}`
    ).trim();

    items.push({
      mode: "subscriptions",
      folder: pluginFolder || `subscription_${index + 1}`,
      pluginFolder,
      name: sourceName,
      title: String(item && item.title || "").trim(),
      sourceName,
      sourceSearch: !!(item && item.Search),
      sourceTop: !!(item && item.Top),
      sourceNote: String(item && item.note || "").trim(),
      sourceIndex: index,
      api,
      configURL,
    });
  }

  return {
    source,
    items,
  };
}

function resolveRelativeURL(input, baseURL) {
  try {
    return new URL(String(input || ""), baseURL).toString();
  } catch (_) {
    return "";
  }
}

async function resolvePluginSource(pluginEntry, options) {
  const isRemote = pluginEntry.mode === "subscriptions";
  const localDir = pluginEntry.dir;
  const configPath = pluginEntry.configPath;
  const configURL = pluginEntry.configURL;
  const configText = isRemote
    ? await readRemoteText(configURL, options.requestTimeoutMs)
    : await readLocalText(configPath);

  const config = safeJSONParse(configText, null);
  if (!config || typeof config !== "object") {
    throw new Error(`config.json parse failed: ${isRemote ? configURL : configPath}`);
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

    if (isSyncnextPluginURL(name)) {
      const remoteURL = removeSyncnextPluginScheme(name);
      const content = await readRemoteText(remoteURL, options.requestTimeoutMs);
      loadedFiles.push({ name, source: remoteURL, content });
      continue;
    }

    if (isRemote) {
      const remoteURL = resolveRelativeURL(name, configURL);
      if (!remoteURL) {
        throw new Error(`invalid relative remote file in config.files: ${name}`);
      }
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
    apiURL: isRemote ? pluginEntry.api : `syncnextplugin://local/${pluginEntry.folder}/config.json`,
    configPath: isRemote ? configURL : configPath,
    pluginFolder: pluginEntry.pluginFolder || pluginEntry.folder,
    mode: isRemote ? "subscriptions" : "local",
    config,
    files: loadedFiles,
    sourceName: pluginEntry.sourceName || pluginEntry.name || pluginEntry.folder || "",
    sourceTitle: pluginEntry.title || "",
    sourceNote: pluginEntry.sourceNote || "",
    sourceSearch: !!pluginEntry.sourceSearch,
    sourceTop: !!pluginEntry.sourceTop,
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
  const cookieJar = [];

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

    const inlineCookie = getHeaderValueCaseInsensitive(headers, "Cookie");
    const jarCookie = buildCookieHeaderForURL(cookieJar, url);
    const bootstrapCookie = String(options.defaultCookieHeader || "").trim();
    const mergedCookie = mergeCookieHeaderValues([inlineCookie, jarCookie, bootstrapCookie]);
    if (mergedCookie) {
      setHeaderValueCaseInsensitive(headers, "Cookie", mergedCookie);
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
      const setCookies = extractSetCookies(response.headers);
      const cookieURL = safeParseURL(finalURL) || safeParseURL(url);
      if (setCookies.length > 0 && cookieURL) {
        for (const line of setCookies) {
          const parsed = parseSetCookieLine(line, cookieURL);
          if (parsed) upsertCookie(cookieJar, parsed);
        }
      }

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
  const name = String(
    entry && (entry.sourceName || entry.name || entry.title || entry.folder) || ""
  ).trim();
  if (name) return name;
  return `plugin-${index + 1}`;
}

function buildEntryFilterTokens(entry) {
  const tokens = new Set();
  const candidates = [
    entry && entry.folder,
    entry && entry.pluginFolder,
    entry && entry.name,
    entry && entry.title,
    entry && entry.sourceName,
  ];

  for (const value of candidates) {
    const text = String(value || "").trim().toLowerCase();
    if (!text) continue;
    tokens.add(text);
    if (/^plugin_/i.test(text)) {
      tokens.add(text.replace(/^plugin_/, ""));
    }
  }

  return Array.from(tokens);
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
    api: pluginEntry.api || `syncnextplugin://local/${pluginEntry.folder}/config.json`,
    startedAt,
    endedAt: "",
    mode: "",
    pluginName: "",
    pluginFolder: "",
    sourceTitle: "",
    sourceNote: "",
    searchEnabled: false,
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
    pluginReport.api = source.apiURL;
    pluginReport.mode = source.mode;
    pluginReport.pluginFolder = source.pluginFolder;
    pluginReport.pluginName = String(source.config.name || pluginReport.subscriptionName);
    pluginReport.sourceTitle = source.sourceTitle || "";
    pluginReport.sourceNote = source.sourceNote || "";
    pluginReport.searchEnabled = !!(source.sourceSearch || source.config.search);
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

function buildReasonCountsForPlugin(pluginReport) {
  const counts = {};
  for (const item of pluginReport && pluginReport.cases || []) {
    if (!item || item.ok) continue;
    const key = String(item.reasonCode || "unknown");
    counts[key] = (counts[key] || 0) + 1;
  }
  if (
    Array.isArray(pluginReport && pluginReport.errors) &&
    pluginReport.errors.length > 0 &&
    Object.keys(counts).length === 0
  ) {
    counts.fatal_error = pluginReport.errors.length;
  }
  return counts;
}

function formatReasonCounts(reasonCounts) {
  const entries = Object.entries(reasonCounts || {});
  if (entries.length === 0) return "-";
  return entries.map((entry) => `${entry[0]}:${entry[1]}`).join(", ");
}

function determinePluginSmokeStatus(pluginReport) {
  if (Array.isArray(pluginReport && pluginReport.errors) && pluginReport.errors.length > 0) {
    return "Bun Smoke Fatal";
  }

  const summary = pluginReport && pluginReport.summary || {};
  const ok = Number(summary.ok || 0);
  const fail = Number(summary.fail || 0);

  if (fail <= 0) return "Bun Smoke OK";
  if (ok > 0) return "Bun Smoke Partial";
  return "Bun Smoke Fail";
}

function compactSmokeStatus(pluginReport) {
  return determinePluginSmokeStatus(pluginReport).replace(/^Bun Smoke\s+/, "");
}

function getStageCases(pluginReport, stage) {
  return (pluginReport && pluginReport.cases || []).filter((item) => item && item.stage === stage);
}

function getSearchCase(pluginReport) {
  return getStageCases(pluginReport, "search")[0] || null;
}

function getPlayerCases(pluginReport) {
  return getStageCases(pluginReport, "player");
}

function countConnectivityTargets(pluginReport) {
  const targets = Array.isArray(pluginReport && pluginReport.connectivity && pluginReport.connectivity.targets)
    ? pluginReport.connectivity.targets
    : [];
  const pass = targets.filter((item) => item && item.ok).length;
  return {
    pass,
    total: targets.length,
  };
}

function formatConnectivityStatus(pluginReport) {
  const counts = countConnectivityTargets(pluginReport);
  if (counts.total <= 0) return "N/A";
  return `${pluginReport && pluginReport.connectivity && pluginReport.connectivity.ok ? "OK" : "Fail"} ${counts.pass}/${counts.total}`;
}

function formatSearchStatus(pluginReport) {
  if (!(pluginReport && pluginReport.searchEnabled)) {
    return "Skipped";
  }

  const searchCase = getSearchCase(pluginReport);
  if (!searchCase) return "Not Run";
  if (searchCase.ok) return "OK";
  if (String(searchCase.reasonCode || "") === "search_empty") return "Empty";
  return "Fail";
}

function formatPlaybackStatus(pluginReport) {
  const cases = getPlayerCases(pluginReport);
  if (cases.length === 0) return "Not Reached";

  const ok = cases.filter((item) => item.ok).length;
  if (ok === cases.length) return `OK ${ok}/${cases.length}`;
  if (ok === 0) return `Fail 0/${cases.length}`;
  return `Partial ${ok}/${cases.length}`;
}

function formatCaseCounts(pluginReport) {
  const summary = pluginReport && pluginReport.summary || {};
  return `${Number(summary.ok || 0)}/${Number(summary.casesTotal || 0)}`;
}

function formatCaseLabel(caseItem) {
  const titleParts = [];
  if (caseItem && caseItem.mediaTitle) titleParts.push(caseItem.mediaTitle);
  if (caseItem && caseItem.episodeTitle) titleParts.push(caseItem.episodeTitle);
  if (titleParts.length === 0 && caseItem && caseItem.stage === "search") {
    titleParts.push(caseItem.mediaTitle || "search");
  }
  return titleParts.join(" | ") || String(caseItem && caseItem.stage || "case");
}

function formatHTTPDiagnosticsLines(httpDiagnostics) {
  const lines = [];
  for (const item of httpDiagnostics || []) {
    lines.push(
      `  - \`${item.method || "GET"} ${item.status || 0}\` ${item.url || "-"}${item.safeLine ? " | safeline" : ""}${item.error ? ` | ${item.error}` : ""}`
    );
  }
  return lines;
}

function escapeMarkdownTableCell(input) {
  return String(input == null ? "" : input)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function buildSummaryLog(report, invalidSources, meta) {
  const lines = [];
  lines.push(`generated_at=${report.generatedAt}`);
  lines.push(`runner=bun`);
  lines.push(`discovery=${meta.discovery}`);
  if (meta.subscriptionsSource) {
    lines.push(`subscriptions_source=${meta.subscriptionsSource}`);
  }
  lines.push(
    `summary plugins=${report.summary.pluginsTotal} fatal=${report.summary.pluginsWithFatalErrors} cases=${report.summary.casesTotal} ok=${report.summary.ok} fail=${report.summary.fail} invalidSources=${report.summary.invalidSourcesPlugins}`
  );
  lines.push(
    "disclaimer=Bun/Node smoke test only; it does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability."
  );
  lines.push("");
  lines.push("[plugins]");
  for (const plugin of report.plugins || []) {
    const reasonText = formatReasonCounts(buildReasonCountsForPlugin(plugin));
    lines.push(
      `- ${plugin.pluginFolder || "-"} | ${plugin.pluginName || plugin.subscriptionName || "-"} | overall=${compactSmokeStatus(plugin)} | conn=${formatConnectivityStatus(plugin)} | search=${formatSearchStatus(plugin)} | playback=${formatPlaybackStatus(plugin)} | cases=${formatCaseCounts(plugin)} | reasons=${reasonText}`
    );
  }

  lines.push("");
  lines.push("[invalid_sources]");
  if (!invalidSources || !Array.isArray(invalidSources.invalidPlugins) || invalidSources.invalidPlugins.length === 0) {
    lines.push("- none");
  } else {
    for (const item of invalidSources.invalidPlugins) {
      lines.push(
        `- ${item.pluginFolder || "-"} | ${item.pluginName || "-"} | ${formatReasonCounts(item.reasonCounts)} | fatal=${Array.isArray(item.fatalErrors) ? item.fatalErrors.length : 0}`
      );
    }
  }

  return lines.join("\n") + "\n";
}

function buildPluginDetailsMarkdown(plugin) {
  const lines = [];
  const reasonText = formatReasonCounts(buildReasonCountsForPlugin(plugin));
  const searchCase = getSearchCase(plugin);
  const playerCases = getPlayerCases(plugin);
  const failedCases = (plugin.cases || []).filter((item) => item && !item.ok);
  const summaryLine =
    `${plugin.pluginName || plugin.subscriptionName || "-"} · ${compactSmokeStatus(plugin)} · ` +
    `conn=${formatConnectivityStatus(plugin)} · search=${formatSearchStatus(plugin)} · ` +
    `playback=${formatPlaybackStatus(plugin)} · reasons=${reasonText}`;

  lines.push(`<details>`);
  lines.push(`<summary>${escapeMarkdownTableCell(summaryLine)}</summary>`);
  lines.push("");
  lines.push(`- Folder: \`${plugin.pluginFolder || "-"}\``);
  lines.push(`- Entry: \`${plugin.subscriptionName || "-"}\``);
  lines.push(`- Overall: \`${compactSmokeStatus(plugin)}\``);
  lines.push(`- Cases: \`${formatCaseCounts(plugin)}\``);
  lines.push(`- Reasons: \`${reasonText}\``);
  if (plugin.sourceNote) {
    lines.push(`- Note: ${plugin.sourceNote}`);
  }

  if (Array.isArray(plugin.errors) && plugin.errors.length > 0) {
    lines.push(`- Fatal Errors:`);
    for (const error of plugin.errors) {
      lines.push(`  - \`${error}\``);
    }
  }

  lines.push("");
  lines.push(`Connectivity`);
  for (const target of (plugin.connectivity && plugin.connectivity.targets) || []) {
    lines.push(
      `- [${target.ok ? "OK" : "FAIL"}] \`${target.method || "GET"} ${target.status || 0}\` ${target.url || "-"}${target.error ? ` | ${target.error}` : ""}`
    );
  }
  if (!plugin.connectivity || !Array.isArray(plugin.connectivity.targets) || plugin.connectivity.targets.length === 0) {
    lines.push(`- No connectivity checks recorded`);
  }

  lines.push("");
  lines.push(`Search`);
  if (!plugin.searchEnabled) {
    lines.push(`- Skipped`);
  } else if (!searchCase) {
    lines.push(`- Not run`);
  } else {
    const keyword = String(searchCase.mediaTitle || "").replace(/^keyword:/, "");
    lines.push(`- Status: \`${formatSearchStatus(plugin)}\``);
    lines.push(`- Keyword: \`${keyword || "-"}\``);
    lines.push(`- URL: ${searchCase.detailURL || "-"}`);
    if (!searchCase.ok) {
      lines.push(`- Reason: \`${searchCase.reasonCode || "unknown"}\``);
      lines.push(`- Detail: ${searchCase.reasonText || searchCase.error || "-"}`);
    }
  }

  lines.push("");
  lines.push(`Playback Cases`);
  if (playerCases.length === 0) {
    lines.push(`- Not reached`);
  } else {
    lines.push(`| Result | Media | Episode | Output |`);
    lines.push(`| --- | --- | --- | --- |`);
    for (const item of playerCases) {
      lines.push(
        `| ${item.ok ? "OK" : "FAIL"} | ${escapeMarkdownTableCell(item.mediaTitle || "-")} | ${escapeMarkdownTableCell(item.episodeTitle || "-")} | ${escapeMarkdownTableCell(item.playURL || item.reasonCode || item.error || "-")} |`
      );
    }
  }

  if (failedCases.length > 0) {
    lines.push("");
    lines.push(`Failed Case Diagnostics`);
    for (const item of failedCases) {
      lines.push(
        `- ${formatCaseLabel(item)} | stage=\`${item.stage || "-"}\` | reason=\`${item.reasonCode || "unknown"}\``
      );
      if (item.detailURL) {
        lines.push(`  - detailURL: ${item.detailURL}`);
      }
      if (item.episodeURL) {
        lines.push(`  - episodeURL: ${item.episodeURL}`);
      }
      if (item.playURL) {
        lines.push(`  - playURL: ${item.playURL}`);
      }
      if (item.reasonText) {
        lines.push(`  - detail: ${item.reasonText}`);
      } else if (item.error) {
        lines.push(`  - error: ${item.error}`);
      }
      if (Array.isArray(item.httpDiagnostics) && item.httpDiagnostics.length > 0) {
        lines.push(`  - http diagnostics:`);
        lines.push(...formatHTTPDiagnosticsLines(item.httpDiagnostics));
      }
    }
  }

  lines.push("");
  lines.push(`</details>`);
  return lines.join("\n");
}

function buildReadmeStatusSection(report, invalidSources, meta) {
  const lines = [];
  lines.push(`Generated: \`${report.generatedAt}\``);
  if (meta.subscriptionsSource) {
    lines.push(
      `Enabled plugin source: [sourcesv3.json](${meta.subscriptionsSource})`
    );
  } else {
    lines.push(`Discovery mode: \`${meta.discovery}\``);
  }
  lines.push("");
  lines.push("> Bun/Node smoke status only.");
  lines.push("> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.");
  lines.push("");
  lines.push("| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");

  for (const plugin of report.plugins || []) {
    lines.push(
      `| ${escapeMarkdownTableCell(plugin.pluginName || "-")} | ${escapeMarkdownTableCell(plugin.pluginFolder || "-")} | ${compactSmokeStatus(plugin)} | ${escapeMarkdownTableCell(formatConnectivityStatus(plugin))} | ${escapeMarkdownTableCell(formatSearchStatus(plugin))} | ${escapeMarkdownTableCell(formatPlaybackStatus(plugin))} | ${formatCaseCounts(plugin)} | ${escapeMarkdownTableCell(formatReasonCounts(buildReasonCountsForPlugin(plugin)))} |`
    );
  }

  lines.push("");
  lines.push(`Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)`);
  if (invalidSources && invalidSources.invalidPluginsCount > 0) {
    lines.push("");
    lines.push(`Invalid sources: \`${invalidSources.invalidPluginsCount}\``);
    for (const item of invalidSources.invalidPlugins || []) {
      lines.push(
        `- \`${item.pluginFolder || "-"}\` ${item.pluginName || "-"}: ${formatReasonCounts(item.reasonCounts)}`
      );
    }
  }
  lines.push("");
  lines.push(`### Plugin Details`);
  lines.push("");
  for (const plugin of report.plugins || []) {
    lines.push(buildPluginDetailsMarkdown(plugin));
    lines.push("");
  }

  return lines.join("\n");
}

function buildJobSummary(report) {
  const degraded = (report.plugins || []).filter((plugin) => compactSmokeStatus(plugin) !== "OK");
  const lines = [];
  lines.push(`## Bun Smoke Status`);
  lines.push("");
  lines.push(`Generated: \`${report.generatedAt}\``);
  lines.push("");
  lines.push(`- Plugins: \`${report.summary.pluginsTotal}\``);
  lines.push(`- Cases: \`${report.summary.ok}/${report.summary.casesTotal}\` ok`);
  lines.push(`- Fatal Plugins: \`${report.summary.pluginsWithFatalErrors}\``);
  lines.push(`- Invalid Sources: \`${report.summary.invalidSourcesPlugins}\``);
  lines.push("");

  if (degraded.length === 0) {
    lines.push(`All plugins are currently \`OK\` in Bun smoke status.`);
    return lines.join("\n") + "\n";
  }

  lines.push(`### Degraded Plugins`);
  lines.push("");
  lines.push(`| Plugin | Overall | Connectivity | Search | Playback | Reasons |`);
  lines.push(`| --- | --- | --- | --- | --- | --- |`);
  for (const plugin of degraded) {
    lines.push(
      `| ${escapeMarkdownTableCell(plugin.pluginName || "-")} | ${compactSmokeStatus(plugin)} | ${escapeMarkdownTableCell(formatConnectivityStatus(plugin))} | ${escapeMarkdownTableCell(formatSearchStatus(plugin))} | ${escapeMarkdownTableCell(formatPlaybackStatus(plugin))} | ${escapeMarkdownTableCell(formatReasonCounts(buildReasonCountsForPlugin(plugin)))} |`
    );
  }
  lines.push("");
  lines.push(`See README for full plugin-by-plugin details.`);
  return lines.join("\n") + "\n";
}

async function updateReadmeStatus(readmePath, sectionMarkdown) {
  const abs = path.resolve(readmePath);
  const current = await readLocalText(abs);
  const block = `${README_STATUS_START}\n${sectionMarkdown}\n${README_STATUS_END}`;

  let next = current;
  if (current.includes(README_STATUS_START) && current.includes(README_STATUS_END)) {
    const pattern = new RegExp(
      `${README_STATUS_START}[\\s\\S]*?${README_STATUS_END}`,
      "m"
    );
    next = current.replace(pattern, block);
  } else {
    const suffix = current.endsWith("\n") ? "" : "\n";
    next =
      current +
      suffix +
      "\n## Automated Bun Smoke Status\n\n" +
      block +
      "\n";
  }

  if (next !== current) {
    await fsp.writeFile(abs, next, "utf8");
  }
}

async function writeJobSummary(summaryPath, content) {
  if (!summaryPath) return;
  await fsp.writeFile(path.resolve(summaryPath), content, "utf8");
}

async function main() {
  const timestamp = tsCompact();
  const pluginRoot = path.resolve(getArg("plugin-root", __dirname));
  const outputDir = path.resolve(getArg("output-dir", __dirname));
  const outputFolderName = getArg("output-folder", "syncnextPlugin_all_plugin_test_runs");
  const discovery = String(getArg("discovery", "local") || "local").trim().toLowerCase();
  const historyMode = String(getArg("history-mode", "keep") || "keep").trim().toLowerCase();
  const smokeFailExit = String(getArg("smoke-fail-exit", "hard") || "hard").trim().toLowerCase();
  const updateReadmePath = String(getArg("update-readme", "") || "").trim();
  const jobSummaryFile = String(getArg("job-summary-file", "") || "").trim();
  const subscriptionsURL = String(
    getArg("subscriptions-url", DEFAULT_SUBSCRIPTIONS_URL) || DEFAULT_SUBSCRIPTIONS_URL
  ).trim();
  const subscriptionsFile = String(getArg("subscriptions-file", "") || "").trim();
  const managedOutputRoot = path.join(outputDir, outputFolderName);
  const keepHistory = historyMode !== "latest-only";
  const runOutputDir = keepHistory ? path.join(managedOutputRoot, timestamp) : managedOutputRoot;
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
  const cookieHeader = String(getArg("cookie", "") || "").trim();
  const onlyFilter = String(getArg("only", "") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const excludeFilter = String(getArg("exclude", "") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const options = {
    discovery,
    pluginRoot,
    subscriptionsURL,
    subscriptionsFile,
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
    defaultCookieHeader: cookieHeader,
  };

  await fsp.mkdir(runOutputDir, { recursive: true });

  const latestPath = path.join(managedOutputRoot, "latest.json");
  const latestLogPath = path.join(managedOutputRoot, "latest.log");
  const latestSummaryLogPath = path.join(managedOutputRoot, "latest.summary.log");
  const invalidSourcesLatestPath = path.join(managedOutputRoot, "invalid_sources_latest.json");
  const invalidSourcesLatestTxtPath = path.join(managedOutputRoot, "invalid_sources_latest.txt");
  const logPath = keepHistory ? path.join(runOutputDir, "run.log") : latestLogPath;
  const reportPath = keepHistory ? path.join(runOutputDir, "report.json") : latestPath;
  const summaryLogPath = keepHistory ? path.join(runOutputDir, "summary.log") : latestSummaryLogPath;
  const invalidSourcesDir = keepHistory ? path.join(runOutputDir, "invalid_sources") : path.join(managedOutputRoot, "invalid_sources");
  const invalidSourcesPath = keepHistory ? path.join(invalidSourcesDir, "invalid_sources.json") : invalidSourcesLatestPath;
  const invalidSourcesTxtPath = keepHistory ? path.join(invalidSourcesDir, "invalid_sources.txt") : invalidSourcesLatestTxtPath;

  if (!keepHistory && fs.existsSync(logPath)) {
    await fsp.unlink(logPath);
  }

  const logger = createLogger(logPath);
  logger.log(`[log] ${logPath}`);
  logger.log(`[plugin-root] ${pluginRoot}`);
  logger.log(`[output] ${reportPath}`);
  logger.log(`[runner] bun`);
  logger.log(`[discovery] ${discovery}`);
  if (discovery === "subscriptions") {
    logger.log(`[subscriptions] ${subscriptionsFile || subscriptionsURL}`);
  }

  try {
    let discoveredAll = [];
    let subscriptionsSource = "";
    if (discovery === "subscriptions") {
      const subscriptions = await listSubscriptionPlugins(options);
      discoveredAll = subscriptions.items;
      subscriptionsSource = subscriptions.source;
    } else {
      discoveredAll = await listLocalPlugins(pluginRoot);
    }
    const discovered = discoveredAll.filter((entry) => !isReservedPluginFolder(entry.folder));
    let filtered = discovered.slice();
    if (onlyFilter.length > 0) {
      filtered = filtered.filter((entry) => {
        const tokens = buildEntryFilterTokens(entry);
        return onlyFilter.some((item) => tokens.includes(item));
      });
    }
    if (excludeFilter.length > 0) {
      filtered = filtered.filter((entry) => {
        const tokens = buildEntryFilterTokens(entry);
        return !excludeFilter.some((item) => tokens.includes(item));
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
        discovery: options.discovery,
        historyMode,
        smokeFailExit,
        subscriptionsSource,
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
        hasDefaultCookieHeader: !!options.defaultCookieHeader,
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
      subscriptionsSource,
      invalidSourcesSummary: {
        invalidPluginsCount: invalidSources.invalidPluginsCount,
      },
      plugins: pluginReports,
    };

    const summaryLog = buildSummaryLog(report, invalidSources, {
      discovery,
      subscriptionsSource,
    });

    await fsp.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
    await fsp.writeFile(summaryLogPath, summaryLog, "utf8");
    if (reportPath !== latestPath) {
      await fsp.writeFile(latestPath, JSON.stringify(report, null, 2) + "\n", "utf8");
    }
    if (logPath !== latestLogPath) {
      await fsp.copyFile(logPath, latestLogPath);
    }
    if (summaryLogPath !== latestSummaryLogPath) {
      await fsp.copyFile(summaryLogPath, latestSummaryLogPath);
    }
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
    if (invalidSourcesPath !== invalidSourcesLatestPath) {
      await fsp.writeFile(
        invalidSourcesLatestPath,
        JSON.stringify(invalidSources, null, 2) + "\n",
        "utf8"
      );
    }
    if (invalidSourcesTxtPath !== invalidSourcesLatestTxtPath) {
      await fsp.copyFile(invalidSourcesTxtPath, invalidSourcesLatestTxtPath);
    }

    if (updateReadmePath) {
      const readmeSection = buildReadmeStatusSection(report, invalidSources, {
        discovery,
        subscriptionsSource,
      });
      await updateReadmeStatus(updateReadmePath, readmeSection);
      logger.log(`[readme] ${path.resolve(updateReadmePath)}`);
    }

    if (jobSummaryFile) {
      await writeJobSummary(jobSummaryFile, buildJobSummary(report));
      logger.log(`[job-summary] ${path.resolve(jobSummaryFile)}`);
    }

    logger.log(
      `[summary] plugins=${report.summary.pluginsTotal}, fatal=${report.summary.pluginsWithFatalErrors}, cases=${report.summary.casesTotal}, ok=${report.summary.ok}, fail=${report.summary.fail}, invalidSources=${report.summary.invalidSourcesPlugins}`
    );
    logger.log(`[report] ${reportPath}`);
    logger.log(`[latest] ${latestPath}`);
    logger.log(`[latest-log] ${latestLogPath}`);
    logger.log(`[latest-summary-log] ${latestSummaryLogPath}`);
    logger.log(`[invalid-sources] ${invalidSourcesPath}`);
    logger.log(`[invalid-sources-latest] ${invalidSourcesLatestPath}`);

    if (
      smokeFailExit !== "soft" &&
      (report.summary.fail > 0 || report.summary.pluginsWithFatalErrors > 0)
    ) {
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
