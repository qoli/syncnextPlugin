"""YouTube-only credentials and exact upstream MP4 Range reads."""

import copy
import hashlib
import json
from http.cookiejar import MozillaCookieJar
from http.client import HTTPConnection, HTTPSConnection
import re
import struct
import threading
from urllib.parse import urlsplit
from urllib.request import HTTPSHandler, Request, build_opener


class IPv4HTTPSConnection(HTTPSConnection):
    def __init__(self, *args, **kwargs):
        kwargs["source_address"] = ("0.0.0.0", 0)
        super().__init__(*args, **kwargs)


class IPv4HTTPSHandler(HTTPSHandler):
    def https_open(self, request):
        return self.do_open(IPv4HTTPSConnection, request, context=self._context)


MEDIA_OPENER = build_opener(IPv4HTTPSHandler())


def private_youtube_cookies(original, destination):
    """Give the extractor a mutable, YouTube-only copy, preserving the input jar."""
    if original.resolve() == destination.resolve():
        raise ValueError("cookie_input_must_differ_from_working_copy")
    supplied = MozillaCookieJar(str(original))
    supplied.load(ignore_discard=True, ignore_expires=True)
    working = MozillaCookieJar(str(destination))
    for cookie in supplied:
        domain = cookie.domain.lstrip(".").lower()
        if domain != "youtube.com" and not domain.endswith(".youtube.com"):
            continue
        item = copy.copy(cookie)
        if item.expires == 0:
            item.expires, item.discard = None, True
        if not item.is_expired():
            working.set_cookie(item)
    if not len(working):
        raise ValueError("no_active_youtube_cookies")
    working.save(ignore_discard=True, ignore_expires=True)
    destination.chmod(0o600)
    return len(working)


def youtube_cookie_identity(path):
    """Identify a login generation without exposing its credential values.

    Match the pinned extractor's authentication test: LOGIN_INFO plus a
    SAPISID-family cookie. yt-dlp can clear LOGIN_INFO after rotation.
    """
    jar = MozillaCookieJar(str(path))
    jar.load(ignore_discard=True, ignore_expires=True)
    active = [c for c in jar if c.expires in (None, 0) or not c.is_expired()]
    names = {c.name for c in active}
    auth = {"SAPISID", "__Secure-1PAPISID", "__Secure-3PAPISID"}
    if "LOGIN_INFO" not in names or not names.intersection(auth):
        return None
    credentials = sorted((c.domain, c.path, c.name, c.value) for c in active)
    return hashlib.sha256(json.dumps(credentials).encode()).hexdigest()


def load_subtitle(path, language):
    body = path.read_bytes()
    text = body.decode("utf-8-sig")
    if not text.startswith("WEBVTT"):
        raise ValueError("expected_webvtt")
    cue_count = len(re.findall(r"(?m)^(?:[0-9]{2,}:)?[0-9]{2}:[0-9]{2}\.[0-9]{3} --> ", text))
    if not cue_count:
        raise ValueError("webvtt_has_no_cues")
    return {"body": body, "language": language, "name": "繁體中文（台灣）" if language == "zh-TW" else language,
            "available": True, "cueCount": cue_count, "format": "webvtt", "sha256": hashlib.sha256(body).hexdigest()}


def premium_state(cookie_count, extractor_log, required):
    # The pinned extractor reports cookie rotation explicitly. Do not let its
    # anonymous continuation become an authenticated proxy result.
    if cookie_count and "provided YouTube account cookies are no longer valid" in extractor_log:
        raise ValueError("youtube_cookies_invalid")
    detected = bool(cookie_count) and "Detected YouTube Premium subscription" in extractor_log
    if required and not detected:
        raise ValueError("youtube_premium_not_detected")
    return detected


def byte_range(value, length):
    """Normalize a single inclusive HTTP range, including open and suffix ranges."""
    if value is None:
        return None
    match = re.fullmatch(r"bytes=(\d*)-(\d*)", value)
    if not match or not any(match.groups()):
        raise ValueError("unsupported_range")
    first, last = match.groups()
    if not first:
        count = int(last)
        if count == 0:
            raise ValueError("unsatisfiable_range")
        return max(0, length - count), length - 1
    start = int(first)
    end = min(int(last), length - 1) if last else length - 1
    if start >= length or start > end:
        raise ValueError("unsatisfiable_range")
    return start, end


def upstream(track, span=None):
    headers = dict(track["http_headers"])
    headers["Accept-Encoding"] = "identity"
    if span is not None:
        headers["Range"] = f"bytes={span[0]}-{span[1]}"
    response = MEDIA_OPENER.open(Request(track["url"], headers=headers))
    if span is not None:
        expected = f"bytes {span[0]}-{span[1]}/{track['filesize']}"
        if response.status != 206 or response.headers.get("Content-Range") != expected:
            detail = f"expected={expected} status={response.status} actual={response.headers.get('Content-Range')}"
            response.close()
            raise ValueError("upstream_did_not_honor_exact_range " + detail)
    return response


def read_span(track, start, end):
    with upstream(track, (start, end)) as response:
        body = response.read()
    if len(body) != end - start + 1:
        raise ValueError("truncated_upstream_range")
    return body


class RangeReader:
    """Reuse one media connection across adjacent indexed subsegments.

    A failed request is reported to the caller without a retry. The next
    distinct read opens a new connection after that failure.
    """

    def __init__(self, track):
        self.track = track
        self.url = urlsplit(track["url"])
        self.connection = None
        self.lock = threading.Lock()

    def __call__(self, start, end):
        with self.lock:
            try:
                if self.connection is None:
                    connection_type = HTTPSConnection if self.url.scheme == "https" else HTTPConnection
                    self.connection = connection_type(self.url.hostname, self.url.port, source_address=("0.0.0.0", 0))
                headers = {**self.track["http_headers"], "Accept-Encoding": "identity", "Connection": "keep-alive",
                           "Range": f"bytes={start}-{end}"}
                target = self.url.path + ("?" + self.url.query if self.url.query else "")
                self.connection.request("GET", target, headers=headers)
                response = self.connection.getresponse()
                expected = f"bytes {start}-{end}/{self.track['filesize']}"
                if response.status != 206:
                    raise ValueError("upstream_http_" + str(response.status))
                if response.getheader("Content-Range") != expected:
                    raise ValueError("upstream_range_mismatch")
                body = response.read()
                response.close()
                if len(body) != end - start + 1:
                    raise ValueError("truncated_upstream_range")
                return body
            except Exception:
                if self.connection is not None:
                    self.connection.close()
                    self.connection = None
                raise


def segment_base(track, read=None):
    """Read MP4 box headers, then the declared sidx, without downloading the file."""
    read = read or (lambda start, end: read_span(track, start, end))
    offset = 0
    found_moov = False
    while offset < track["filesize"]:
        header = read(offset, offset + 15)
        size, kind = struct.unpack_from(">I4s", header)
        if size == 1:
            size = struct.unpack_from(">Q", header, 8)[0]
        elif size == 0:
            size = track["filesize"] - offset
        if size < 8 or offset + size > track["filesize"]:
            raise ValueError("invalid_mp4_box_size")
        found_moov |= kind == b"moov"
        if kind == b"sidx":
            if not found_moov:
                raise ValueError("sidx_precedes_initialization")
            index = read(offset, offset + size - 1)
            header_bytes = 16 if struct.unpack_from(">I", index)[0] == 1 else 8
            version = index[header_bytes]
            timescale = struct.unpack_from(">I", index, header_bytes + 8)[0]
            cursor = header_bytes + (28 if version == 1 else 20)
            count = struct.unpack_from(">H", index, cursor + 2)[0]
            cursor += 4
            earliest, first_offset = struct.unpack_from(">QQ" if version == 1 else ">II", index, header_bytes + 12)
            source_offset = offset + size + first_offset
            timestamp = earliest
            segments = []
            durations = []
            for _ in range(count):
                reference, duration, _sap = struct.unpack_from(">III", index, cursor)
                if reference >> 31:
                    raise ValueError("hierarchical_sidx_not_supported_by_aether")
                segments.append({"offset": source_offset, "size": reference, "duration": duration,
                                 "timestamp": timestamp, "sap": _sap})
                source_offset += reference
                timestamp += duration
                durations.append(duration)
                cursor += 12
            if not timescale or not durations:
                raise ValueError("empty_sidx")
            return {
                "initialization": [0, offset - 1],
                "index": [offset, offset + size - 1],
                "references": count, "segments": segments,
                "timescale": timescale,
                "indexedDurationSeconds": sum(durations) / timescale,
                "indexSHA256": hashlib.sha256(index).hexdigest(),
            }
        if kind in (b"mdat", b"moof"):
            raise ValueError("media_precedes_sidx")
        offset += size
    raise ValueError("sidx_missing")
