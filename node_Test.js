const fetch = require("node-fetch");

const HOST = "https://www.czzymovie.com";
const DEFAULT_PLAYER_URL =
  HOST + "/v_play/bXZfMjI2NTctbm1fMQ==.html"; // 可透過參數覆蓋
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function parseSetCookies(raw) {
  const cookies = {};
  if (!raw) {
    return cookies;
  }

  const entries = Array.isArray(raw) ? raw : [raw];
  entries.forEach((entry) => {
    if (!entry) {
      return;
    }
    const pair = entry.split(";")[0];
    const idx = pair.indexOf("=");
    if (idx === -1) {
      return;
    }
    const name = pair.substring(0, idx).trim();
    const value = pair.substring(idx + 1).trim();
    if (name) {
      cookies[name] = value;
    }
  });

  return cookies;
}

function cookiesToHeader(jar) {
  const pairs = [];
  Object.keys(jar || {}).forEach((key) => {
    pairs.push(key + "=" + jar[key]);
  });
  return pairs.join("; ");
}

async function fetchWithJar(url, jar, refererOverride) {
  const headers = {
    "User-Agent": UA,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: refererOverride || HOST + "/",
    "Sec-Fetch-Dest": "iframe",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
  };

  const cookieHeader = cookiesToHeader(jar);
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const res = await fetch(url, { method: "GET", headers });
  const body = await res.text();

  const rawCookies = res.headers.raw()["set-cookie"];
  const newCookies = parseSetCookies(rawCookies);
  Object.assign(jar, newCookies);

  return { res, body };
}

async function main() {
  const targetURL = process.argv[2] || DEFAULT_PLAYER_URL;
  const jar = {};

  console.log("[warmup] requesting root:", HOST + "/");
  try {
    await fetchWithJar(HOST + "/", jar, HOST + "/");
    console.log("[warmup] cookie keys:", Object.keys(jar));
  } catch (error) {
    console.error("[warmup] failed:", error.message || error);
  }

  console.log("[test] requesting:", targetURL);
  try {
    const { res, body } = await fetchWithJar(targetURL, jar, HOST + "/");
    console.log("[test] status:", res.status);
    console.log("[test] headers:", res.headers.get("content-type"));
    console.log("[test] cookie keys:", Object.keys(jar));
    console.log("[test] snippet:\n", body);
  } catch (error) {
    console.error("[test] request failed:", error.message || error);
  }
}

main();
