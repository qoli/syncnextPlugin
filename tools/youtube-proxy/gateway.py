#!/usr/bin/env python3
"""GundamInfo playlists with manifest-only HLS, original media Range and WebVTT."""

import argparse
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlsplit
import uuid
from xml.sax.saxutils import escape

from manifests import make_mpd, master_playlist, media_playlist, subtitle_playlist, hls_vtt
from range_cache import CachedRangeReader
from youtube import RangeReader, byte_range, load_subtitle, premium_state, private_youtube_cookies, segment_base, youtube_cookie_identity


CHANNEL = "https://www.youtube.com/@GundamInfo/playlists"
SAMPLE = "RJ4FLf15XeE"
PLUGIN = Path(__file__).resolve().parents[2] / "plugin_youtube"
PROFILES = {
    "avc": {"name": "AVC 原畫質", "selector": "bestvideo[ext=mp4][vcodec^=avc1]+140"},
    "premium": {"name": "Premium 1080p AV1", "selector": "bestvideo[ext=mp4][vcodec^=av01][height=1080][format_note*=Premium]+140"},
}


class ProxyError(Exception):
    def __init__(self, code, message, status=502):
        self.code, self.message, self.status = code, message, status


def error_code(error):
    # Upstream exception strings may contain signed URLs. Keep those off the LAN.
    if isinstance(error, ProxyError):
        return error.code
    if isinstance(error, HTTPError):
        return "upstream_http_" + str(error.code)
    if isinstance(error, URLError):
        return "upstream_" + type(error.reason).__name__
    if isinstance(error, ValueError) and re.fullmatch(r"[a-z_0-9]+", str(error)):
        return str(error)
    return type(error).__name__


def is_traditional_chinese_playlist(entry):
    title = entry.get("title") or ""
    return (any(label in title for label in ("繁中", "繁體", "台湾中文", "台灣中文", "香港中文"))
            or re.search(r"(?<![A-Za-z])TW(?![A-Za-z])", title, re.IGNORECASE) is not None)


def playlist_medias(catalog, origin, profile, language=None):
    if language not in (None, "zh-TW"):
        raise ProxyError("unsupported_catalog_language", "不支援此播放列表語言分組。", 400)
    entries = catalog.get("entries") or []
    if language == "zh-TW":
        entries = [entry for entry in entries if is_traditional_chinese_playlist(entry)]
    else:
        entries = sorted(entries, key=lambda entry: not is_traditional_chinese_playlist(entry))
    return [{"id": f"youtube:{entry['id']}:{profile}", "title": entry["title"],
             "coverURLString": next((t["url"] for t in reversed(entry.get("thumbnails") or []) if t.get("url")), ""),
             "descriptionText": PROFILES[profile]["name"] + " · GundamInfo 播放列表",
             "detailURLString": origin + "/api/playlists/" + quote(entry["id"], safe="") + "?profile=" + profile}
            for entry in entries if entry.get("id") and entry.get("title")]


def playlist_episodes(metadata, origin, profile):
    result = []
    for number, entry in enumerate(metadata.get("entries") or [], 1):
        if not entry or not entry.get("id"):
            raise ProxyError("playlist_entry_missing", "播放列表含無法辨識的項目，請檢查 Mac 日誌。")
        result.append({"id": "youtube:" + entry["id"], "title": entry.get("title") or entry["id"],
                       "titleNumber": number, "resumeKey": "youtube:" + entry["id"],
                       "episodeDetailURL": origin + "/api/play/" + quote(entry["id"], safe="") + "?profile=" + profile})
    return result


class Session:
    def __init__(self, identifier, source, directory):
        self.id, self.source, self.directory = identifier, source, directory
        self.media_readers = {source[kind]["format_id"]: CachedRangeReader(
            source[kind], directory / "media-cache" / (kind + ".mp4")) for kind in ("video", "audio")}
        self.manifest = make_mpd(source)
        self.master = master_playlist(source)
        self.playlists = {kind: media_playlist(source[kind], kind + ".mp4") for kind in ("video", "audio")}
        self.subtitle_playlist = subtitle_playlist(source["duration"]) if source["subtitle"].get("available") else None

    def player_payload(self, origin):
        # Aether's DASH opener handles AV1 through dav1d. The native remote-HLS
        # route delegates AV1 to AVFoundation, which rejects it on Study TV.
        resource = "manifest.mpd" if self.source["profile"] == "premium" else "master.m3u8"
        payload = {"url": origin + "/sessions/" + self.id + "/" + resource, "headers": {}}
        subtitle = self.source["subtitle"]
        if self.source["profile"] == "premium" and subtitle.get("available"):
            payload["subtitle"] = {"url": origin + "/api/subtitles/" + self.source["id"] + "/" + subtitle["language"] + ".vtt",
                                   "name": subtitle["name"], "language": subtitle["language"]}
        return payload

    def summary(self):
        return {"sessionID": self.id, "videoId": self.source["id"], "title": self.source["title"],
                "duration": self.source["duration"], "profile": self.source["profile"],
                "account": self.source["account"],
                "delivery": "dash-range-and-webvtt" if self.source["profile"] == "premium" else "hls-range-and-webvtt",
                "enhancedBitrate": "Premium" in (self.source["video"].get("format_note") or ""),
                "tracks": {kind: {key: track.get(key) for key in (
                    "format_id", "format_note", "filesize", "tbr", "vcodec", "acodec", "width", "height", "language", "segmentBase")}
                    for kind in ("video", "audio") for track in [self.source[kind]]},
                "subtitle": {k: v for k, v in self.source["subtitle"].items() if k != "body"}}


class Gateway:
    def __init__(self, args):
        self.args = args
        self.origin = f"http://{args.bind}:{args.port}"
        self.artifacts = args.artifacts
        self.artifacts.mkdir(parents=True, exist_ok=True)
        self.lock, self.extract_lock = threading.Lock(), threading.Lock()
        self.sessions, self.subtitles, self.playlists, self.playlist_locks, self.allowed_videos = {}, {}, {}, {}, {SAMPLE}
        self.cookie_path = self.artifacts / "youtube-working.cookies.txt"
        self.cookie_count = private_youtube_cookies(args.cookie_file, self.cookie_path) if args.cookie_file else 0
        self.cookies_invalid = False
        self.failed_cookie_ids = set()
        self.cookie_refreshes = 0
        self.cookie_refresh_error = None
        self.catalog = self.extract(CHANNEL, self.artifacts / "catalog", flat=True)
        self.allowed_playlists = {e["id"] for e in self.catalog.get("entries", []) if e.get("id")}

    def record(self, event):
        with self.lock:
            with (self.artifacts / "events.jsonl").open("a") as output:
                output.write(json.dumps({"time": time.time(), **event}, ensure_ascii=False) + "\n")

    def refresh_cookies(self):
        """Called under extract_lock; never retry a known-rejected generation."""
        self.cookies_invalid = True
        destination = self.args.cdp_cookie_file or self.artifacts / "youtube-cdp.cookies.txt"
        self.record({"event": "cookie_cdp_refresh_started"})
        command = [self.args.node, str(Path(__file__).with_name("cookies_from_arc.mjs")),
                   "--cdp-url", self.args.cdp_url, "--output", str(destination)]
        try:
            result = subprocess.run(command, capture_output=True, text=True)
        except OSError as error:
            self.cookie_refresh_error = "youtube_cdp_unavailable"
            raise ProxyError(self.cookie_refresh_error, "無法啟動 CDP Cookie 更新，請確認 Mac 的 Node 與 Arc。") from error
        if result.returncode:
            self.cookie_refresh_error = "youtube_cdp_unavailable"
            self.record({"event": "cookie_cdp_refresh_failed", "error": self.cookie_refresh_error})
            raise ProxyError(self.cookie_refresh_error, "無法從 Arc CDP 取得 Cookie，請確認 Arc CDP 與已登入的 YouTube 分頁。")
        identity = youtube_cookie_identity(destination)
        if identity is None:
            self.cookie_refresh_error = "youtube_cdp_login_required"
            self.record({"event": "cookie_cdp_refresh_failed", "error": self.cookie_refresh_error})
            raise ProxyError(self.cookie_refresh_error, "Arc CDP 未提供登入 Cookie，請先在既有 YouTube 分頁登入。")
        if identity in self.failed_cookie_ids:
            self.cookie_refresh_error = "youtube_cookies_invalid"
            self.record({"event": "cookie_cdp_refresh_failed", "error": "cdp_returned_rejected_cookie_generation"})
            raise ProxyError(self.cookie_refresh_error, "CDP 已讀取最新 Cookie，但這組登入狀態仍被 YouTube 拒絕，請在 Arc 確認登入。")
        self.cookie_count = private_youtube_cookies(destination, self.cookie_path)
        self.cookies_invalid = False
        self.cookie_refresh_error = None
        self.cookie_refreshes += 1
        self.record({"event": "cookie_cdp_refreshed", "generation": self.cookie_refreshes,
                     "cookieCount": self.cookie_count})

    def extract(self, url, directory, flat=False, profile=None):
        directory.mkdir(parents=True, exist_ok=True)
        command = [self.args.extractor, "--ignore-config", "--no-cache-dir", "--force-ipv4", "--verbose", "--dump-single-json",
                   "--plugin-dirs", str(Path(__file__).with_name("plugins")),
                   "--skip-download", "--js-runtimes", self.args.js_runtime,
                   "--extractor-args", "youtube:player_client=" + self.args.player_client + ";lang=zh-TW"]
        if flat:
            command += ["--flat-playlist"]
        else:
            command += ["--no-playlist", "--no-simulate", "--force-overwrites", "--format", PROFILES[profile]["selector"],
                        "--write-subs", "--sub-langs", self.args.subtitle_language, "--sub-format", "vtt",
                        "--output", str(directory / "%(id)s.%(ext)s")]
        command += ["--cookies", str(self.cookie_path), url]
        started = time.monotonic()
        # Hold the lock through validation, CDP replacement and re-extraction.
        # A rejected extractor run can strip auth cookies from the working jar.
        with self.extract_lock:
            while True:
                identity = youtube_cookie_identity(self.cookie_path) if self.cookie_count else None
                if self.cookies_invalid or identity is None or identity in self.failed_cookie_ids:
                    self.refresh_cookies()
                    identity = youtube_cookie_identity(self.cookie_path)
                with (directory / "source.private.json").open("w") as output, (directory / "extractor.private.log").open("w") as errors:
                    process = subprocess.run(command, stdout=output, stderr=errors)
                log = (directory / "extractor.private.log").read_text()
                try:
                    if youtube_cookie_identity(self.cookie_path) is None:
                        raise ValueError("youtube_cookies_invalid")
                    detected = premium_state(self.cookie_count, log, profile == "premium")
                except ValueError as error:
                    if str(error) != "youtube_cookies_invalid":
                        raise ProxyError(str(error), "YouTube 未偵測到 Premium，請確認 Arc 目前登入的帳號。") from error
                    self.cookies_invalid = True
                    self.failed_cookie_ids.add(identity)
                    rejected = directory / f"rejected-cookies-{len(self.failed_cookie_ids)}"
                    rejected.mkdir(exist_ok=True)
                    for name in ("source.private.json", "extractor.private.log"):
                        (directory / name).replace(rejected / name)
                    self.record({"event": "cookie_generation_rejected", "profile": profile})
                    self.refresh_cookies()
                    continue
                break
        if process.returncode:
            self.record({"event": "extract_failed", "kind": "playlist" if flat else "video", "profile": profile,
                         "elapsedSeconds": round(time.monotonic() - started, 3)})
            if "Requested format is not available" in log:
                name = PROFILES[profile]["name"]
                raise ProxyError("selected_format_unavailable", "這部影片未提供 " + name + " 與 AAC 140；請自行選擇其他畫質頁。")
            raise ProxyError("extract_failed", "YouTube 解析失敗：影片可能受限或 Cookie 過期；詳見 Mac 日誌。")
        result = json.loads((directory / "source.private.json").read_text())
        result["proxyAccount"] = {"cookiesUsed": bool(self.cookie_count), "premiumDetected": detected}
        self.record({"event": "extracted", "kind": "playlist" if flat else "video", "profile": profile,
                     "elapsedSeconds": round(time.monotonic() - started, 3)})
        return result

    def medias(self, profile, language=None):
        return playlist_medias(self.catalog, self.origin, profile, language)

    def samples(self):
        return [{"id": "youtube:sample:" + profile, "title": "驗證樣本 · SEED 繁中第 10 集 · " + info["name"],
                 "coverURLString": f"https://i.ytimg.com/vi/{SAMPLE}/hqdefault.jpg",
                 "descriptionText": "繁中 SEED 播放列表內第 10 集的固定驗證入口。",
                 "detailURLString": self.origin + "/api/sample?profile=" + profile}
                for profile, info in PROFILES.items()]

    def episodes(self, playlist_id, profile):
        if playlist_id not in self.allowed_playlists:
            raise ProxyError("unknown_playlist", "此播放列表不在 GundamInfo 目錄。", 404)
        with self.lock:
            playlist_lock = self.playlist_locks.setdefault(playlist_id, threading.Lock())
        with playlist_lock:
            cached = self.playlists.get(playlist_id)
            if cached is None:
                cached = self.extract("https://www.youtube.com/playlist?list=" + playlist_id,
                                      self.artifacts / "playlists" / playlist_id, flat=True)
                with self.lock:
                    self.playlists[playlist_id] = cached
                    self.allowed_videos.update(e["id"] for e in cached.get("entries", []) if e and e.get("id"))
        return playlist_episodes(cached, self.origin, profile)

    def resolve(self, video_id, profile):
        with self.lock:
            allowed = video_id in self.allowed_videos
        if not allowed:
            raise ProxyError("unknown_video", "請先從 GundamInfo 播放列表選擇分集。", 404)
        identifier = str(uuid.uuid4())
        directory = self.artifacts / "sessions" / identifier
        metadata = self.extract("https://www.youtube.com/watch?v=" + video_id, directory, profile=profile)
        formats = metadata.get("requested_formats") or []
        video = next((f for f in formats if f.get("vcodec") not in (None, "none")), None)
        audio = next((f for f in formats if f.get("acodec") not in (None, "none")), None)
        if (metadata.get("id") != video_id or video is None or audio is None
                or video.get("ext") != "mp4" or audio.get("acodec") != "mp4a.40.2"
                or (profile == "premium" and (video.get("height") != 1080 or "Premium" not in (video.get("format_note") or "")))):
            raise ProxyError("unexpected_selected_tracks", "YouTube 回傳的影音格式不符合所選畫質。")
        def prepare(track):
            track["segmentBase"] = segment_base(track, read=RangeReader(track))
        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(prepare, (video, audio)))
        duration = max(t["segmentBase"]["indexedDurationSeconds"] for t in (video, audio))
        source = {"id": video_id, "title": metadata["title"], "profile": profile, "duration": duration,
                  "video": video, "audio": audio, "account": metadata["proxyAccount"]}
        subtitles = directory / f"{video_id}.{self.args.subtitle_language}.vtt"
        if self.args.subtitle_language in (metadata.get("requested_subtitles") or {}):
            if not subtitles.exists():
                raise ProxyError("subtitle_download_failed", "YouTube 列出字幕，但 Mac 未能下載 VTT。")
            source["subtitle"] = load_subtitle(subtitles, self.args.subtitle_language)
            with self.lock:
                self.subtitles[(video_id, self.args.subtitle_language)] = source["subtitle"]
        else:
            source["subtitle"] = {"language": self.args.subtitle_language, "available": False, "cueCount": 0}
        session = Session(identifier, source, directory)
        (directory / "summary.json").write_text(json.dumps(session.summary(), ensure_ascii=False, indent=2))
        (directory / "manifest.mpd").write_bytes(session.manifest)
        (directory / "master.m3u8").write_bytes(session.master)
        with self.lock:
            self.sessions[identifier] = session
        self.record({"event": "resolved", "sessionID": identifier, "videoId": video_id, "profile": profile,
                     "subtitleCues": source["subtitle"].get("cueCount", 0)})
        return session.player_payload(self.origin)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *_args):
        pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            # Aether cancels keep-alive reads when seeking or closing a source.
            self.close_connection = True

    def send(self, status, body, content_type, headers=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def json(self, value, status=200):
        self.send(status, json.dumps(value, ensure_ascii=False).encode(), "application/json; charset=utf-8")

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        try:
            self.route()
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True
        except Exception as error:
            self.server.gateway.record({"event": "request_failed", "error": error_code(error)})
            status = error.status if isinstance(error, ProxyError) else 502
            message = error.message if isinstance(error, ProxyError) else "Mac 代理取流失敗，請檢查 Mac 日誌。"
            self.json({"error": {"code": error_code(error), "message": message}}, status)

    def route(self):
        gateway = self.server.gateway
        parsed = urlsplit(self.path)
        path, query = parsed.path, parse_qs(parsed.query)
        profile = query.get("profile", ["avc"])[0]
        if profile not in PROFILES:
            raise ProxyError("unknown_profile", "不支援的畫質選項。", 400)
        if path == "/":
            return self.send(200, (Path(__file__).with_name("index.html")).read_bytes(), "text/html; charset=utf-8")
        if path in ("/health", "/status"):
            with gateway.lock:
                sessions = [s.summary() for s in gateway.sessions.values()]
            return self.json({"pluginURL": gateway.origin + "/plugin_youtube/config.json", "channel": CHANNEL,
                              "playlists": len(gateway.allowed_playlists), "loadedPlaylists": len(gateway.playlists),
                              "traditionalChinesePlaylists": sum(is_traditional_chinese_playlist(e) for e in gateway.catalog.get("entries", [])),
                              "cookiesLoaded": bool(gateway.cookie_count) and not gateway.cookies_invalid,
                              "cookieRecovery": {"mode": "automatic-cdp", "refreshes": gateway.cookie_refreshes,
                                                 "needsRefresh": gateway.cookies_invalid, "lastError": gateway.cookie_refresh_error},
                              "sessions": sessions})
        if path == "/plugin_youtube/config.json":
            config = json.loads((PLUGIN / "config.json").read_text())
            config["host"] = gateway.origin
            for page in config["pages"]:
                page["url"] = page["url"].replace("http://127.0.0.1:18771", gateway.origin)
            config["search"]["url"] = config["search"]["url"].replace("http://127.0.0.1:18771", gateway.origin)
            return self.json(config)
        if path == "/plugin_youtube/app.js":
            return self.send(200, (PLUGIN / "app.js").read_bytes(), "application/javascript")
        if path == "/api/catalog":
            return self.json(gateway.medias(profile, query.get("language", [None])[0]))
        if path == "/api/samples":
            return self.json(gateway.samples())
        if path == "/api/search":
            keyword = query.get("keyword", [""])[0].casefold()
            medias = [m for p in PROFILES for m in gateway.medias(p)] + gateway.samples()
            return self.json([m for m in medias if keyword in m["title"].casefold()])
        if path == "/api/sample":
            return self.json(playlist_episodes({"entries": [{"id": SAMPLE, "title": "[繁中字幕] SEED HD Remaster · 第 10 集"}]}, gateway.origin, profile))
        if match := re.fullmatch(r"/api/playlists/([A-Za-z0-9_-]+)", path):
            return self.json(gateway.episodes(match[1], profile))
        if match := re.fullmatch(r"/api/play/([A-Za-z0-9_-]{11})", path):
            return self.json(gateway.resolve(match[1], profile))
        if match := re.fullmatch(r"/api/subtitles/([A-Za-z0-9_-]{11})/([A-Za-z0-9-]+)\.vtt", path):
            with gateway.lock:
                subtitle = gateway.subtitles.get((match[1], match[2]))
            if subtitle is None:
                raise ProxyError("subtitle_not_found", "請先選播該影片以取得字幕。", 404)
            return self.send(200, subtitle["body"], "text/vtt; charset=utf-8")
        if match := re.fullmatch(r"/sessions/([a-f0-9-]+)/(master\.m3u8|video\.m3u8|audio\.m3u8|subtitles\.m3u8|subtitles\.vtt|manifest\.mpd|summary\.json|video\.mp4|audio\.mp4)", path):
            with gateway.lock:
                session = gateway.sessions.get(match[1])
            if session is None:
                raise ProxyError("session_not_found", "播放工作階段已不存在，請回分集重新解析。", 404)
            resource = match[2]
            if resource == "summary.json":
                return self.json(session.summary())
            if resource == "manifest.mpd":
                return self.send(200, session.manifest, "application/dash+xml")
            if resource == "master.m3u8":
                return self.send(200, session.master, "application/vnd.apple.mpegurl")
            if resource in ("video.m3u8", "audio.m3u8"):
                return self.send(200, session.playlists[resource.split(".")[0]], "application/vnd.apple.mpegurl")
            if resource in ("subtitles.m3u8", "subtitles.vtt"):
                if not session.subtitle_playlist:
                    raise ProxyError("subtitle_unavailable", "此影片未提供所選語言字幕。", 404)
                if resource.endswith("m3u8"):
                    return self.send(200, session.subtitle_playlist, "application/vnd.apple.mpegurl")
                return self.send(200, hls_vtt(session.source["subtitle"]["body"]), "text/vtt; charset=utf-8")
            return self.media(session, session.source[resource.split(".")[0]])
        return self.json({"error": {"code": "not_found", "message": "找不到此路徑。"}}, 404)

    def media(self, session, track):
        length = track["filesize"]
        try:
            span = byte_range(self.headers.get("Range"), length)
        except ValueError:
            return self.send(416, b"", "text/plain", {"Content-Range": f"bytes */{length}"})
        start, end = span or (0, length - 1)
        event = {"event": "range", "sessionID": session.id, "resource": track["format_id"],
                 "method": self.command, "start": start, "end": end, "status": 206 if span else 200, "bytesSent": 0}
        sent_headers, started = False, time.monotonic()
        event["startedAt"] = time.time()
        chunks = None
        try:
            chunks = self.raw_chunks(start, end, event, started, session.media_readers[track["format_id"]])
            # Surface a failed initial upstream read as 502, before the 206 header.
            first = next(chunks) if self.command != "HEAD" else b""
            if self.command != "HEAD":
                event["firstChunkSeconds"] = round(time.monotonic() - started, 6)
            self.send_response(event["status"])
            self.send_header("Content-Type", "video/mp4")
            self.send_header("Content-Length", str(end - start + 1))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "no-store")
            if span:
                self.send_header("Content-Range", f"bytes {start}-{end}/{length}")
            self.end_headers()
            sent_headers = True
            if self.command != "HEAD":
                self.wfile.write(first)
                event["firstWriteSeconds"] = round(time.monotonic() - started, 6)
                event["bytesSent"] += len(first)
                for chunk in chunks:
                    self.wfile.write(chunk)
                    event["bytesSent"] += len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            event["clientCancelled"] = True
        except Exception as error:
            event["error"] = error_code(error)
            if not sent_headers:
                event["status"] = 502
                self.json({"error": {"code": event["error"], "message": "YouTube 取流失敗，請回分集重新解析或檢查 Mac 日誌。"}}, 502)
            self.close_connection = True
        finally:
            if chunks is not None:
                chunks.close()
            event["elapsedSeconds"] = round(time.monotonic() - started, 3)
            self.server.gateway.record(event)

    @staticmethod
    def raw_chunks(start, end, event, started, reader):
        def received_headers():
            event.setdefault("upstreamHeadersSeconds", round(time.monotonic() - started, 6))
            event["upstreamRequestCount"] = event.get("upstreamRequestCount", 0) + 1

        def read_bytes(source, count):
            key = "cacheReadBytes" if source == "cache" else "upstreamReadBytes"
            event[key] = event.get(key, 0) + count

        yield from reader.chunks(start, end, on_headers=received_headers, on_read=read_bytes)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", required=True)
    parser.add_argument("--port", type=int, default=18771)
    parser.add_argument("--artifacts", type=Path, required=True)
    parser.add_argument("--extractor", required=True)
    parser.add_argument("--player-client", default="tv_samsung")
    parser.add_argument("--js-runtime", default="deno")
    parser.add_argument("--cookie-file", type=Path)
    parser.add_argument("--cdp-url", default="http://localhost:9222")
    parser.add_argument("--node", default="node")
    parser.add_argument("--cdp-cookie-file", type=Path, help="Private destination for refreshed CDP cookies")
    parser.add_argument("--subtitle-language", default="zh-TW")
    args = parser.parse_args()
    os.umask(0o077)
    try:
        gateway = Gateway(args)
    except ProxyError as error:
        print(json.dumps({"event": "startup_failed", "error": error.code, "message": error.message}, ensure_ascii=False), flush=True)
        sys.exit(1)
    server = ThreadingHTTPServer((args.bind, args.port), Handler)
    server.daemon_threads = True
    server.gateway = gateway
    ready = {"event": "ready", "gatewayPID": os.getpid(), "pluginURL": gateway.origin + "/plugin_youtube/config.json",
             "dashboardURL": gateway.origin + "/", "playlists": len(gateway.allowed_playlists)}
    (args.artifacts / "service.json").write_text(json.dumps(ready, indent=2))
    print(json.dumps(ready, ensure_ascii=False), flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
