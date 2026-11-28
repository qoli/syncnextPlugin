"""HTTP Range clients must not queue cached or disjoint reads behind a stalled CDN read."""

from concurrent.futures import ThreadPoolExecutor, TimeoutError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace
import tempfile
import threading
import unittest
from urllib.request import Request, urlopen

from gateway import Handler
from range_cache import CachedRangeReader
from youtube import byte_range


class RangeConcurrencyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.body = bytes(range(256)) * 8192
        self.entered, self.release = threading.Event(), threading.Event()
        self.redirect_secondary = False
        self.calls, self.events = [], []
        test = self

        class Origin(BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.1'

            def log_message(self, *_): pass

            def do_GET(self):
                start, end = byte_range(self.headers.get('Range'), len(test.body))
                if test.redirect_secondary and start == 1048576 and self.path == '/video':
                    self.send_response(302)
                    self.send_header('Location', '/redirected')
                    self.send_header('Content-Length', '0')
                    self.end_headers()
                    return
                test.calls.append((start, end))
                if start == 262144:
                    test.entered.set()
                    test.release.wait()
                self.send_response(206)
                self.send_header('Content-Length', str(end - start + 1))
                self.send_header('Content-Range', f'bytes {start}-{end}/{len(test.body)}')
                self.end_headers()
                self.wfile.write(test.body[start:end + 1])

        self.origin = ThreadingHTTPServer(('127.0.0.1', 0), Origin)
        self.origin.daemon_threads = True
        track = {'format_id': '721', 'filesize': len(self.body), 'http_headers': {},
                 'url': f'http://127.0.0.1:{self.origin.server_port}/video'}
        self.cache = CachedRangeReader(track, Path(self.temp.name) / 'video.mp4', on_recovery=self.events.append)
        session = SimpleNamespace(id='abc', source={'video': track}, media_readers={'721': self.cache})
        self.proxy = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.proxy.daemon_threads = True
        self.proxy.gateway = SimpleNamespace(lock=threading.Lock(), sessions={'abc': session}, record=self.events.append)
        self.threads = [threading.Thread(target=s.serve_forever, daemon=True) for s in (self.origin, self.proxy)]
        for thread in self.threads: thread.start()
        self.pool = ThreadPoolExecutor(max_workers=2)

    def tearDown(self):
        self.release.set()
        self.pool.shutdown(wait=True)
        if self.cache.reader.connection is not None: self.cache.reader.connection.close()
        for server in (self.proxy, self.origin): server.shutdown(); server.server_close()
        for thread in self.threads: thread.join()
        self.temp.cleanup()

    def read(self, start, end):
        url = f'http://127.0.0.1:{self.proxy.server_port}/sessions/abc/video.mp4'
        with urlopen(Request(url, headers={'Range': f'bytes={start}-{end}'}), timeout=5) as response:
            self.assertEqual(response.status, 206)
            self.assertEqual(response.headers['Content-Range'], f'bytes {start}-{end}/{len(self.body)}')
            return response.read()

    def blocked_read(self):
        incoming = self.pool.submit(self.read, 262144, 786431)
        self.assertTrue(self.entered.wait(2), 'stalled upstream request did not start')
        return incoming

    def before_release(self, future):
        try:
            return future.result(timeout=1)
        except TimeoutError:
            self.fail('independent Range remained blocked until the unrelated upstream was released')

    def test_cached_range_does_not_wait_for_a_stalled_upstream(self):
        self.assertEqual(self.read(0, 127), self.body[:128])
        slow = self.blocked_read()
        cached = self.pool.submit(self.read, 16, 63)
        self.assertEqual(self.before_release(cached), self.body[16:64])
        self.assertFalse(slow.done())
        self.assertEqual(self.calls, [(0, 127), (262144, 786431)])

    def test_disjoint_missing_range_does_not_wait_for_a_stalled_upstream(self):
        slow = self.blocked_read()
        seeking = self.pool.submit(self.read, 1048576, 1114111)
        self.assertEqual(self.before_release(seeking), self.body[1048576:1114112])
        self.assertFalse(slow.done())
        self.assertIn((1048576, 1114111), self.calls)

    def test_parallel_connection_retains_redirect_recovery_and_exact_range(self):
        self.redirect_secondary = True
        slow = self.blocked_read()
        seeking = self.pool.submit(self.read, 1048576, 1114111)
        self.assertEqual(self.before_release(seeking), self.body[1048576:1114112])
        self.assertFalse(slow.done())
        self.assertTrue(any(e['event'] == 'media_parallel_range' for e in self.events))
        self.assertTrue(any(e['event'] == 'media_range_fallback_succeeded' for e in self.events))

    def test_overlapping_clients_fetch_each_original_byte_once(self):
        self.release.set()
        spans = [(0, 524287), (262144, 786431), (65536, 1048575), (524288, 1048575),
                 (131072, 917503), (0, 1048575)]
        with ThreadPoolExecutor(max_workers=len(spans)) as clients:
            results = list(clients.map(lambda span: self.read(*span), spans))
        for (start, end), body in zip(spans, results):
            self.assertEqual(body, self.body[start:end + 1])
        original = sorted(self.calls)
        self.assertEqual(original[0][0], 0)
        self.assertEqual(original[-1][1], 1048575)
        for previous, following in zip(original, original[1:]):
            self.assertEqual(previous[1] + 1, following[0])
