"""YouTube-only credentials and exact upstream MP4 Range reads."""

import copy
import hashlib
import json
from http.cookiejar import MozillaCookieJar
from http.client import HTTPConnection, HTTPSConnection
from urllib.error import HTTPError, URLError
import re
import struct
import threading
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, HTTPSHandler, Request, build_opener


class IPv4HTTPSConnection(HTTPSConnection):
    def __init__(self, *args, **kwargs):
        kwargs["source_address"] = ("0.0.0.0", 0)
        super().__init__(*args, **kwargs)


class IPv4HTTPSHandler(HTTPSHandler):
    def https_open(self, request):
        return self.do_open(IPv4HTTPSConnection, request, context=self._context)


MEDIA_OPENER = build_opener(IPv4HTTPSHandler())


class MediaRedirectFailure(ValueError):
    def __init__(self, status, cause):
        super().__init__('media_redirect_failed')
        self.status = status
        if isinstance(cause, HTTPError):
            self.cause_code = 'upstream_http_' + str(cause.code)
        elif isinstance(cause, URLError):
            self.cause_code = 'upstream_' + type(cause.reason).__name__
        elif isinstance(cause, ValueError) and re.fullmatch(r'[a-z_0-9]+', str(cause)):
            self.cause_code = str(cause)
        else:
            self.cause_code = type(cause).__name__


def media_origin(value):
    url = urlsplit(value)
    return url.scheme, url.hostname, url.port or (443 if url.scheme == 'https' else 80)


class MediaRedirectHandler(HTTPRedirectHandler):
    """Use urllib's existing redirect/cycle budget, retaining Range and credential scope."""
    def __init__(self, record):
        self.record = record
        self.hops = 0
        self.last_headers = None

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        target = urlsplit(newurl)
        if target.scheme not in ('http', 'https'):
            raise ValueError('media_redirect_unsupported_scheme')
        if req.type == 'https' and target.scheme != 'https':
            raise ValueError('media_redirect_downgrade')
        request = super().redirect_request(req, fp, code, msg, headers, newurl)
        if media_origin(req.full_url) != media_origin(newurl):
            for name in list(request.headers) + list(request.unredirected_hdrs):
                if name.lower() in ('authorization', 'proxy-authorization', 'cookie', 'cookie2', 'host'):
                    request.remove_header(name)
        self.hops += 1
        self.last_headers = dict(request.headers)
        self.record('media_redirect', status=code, hop=self.hops,
                    fromHost=urlsplit(req.full_url).hostname, toHost=target.hostname)
        return request


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
    """Reuse a primary media connection across adjacent indexed subsegments.

    A redirect gets one urllib fallback, using its normal bounded redirect
    policy. A validated destination is retained for subsequent keep-alive reads.
    Concurrent ranges use separate connections, closed after their own reads,
    so an unrelated slow response does not serialize playback and seeking.
    Other primary-path failures are reported without a same-request retry.
    """

    def __init__(self, track, on_recovery=None):
        self.track = track
        self.url = urlsplit(track["url"])
        self.request_headers = dict(track['http_headers'])
        self.endpoint = (track['url'], self.request_headers)
        self.connection = None
        self.lock = threading.Lock()
        self.on_recovery = on_recovery

    def _record(self, event, **fields):
        if self.on_recovery is not None:
            self.on_recovery({'event': event, 'formatID': self.track.get('format_id'), **fields})

    def _redirect_failure(self, status, cause):
        error = MediaRedirectFailure(status, cause)
        self._record('media_range_fallback_failed', originalStatus=status, cause=error.cause_code)
        return error

    def _response(self, start, end):
        if self.connection is None:
            connection_type = HTTPSConnection if self.url.scheme == 'https' else HTTPConnection
            self.connection = connection_type(self.url.hostname, self.url.port, source_address=('0.0.0.0', 0))
        headers = {**self.request_headers, 'Accept-Encoding': 'identity', 'Connection': 'keep-alive',
                   'Range': f'bytes={start}-{end}'}
        target = self.url.path + ('?' + self.url.query if self.url.query else '')
        self.connection.request('GET', target, headers=headers)
        response = self.connection.getresponse()
        if response.status not in (301, 302, 303, 307, 308):
            return response, None
        status = response.status
        response.close()
        self.connection.close()
        self.connection = None
        self._record('media_range_fallback_started', originalStatus=status, attempt=1, start=start, end=end)
        redirects = MediaRedirectHandler(self._record)
        try:
            # Replay exactly this GET/Range once. urllib follows its own bounded
            # chain; it never changes the video, profile, format or byte interval.
            response = build_opener(IPv4HTTPSHandler(), redirects).open(Request(self.url.geturl(), headers=headers))
            return response, {'status': status, 'url': response.geturl(),
                              'headers': redirects.last_headers or headers, 'hops': redirects.hops}
        except Exception as error:
            if isinstance(error, HTTPError):
                error.close()
            raise self._redirect_failure(status, error) from error

    def __call__(self, start, end):
        return b"".join(self.chunks(start, end))

    def chunks(self, start, end, on_headers=None):
        """Stream a precise Range and reuse its connection only after the body is consumed."""
        if not self.lock.acquire(blocking=False):
            url, headers = self.endpoint
            parallel = RangeReader({**self.track, 'url': url, 'http_headers': headers}, on_recovery=self.on_recovery)
            try:
                self._record('media_parallel_range', start=start, end=end)
                yield from parallel.chunks(start, end, on_headers=on_headers)
            finally:
                if parallel.connection is not None:
                    parallel.connection.close()
            return
        try:
            yield from self._chunks(start, end, on_headers)
        finally:
            self.lock.release()

    def _chunks(self, start, end, on_headers):
        response = None
        recovery = None
        consumed = False
        try:
            response, recovery = self._response(start, end)
            expected = f"bytes {start}-{end}/{self.track['filesize']}"
            if response.status != 206:
                raise ValueError("upstream_http_" + str(response.status))
            if response.getheader("Content-Range") != expected:
                raise ValueError("upstream_range_mismatch")
            if recovery is not None:
                self.url = urlsplit(recovery['url'])
                self.request_headers = {k: v for k, v in recovery['headers'].items()
                                        if k.lower() not in ('range', 'connection', 'accept-encoding')}
                self.track['url'] = recovery['url']
                self.track['http_headers'] = dict(self.request_headers)
                # Publish URL and credential scope together for concurrent reads.
                self.endpoint = (recovery['url'], self.request_headers)
            if on_headers is not None:
                on_headers()
            remaining = end - start + 1
            while remaining:
                body = response.read(min(64 * 1024, remaining))
                if not body:
                    raise ValueError("truncated_upstream_range")
                remaining -= len(body)
                yield body
            consumed = True
            if recovery is not None:
                self._record('media_range_fallback_succeeded', originalStatus=recovery['status'],
                             status=206, redirects=recovery['hops'], finalHost=self.url.hostname)
        except Exception as error:
            if recovery is not None:
                raise self._redirect_failure(recovery['status'], error) from error
            raise
        finally:
            if response is not None:
                response.close()
            # Includes generator cancellation after a client disconnect. An unread
            # response cannot be reused for the next distinct Range; never retry it.
            if not consumed and self.connection is not None:
                self.connection.close()
                self.connection = None


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
