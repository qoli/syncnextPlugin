"""Real redirect/Range transport and bounded same-profile resolution recovery."""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import io
import json
from pathlib import Path
from types import SimpleNamespace
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request

from gateway import Gateway, ProxyError
from youtube import MediaRedirectFailure, MediaRedirectHandler, RangeReader, byte_range


class RedirectTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.body = bytes(range(256)) * 16
        cls.calls = []

        class Origin(BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.1'
            def log_message(self, *_): pass
            def handle(self):
                try: super().handle()
                except (ConnectionResetError, BrokenPipeError): pass
            def do_GET(self):
                path = urlsplit(self.path).path
                cls.calls.append({'path': path, 'range': self.headers.get('Range'),
                    'authorization': self.headers.get('Authorization'), 'cookie': self.headers.get('Cookie'),
                    'proxyAuthorization': self.headers.get('Proxy-Authorization'),
                    'agent': self.headers.get('User-Agent'), 'connection': self.client_address})
                redirects = {'/redirect': (302, '/middle?sig=fixture-signature'),
                             '/middle': (307, '/data?sig=fixture-signature'),
                             '/loop-a': (302, '/loop-b'), '/loop-b': (302, '/loop-a'),
                             '/bad': (302, '/bad-range'),
                             '/cross': (302, f'http://127.0.0.1:{cls.other.server_port}/data')}
                if path in redirects:
                    code, location = redirects[path]
                    self.send_response(code); self.send_header('Location', location)
                    self.send_header('Content-Length', '0'); self.end_headers(); return
                if path in ('/missing', '/forbidden'):
                    self.send_response(302 if path == '/missing' else 403)
                    self.send_header('Content-Length', '0'); self.end_headers(); return
                a, b = byte_range(self.headers.get('Range'), len(cls.body))
                self.send_response(206)
                self.send_header('Content-Length', str(b - a + 1))
                reported_a = a + 1 if path == '/bad-range' else a
                self.send_header('Content-Range', f'bytes {reported_a}-{b}/{len(cls.body)}')
                self.end_headers(); self.wfile.write(cls.body[a:b + 1])

        cls.other = ThreadingHTTPServer(('127.0.0.1', 0), Origin)
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Origin)
        cls.threads = [threading.Thread(target=s.serve_forever, daemon=True) for s in (cls.other, cls.server)]
        for thread in cls.threads: thread.start()
        cls.origin = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        for server in (cls.server, cls.other): server.shutdown(); server.server_close()
        for thread in cls.threads: thread.join()

    def setUp(self):
        self.calls.clear()
        self.events = []

    def reader(self, path, headers=None):
        reader = RangeReader({'format_id': '721', 'url': self.origin + path,
                              'http_headers': headers or {}, 'filesize': len(self.body)},
                             on_recovery=self.events.append)
        self.addCleanup(lambda: reader.connection.close() if reader.connection is not None else None)
        return reader

    def test_redirect_chain_preserves_bytes_and_remembers_final_endpoint(self):
        reader = self.reader('/redirect?sig=fixture-signature')
        self.assertEqual(reader(0, 15), self.body[:16])
        self.assertEqual(urlsplit(reader.track['url']).path, '/data')
        self.assertEqual(reader(32, 47), self.body[32:48])
        self.assertEqual(reader(64, 79), self.body[64:80])
        self.assertEqual([x['path'] for x in self.calls], ['/redirect', '/redirect', '/middle', '/data', '/data', '/data'])
        self.assertEqual([x['range'] for x in self.calls[:4]], ['bytes=0-15'] * 4)
        self.assertEqual(self.calls[-2]['connection'], self.calls[-1]['connection'])
        self.assertEqual(sum(e['event'] == 'media_range_fallback_started' for e in self.events), 1)
        self.assertEqual(sum(e['event'] == 'media_range_fallback_succeeded' for e in self.events), 1)
        self.assertNotIn('fixture-signature', json.dumps(self.events))

    def test_cross_origin_redirect_drops_credentials_on_following_reads_too(self):
        reader = self.reader('/cross', {'Authorization': 'Bearer fixture-secret', 'Cookie': 'fixture-cookie',
                                      'Proxy-Authorization': 'fixture-proxy', 'User-Agent': 'fixture-agent'})
        self.assertEqual(reader(0, 15), self.body[:16])
        self.assertEqual(reader(32, 47), self.body[32:48])
        final_calls = [x for x in self.calls if x['path'] == '/data']
        self.assertEqual(len(final_calls), 2)
        for request in final_calls:
            self.assertIsNone(request['authorization'])
            self.assertIsNone(request['cookie'])
            self.assertIsNone(request['proxyAuthorization'])
            self.assertEqual(request['agent'], 'fixture-agent')
        self.assertNotIn('fixture-secret', json.dumps(self.events))

    def test_loop_ends_under_the_existing_urllib_budget(self):
        reader = self.reader('/loop-a')
        with self.assertRaises(MediaRedirectFailure) as caught: reader(0, 15)
        self.assertEqual(caught.exception.status, 302)
        self.assertEqual(caught.exception.cause_code, 'upstream_http_302')
        self.assertLessEqual(len(self.calls), HTTPRedirectHandler.max_redirections + 2)
        self.assertEqual(sum(e['event'] == 'media_range_fallback_started' for e in self.events), 1)
        self.assertEqual(sum(e['event'] == 'media_range_fallback_failed' for e in self.events), 1)

    def test_missing_location_fails_after_one_fallback(self):
        with self.assertRaises(MediaRedirectFailure): self.reader('/missing')(0, 15)
        self.assertEqual(len(self.calls), 2)

    def test_redirect_cannot_bypass_exact_range_validation(self):
        reader = self.reader('/bad')
        with self.assertRaises(MediaRedirectFailure) as caught: reader(0, 15)
        self.assertEqual(caught.exception.cause_code, 'upstream_range_mismatch')
        self.assertEqual(urlsplit(reader.track['url']).path, '/bad')

    def test_direct_403_is_not_retried_or_reinterpreted_as_cookie_expiry(self):
        with self.assertRaisesRegex(ValueError, 'upstream_http_403'): self.reader('/forbidden')(0, 15)
        self.assertEqual(len(self.calls), 1)
        self.assertEqual(self.events, [])

    def test_https_redirect_never_downgrades_to_cleartext(self):
        handler = MediaRedirectHandler(lambda *_args, **_kwargs: None)
        with self.assertRaisesRegex(ValueError, 'media_redirect_downgrade'):
            handler.redirect_request(Request('https://example.invalid/video'), None, 302, '', {},
                                     'http://example.invalid/video')


class ResolveRecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.events, self.extractions = [], []
        g = self.gateway = Gateway.__new__(Gateway)
        g.args = SimpleNamespace(subtitle_language='zh-TW')
        g.artifacts = self.root
        g.lock = threading.Lock()
        g.allowed_videos = {'Xm998VbPZzo'}
        g.sessions, g.subtitles = {}, {}
        g.origin = 'http://127.0.0.1:18772'
        g.record = self.events.append
        g.extract = self.extract
        self.change_tracks = False
        self.fail_second_extract = False
        self.always_redirect_failure = False
        self.direct_failure = False

    def extract(self, url, directory, flat=False, profile=None):
        self.extractions.append((url, profile))
        directory.mkdir(parents=True, exist_ok=True)
        attempt = len(self.extractions)
        if attempt == 2 and self.fail_second_extract: raise ProxyError('extract_failed', 'fixture')
        common = {'filesize': 2048, 'http_headers': {}, 'ext': 'mp4'}
        return {'id': 'Xm998VbPZzo', 'title': 'Episode22', 'requested_subtitles': {},
                'proxyAccount': {'cookiesUsed': True, 'premiumDetected': True},
                'requested_formats': [
                    {**common, 'format_id': '712' if attempt == 2 and self.change_tracks else '721',
                     'url': f'https://cdn.invalid/{attempt}/video', 'vcodec': 'av01.0.08M.08', 'acodec': 'none',
                     'height': 1080, 'width': 1920, 'format_note': '1080p Premium', 'tbr': 1000},
                    {**common, 'format_id': '140', 'url': f'https://cdn.invalid/{attempt}/audio',
                     'vcodec': 'none', 'acodec': 'mp4a.40.2', 'tbr': 128}]}

    def prepare(self, track, read=None):
        if self.direct_failure: raise ValueError('upstream_http_403')
        if '/1/' in track['url'] or self.always_redirect_failure:
            raise MediaRedirectFailure(302, HTTPError('https://fixture.invalid', 302, '', {}, io.BytesIO()))
        return {'initialization': [0, 31], 'index': [32, 63], 'timescale': 1000,
                'references': 1, 'indexedDurationSeconds': 30, 'segments': [
                    {'offset': 64, 'size': 100, 'duration': 30000, 'timestamp': 0, 'sap': 0x90000000}]}

    def resolve(self):
        with patch('gateway.segment_base', side_effect=self.prepare):
            return self.gateway.resolve('Xm998VbPZzo', 'premium')

    def test_failed_redirect_reextracts_same_video_and_profile_once(self):
        result = self.resolve()
        self.assertTrue(result['url'].endswith('/manifest.mpd'))
        self.assertEqual(self.extractions, [('https://www.youtube.com/watch?v=Xm998VbPZzo', 'premium')] * 2)
        self.assertEqual(len(self.gateway.sessions), 1)
        self.assertEqual(sum(e['event'] == 'media_resolve_retry' for e in self.events), 1)
        self.assertEqual(sum(e['event'] == 'media_resolve_recovery_succeeded' for e in self.events), 1)

    def test_exhaustion_keeps_original_302_and_registers_no_session(self):
        self.always_redirect_failure = True
        with self.assertRaises(ProxyError) as caught: self.resolve()
        self.assertEqual(caught.exception.code, 'media_redirect_recovery_exhausted')
        self.assertIn('HTTP 302', caught.exception.message)
        self.assertEqual(len(self.extractions), 2)
        self.assertEqual(self.gateway.sessions, {})
        self.assertEqual(self.events[-1]['originalStatus'], 302)
        self.assertEqual(self.events[-1]['cause'], 'upstream_http_302')

    def test_changed_formats_on_retry_are_rejected(self):
        self.change_tracks = True
        with self.assertRaises(ProxyError) as caught: self.resolve()
        self.assertEqual(caught.exception.code, 'media_redirect_recovery_exhausted')
        self.assertEqual(self.events[-1]['cause'], 'media_retry_tracks_changed')
        self.assertEqual(self.gateway.sessions, {})

    def test_second_extraction_failure_does_not_hide_original_cause(self):
        self.fail_second_extract = True
        with self.assertRaises(ProxyError) as caught: self.resolve()
        self.assertIn('HTTP 302', caught.exception.message)
        self.assertEqual(self.events[-1]['cause'], 'extract_failed')
        self.assertEqual(len(self.extractions), 2)

    def test_direct_non_redirect_failure_does_not_reextract(self):
        self.direct_failure = True
        with self.assertRaisesRegex(ValueError, 'upstream_http_403'): self.resolve()
        self.assertEqual(len(self.extractions), 1)
        self.assertEqual(self.events, [])
