#!/usr/bin/env node

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const CryptoJS = require("crypto-js");

const DEFAULT_HOSTS = [
  "https://www.libvio.cam",
];
const SMARTPLAY_API_URL =
  "https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (!found) return fallback;
  return found.substring(prefix.length);
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function buildTimestamp() {
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

function createLogger(logPath) {
  const stream = fs.createWriteStream(logPath, { flags: "a" });
  return {
    log(message) {
      const line = String(message == null ? "" : message);
      process.stdout.write(line + "\n");
      stream.write(line + "\n");
    },
    error(message) {
      const line = String(message == null ? "" : message);
      process.stderr.write(line + "\n");
      stream.write(line + "\n");
    },
    close() {
      stream.end();
    },
  };
}

function normalizeHost(host) {
  return String(host || "").trim().replace(/\/+$/, "");
}

function toAbsoluteURL(baseHost, maybeRelative) {
  if (!maybeRelative) return "";
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  return `${normalizeHost(baseHost)}/${String(maybeRelative).replace(/^\/+/, "")}`;
}

async function fetchText(url, referer) {
  const headers = {
    "User-Agent": UA,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    Referer: referer || `${new URL(url).origin}/`,
  };

  const res = await fetch(url, {
    method: "GET",
    headers,
    redirect: "follow",
    timeout: 20000,
  });
  const body = await res.text();

  return { status: res.status, body, finalURL: res.url };
}

async function fetchTextWithoutReferer(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": UA,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    redirect: "follow",
    timeout: 20000,
  });
  const body = await res.text();

  return { status: res.status, body, finalURL: res.url };
}

async function postJSON(url, body, referer, origin) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": UA,
      Origin: origin,
      Referer: referer || origin || "",
    },
    body: JSON.stringify(body),
    redirect: "follow",
    timeout: 20000,
  });
  const text = await res.text();
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`POST ${url} failed: HTTP ${res.status} ${text.slice(0, 120)}`);
  }
  return JSON.parse(text);
}

function looksLikeCloudflareChallenge(body) {
  if (!body) return false;
  return /just a moment|cf-mitigated|challenge-platform|checking your browser/i.test(
    body
  );
}

function extractAttr(tagHTML, attrName) {
  const pattern = new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, "i");
  const hit = String(tagHTML || "").match(pattern);
  return hit && hit[1] ? hit[1].trim() : "";
}

function parseRecentMedias(indexHTML, host) {
  const medias = [];
  const seen = new Set();

  const re = /<a\b[^>]*class=["'][^"']*\bstui-vodlist__thumb\b[^"']*["'][^>]*>/gi;
  const tags = String(indexHTML || "").match(re) || [];
  for (const tag of tags) {
    const href = toAbsoluteURL(host, extractAttr(tag, "href"));
    const title = extractAttr(tag, "title");
    if (!href || !title || seen.has(href)) continue;
    seen.add(href);

    medias.push({
      detailURL: href,
      title,
      coverURL: toAbsoluteURL(host, extractAttr(tag, "data-original")),
    });
  }

  return medias;
}

function parseEpisodes(detailHTML, host) {
  const sections =
    String(detailHTML || "").match(
      /<([a-z]+)\b[^>]*class=["'][^"']*\bstui-content__playlist\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi
    ) || [];
  if (sections.length === 0) return [];

  const links = [];
  const seen = new Set();
  for (const section of sections) {
    const aRE = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let hit;
    while ((hit = aRE.exec(section)) !== null) {
      const href = toAbsoluteURL(host, hit[1]);
      if (!href || seen.has(href)) continue;
      seen.add(href);

      const title = String(hit[2] || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      links.push({
        title: title || href.split("/").pop(),
        playPageURL: href,
      });
    }
  }

  return links;
}

function parsePlayerConfig(playPageHTML) {
  const patterns = [
    /r player_.*?=\s*(\{[\s\S]*?\})\s*</i,
    /player_[a-z0-9_]+\s*=\s*(\{[\s\S]*?\})\s*;/i,
  ];

  for (const pattern of patterns) {
    const hit = playPageHTML.match(pattern);
    if (!hit || !hit[1]) continue;
    try {
      return JSON.parse(hit[1]);
    } catch (_) {}
  }

  throw new Error("player config not found");
}

function strRevers(input) {
  return String(input || "").split("").reverse();
}

function htoStr(input) {
  let out = "";
  for (let i = 0; i < input.length; i += 2) {
    const hex = String(input[i] || "") + String(input[i + 1] || "");
    out += String.fromCharCode(parseInt(hex, 16));
  }
  return out;
}

function decodeStr(input) {
  const mid = (input.length - 7) / 2;
  const a = input.substring(0, mid);
  const b = input.substring(mid + 7);
  return a + b;
}

function extractPlayAPIBase(playerJS, baseHost) {
  const hit = playerJS.match(/src\s*=\s*["']([^"']+)["']/i);
  if (!hit || !hit[1]) return "";
  return toAbsoluteURL(baseHost, hit[1]);
}

function normalizePlayableURL(rawURL) {
  if (!rawURL) return "";
  let url = String(rawURL).replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
  if (url.startsWith("//")) url = `https:${url}`;
  return url;
}

function extractQuotedConst(body, name) {
  const hit = String(body || "").match(
    new RegExp(`const\\s+${name}\\s*=\\s*([\"'])([\\s\\S]*?)\\1`)
  );
  return hit && hit[2] ? hit[2] : "";
}

function extractArtplayerScript(body) {
  const scripts =
    String(body || "").match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
  for (let i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].includes("function execB")) {
      return scripts[i]
        .replace(/^<script\b[^>]*>/i, "")
        .replace(/<\/script>\s*$/i, "");
    }
  }
  return "";
}

function looksLikeResolvedMediaURL(url) {
  return /^https?:\/\/.+(?:\.m3u8|\.mp4|\/tos-|bytetos\.com|byteimg\.com|bytecdntp\.com)/i.test(
    String(url || "")
  );
}

function createFakeElement() {
  return {
    style: {},
    dataset: {},
    classList: {
      add() {},
      remove() {},
      contains() {
        return false;
      },
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    remove() {},
    setAttribute() {},
    getAttribute() {
      return "";
    },
    querySelector: createFakeElement,
    querySelectorAll: () => [],
    innerHTML: "",
    textContent: "",
    value: "",
  };
}

function decryptArtplayerURL(scriptBody, encryptedURL, mediaId, host) {
  const fakePromise = {
    then() {
      return fakePromise;
    },
    catch() {
      return fakePromise;
    },
  };
  const origin = normalizeHost(host);
  const context = {
    console: {
      log() {},
      warn() {},
      error() {},
    },
    CryptoJS,
    parent: { MacPlayer: { Id: String(mediaId || "") } },
    document: {
      body: createFakeElement(),
      cookie: "",
      addEventListener() {},
      createElement: createFakeElement,
      getElementById: createFakeElement,
      querySelector: createFakeElement,
      querySelectorAll: () => [],
    },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    location: {
      protocol: "https:",
      host: origin.replace(/^https?:\/\//i, ""),
      origin,
      href: "",
      search: "",
    },
    navigator: { userAgent: UA },
    setTimeout() {
      return 0;
    },
    clearTimeout() {},
    setInterval() {
      return 0;
    },
    clearInterval() {},
    fetch() {
      return fakePromise;
    },
    URLSearchParams: class {
      get() {
        return "";
      }
    },
    URL: class {
      constructor(url) {
        this.href = String(url || "");
        this.origin = origin;
      }
    },
    Artplayer: function () {
      return {
        controls: { add() {} },
        notice: {},
        template: {},
        on() {},
        play() {},
        pause() {},
        switchUrl() {},
      };
    },
    Hls: function () {},
    mpegts: {},
    performance: { now: () => 0 },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(scriptBody, context, { timeout: 5000 });
  if (typeof context.execB !== "function") return "";
  const decoded = vm.runInContext(`execB(${JSON.stringify(encryptedURL)})`, context, {
    timeout: 2000,
  });
  return looksLikeResolvedMediaURL(decoded) ? decoded : "";
}

async function resolveArtplayerURL(playAPIBase, config, host, playPageURL) {
  const next = config.link_next ? toAbsoluteURL(host, config.link_next) : "";
  const artplayerURL = `${playAPIBase}${config.url}${
    next ? `&next=${encodeURIComponent(next)}` : ""
  }`;
  const artRes = await fetchText(artplayerURL, playPageURL);
  const playPageUrl = extractQuotedConst(artRes.body, "playPageUrl");
  const secretKeySeed = extractQuotedConst(artRes.body, "secretKeySeed");
  const scriptBody = extractArtplayerScript(artRes.body);
  if (!playPageUrl || !secretKeySeed || !scriptBody) {
    throw new Error("artplayer smartplay constants not found");
  }

  const t = Math.floor(Date.now() / 1000);
  const payload = {
    vkey: playPageUrl,
    code: secretKeySeed,
    t,
    signature: CryptoJS.MD5(String(t)).toString(),
  };
  const apiData = await postJSON(SMARTPLAY_API_URL, payload, artplayerURL, host);
  const encryptedURL = apiData && apiData.url ? normalizePlayableURL(apiData.url) : "";
  const decoded = decryptArtplayerURL(scriptBody, encryptedURL, config.id, host);
  if (!decoded) {
    throw new Error("artplayer smartplay decrypt failed");
  }
  return decoded;
}

function extractPlayableURL(body) {
  if (!body) return "";
  const patterns = [
    /["']?urls?["']?\s*:\s*["']([^"']+)["']/,
    /(?:var|let|const)\s+urls?\s*=\s*["']([^"']+)["']/,
    /(?:var|let|const)\s+[a-zA-Z_$][\w$]*\s*=\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/,
    /["']url["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/,
    /url\s*=\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/,
  ];

  for (const pattern of patterns) {
    const hit = body.match(pattern);
    if (hit && hit[1]) return normalizePlayableURL(hit[1]);
  }
  return "";
}

function extractYD189ParseURL(body) {
  const hit = String(body || "").match(
    /fetch\(["']([^"']*\/vid\/parse_yd\.php[^"']*)["']/
  );
  return hit && hit[1] ? normalizePlayableURL(hit[1]) : "";
}

async function extractRealPlayURL(playPageURL, host) {
  const playPageRes = await fetchText(playPageURL, `${host}/`);
  const config = parsePlayerConfig(playPageRes.body);

  const from = config.from;
  const url = config.url;
  const next = config.link_next;
  const id = config.id;
  const nid = config.nid;

  if (!from) {
    throw new Error("player 'from' is empty");
  }
  if (from === "kuake") {
    throw new Error("kuake not supported by plugin");
  }
  if (from === "uc") {
    throw new Error("uc not supported by plugin");
  }

  const playerJSRes = await fetchText(
    `${normalizeHost(host)}/static/player/${from}.js`,
    `${host}/`
  );

  let playAPIBase = extractPlayAPIBase(playerJSRes.body, host);
  if (from === "ty_new1") {
    playAPIBase = `${normalizeHost(host)}/vid/ty4.php?url=`;
  }

  if (playAPIBase.includes("/static/player/artplayer/")) {
    return resolveArtplayerURL(playAPIBase, config, host, playPageURL);
  }

  if (from === "yd189") {
    const ydPlayerURL = toAbsoluteURL(
      host,
      `${playAPIBase}${url}&next=${next}&id=${id}&nid=${nid}`
    );
    const ydRes = await fetchText(ydPlayerURL, playPageURL);
    const parseURL = extractYD189ParseURL(ydRes.body);
    if (!parseURL) {
      throw new Error("yd189 parse url not found");
    }
    const parseRes = await fetchTextWithoutReferer(toAbsoluteURL(host, parseURL));
    const data = JSON.parse(parseRes.body);
    if (!data || !data.url) {
      throw new Error(`yd189 parse failed: ${(data && data.error) || "empty url"}`);
    }
    return normalizePlayableURL(data.url);
  }

  let playAPIURL = "";
  if (from === "tweb") {
    playAPIURL = `${playAPIBase}${url}`;
    const twebRes = await fetchText(playAPIURL, `${host}/`);
    const codeHit = twebRes.body.match(/(?<={).+?(?=})/);
    if (!codeHit || !codeHit[0]) {
      throw new Error("tweb payload not found");
    }
    const parsed = JSON.parse(`{${codeHit[0]}}`);
    const data = parsed.data;
    if (!data) {
      throw new Error("tweb encrypted data not found");
    }
    return decodeStr(htoStr(strRevers(data)));
  }

  if (from === "ty_new1") {
    playAPIURL = `${playAPIBase}${url}`;
  } else {
    playAPIURL = `${playAPIBase}${url}&next=${next}&id=${id}&nid=${nid}`;
    playAPIURL = toAbsoluteURL(host, playAPIURL);
  }

  const playRes = await fetchText(playAPIURL, `${host}/`);
  const realURL = extractPlayableURL(playRes.body);
  if (!realURL) {
    throw new Error(`unable to extract real url from ${from}`);
  }
  return realURL;
}

async function findAvailableHost(candidates) {
  for (const candidate of candidates) {
    const host = normalizeHost(candidate);
    if (!host) continue;

    try {
      const res = await fetchText(`${host}/`, `${host}/`);
      const hasList = /stui-vodlist__thumb|stui-vodlist__box/i.test(res.body);
      const challenged = looksLikeCloudflareChallenge(res.body);
      if (res.status === 200 && hasList && !challenged) {
        return host;
      }
    } catch (_) {}
  }
  throw new Error("no available host from candidates");
}

async function main() {
  const cliHost = normalizeHost(getArg("host", ""));
  const limit = Number(getArg("limit", "0")) || 0;
  const allEpisodes = hasFlag("all-episodes");
  const cliLogPath = getArg("log", "");
  const timestamp = buildTimestamp();
  const defaultLogDir = path.join(__dirname, "logs");
  if (!fs.existsSync(defaultLogDir)) {
    fs.mkdirSync(defaultLogDir, { recursive: true });
  }
  const logPath =
    cliLogPath && cliLogPath.trim()
      ? path.resolve(process.cwd(), cliLogPath.trim())
      : path.join(defaultLogDir, `recent_updates_play_${timestamp}.log`);
  const logger = createLogger(logPath);

  logger.log(`[log] ${logPath}`);

  try {
    const hostCandidates = cliHost ? [cliHost] : DEFAULT_HOSTS;
    const host = await findAvailableHost(hostCandidates);

    logger.log(`[host] ${host}`);
    logger.log(`[mode] recent-updates, episodes=${allEpisodes ? "all" : "first"}`);

    const indexRes = await fetchText(`${host}/`, `${host}/`);
    const medias = parseRecentMedias(indexRes.body, host);
    const selected = limit > 0 ? medias.slice(0, limit) : medias;

    logger.log(`[recent] total=${medias.length}, testing=${selected.length}`);

    const results = [];
    for (let i = 0; i < selected.length; i++) {
      const media = selected[i];
      try {
        const detailRes = await fetchText(media.detailURL, `${host}/`);
        const episodes = parseEpisodes(detailRes.body, host);
        const targetEpisodes = allEpisodes ? episodes : episodes.slice(0, 1);
        if (targetEpisodes.length === 0) {
          throw new Error("no episodes found");
        }

        for (const ep of targetEpisodes) {
          try {
            const realURL = await extractRealPlayURL(ep.playPageURL, host);
            results.push({
              ok: true,
              unsupported: false,
              mediaTitle: media.title,
              episodeTitle: ep.title,
              playPageURL: ep.playPageURL,
              realURL,
            });
            logger.log(
              `[OK] ${i + 1}/${selected.length} ${media.title} | ${ep.title} -> ${realURL}`
            );
          } catch (error) {
            const errorText = error.message || String(error);
            const unsupported = /not supported by plugin|artplayer encrypted browser player/i.test(errorText);
            results.push({
              ok: false,
              unsupported,
              mediaTitle: media.title,
              episodeTitle: ep.title,
              playPageURL: ep.playPageURL,
              error: errorText,
            });
            logger.log(
              `[${unsupported ? "UNSUPPORTED" : "FAIL"}] ${i + 1}/${selected.length} ${
                media.title
              } | ${ep.title} -> ${errorText}`
            );
          }
        }
      } catch (error) {
        const errorText = error.message || String(error);
        results.push({
          ok: false,
          unsupported: false,
          mediaTitle: media.title,
          episodeTitle: "",
          playPageURL: media.detailURL,
          error: errorText,
        });
        logger.log(
          `[FAIL] ${i + 1}/${selected.length} ${media.title} | detail -> ${errorText}`
        );
      }
    }

    const okCount = results.filter((item) => item.ok).length;
    const unsupportedCount = results.filter((item) => !item.ok && item.unsupported).length;
    const failCount = results.filter((item) => !item.ok && !item.unsupported).length;
    logger.log("");
    logger.log(
      `[summary] ok=${okCount}, unsupported=${unsupportedCount}, fail=${failCount}, totalCases=${results.length}`
    );

    if (unsupportedCount > 0) {
      logger.log("[unsupported]");
      for (const item of results.filter((row) => !row.ok && row.unsupported)) {
        logger.log(
          `- ${item.mediaTitle} ${item.episodeTitle ? `| ${item.episodeTitle}` : ""} | ${
            item.playPageURL
          } | ${item.error}`
        );
      }
    }

    if (failCount > 0) {
      logger.log("[failures]");
      for (const item of results.filter((row) => !row.ok && !row.unsupported)) {
        logger.log(
          `- ${item.mediaTitle} ${item.episodeTitle ? `| ${item.episodeTitle}` : ""} | ${
            item.playPageURL
          } | ${item.error}`
        );
      }
    }

    if (failCount > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    logger.error(`[fatal] ${error.message || error}`);
    throw error;
  } finally {
    logger.close();
  }
}

main().catch((error) => {
  process.stderr.write(`[fatal] ${error.message || error}\n`);
  process.exit(1);
});
