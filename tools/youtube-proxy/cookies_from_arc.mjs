#!/usr/bin/env node
import { chmod, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function netscapeCookies(cookies, now = Date.now() / 1000) {
  const selected = cookies.filter(cookie => {
    const domain = cookie.domain.replace(/^\./, "").toLowerCase();
    return (domain === "youtube.com" || domain.endsWith(".youtube.com"))
      && !cookie.partitionKey && (cookie.session || cookie.expires <= 0 || cookie.expires > now);
  });
  const lines = selected.map(cookie => {
    const domain = (cookie.httpOnly ? "#HttpOnly_" : "") + cookie.domain;
    return [domain, cookie.domain.startsWith(".") ? "TRUE" : "FALSE", cookie.path,
      cookie.secure ? "TRUE" : "FALSE", cookie.session || cookie.expires <= 0 ? "0" : String(Math.floor(cookie.expires)),
      cookie.name, cookie.value].join("\t");
  });
  return { text: "# Netscape HTTP Cookie File\n" + lines.join("\n") + "\n", count: selected.length };
}

async function cookieRequest(socketURL) {
  const socket = new WebSocket(socketURL);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("arc_cdp_connection_failed")), { once: true });
    socket.addEventListener("close", () => reject(new Error("arc_cdp_connection_closed")), { once: true });
  });
  try {
    return await new Promise((resolve, reject) => {
      socket.addEventListener("message", event => {
        const message = JSON.parse(event.data);
        if (message.id !== 1) return;
        if (message.error) reject(new Error("youtube_cookie_request_failed"));
        else resolve(message.result.cookies);
      });
      socket.addEventListener("error", () => reject(new Error("arc_cdp_connection_failed")), { once: true });
      socket.addEventListener("close", () => reject(new Error("arc_cdp_connection_closed")), { once: true });
      socket.send(JSON.stringify({ id: 1, method: "Network.getCookies", params: {
        urls: ["https://www.youtube.com/", "https://youtube.com/"],
      } }));
    });
  } finally { socket.close(); }
}

async function main() {
  const args = process.argv.slice(2);
  const value = name => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
  if (args.includes("--help")) {
    console.log("Usage: node cookies_from_arc.mjs --output /private/path/youtube.cookies.txt [--cdp-url http://localhost:9222]");
    return;
  }
  const output = value("--output");
  if (!output) throw new Error("missing_private_output_path");
  const endpoint = value("--cdp-url") || "http://localhost:9222";
  const response = await fetch(new URL("/json/list", endpoint));
  if (!response.ok) throw new Error("arc_cdp_inventory_failed");
  const targets = await response.json();
  const target = targets.find(item => {
    try { return item.type === "page" && new URL(item.url).hostname === "www.youtube.com"; }
    catch { return false; }
  });
  if (!target?.webSocketDebuggerUrl) throw new Error("existing_youtube_tab_required");
  const result = netscapeCookies(await cookieRequest(target.webSocketDebuggerUrl));
  if (!result.count) throw new Error("youtube_cookies_unavailable");
  const filename = path.resolve(output);
  await mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  const temporary = filename + "." + randomUUID() + ".tmp";
  try {
    await writeFile(temporary, result.text, { mode: 0o600, flag: "wx" });
    await chmod(temporary, 0o600);
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(JSON.stringify({ exported: result.count, domains: "youtube.com only", path: filename }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error("YouTube Cookie import failed; check Arc CDP and its signed-in YouTube tab."); process.exitCode = 1; });
}
