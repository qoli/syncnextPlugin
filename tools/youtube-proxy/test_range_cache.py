"""Original-byte, overlap, interruption and concurrent-read contracts."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import tempfile
import threading
import unittest

from range_cache import CachedRangeReader


class Source:
    def __init__(self, body):
        self.body = body
        self.calls = []
        self.failure = None

    def chunks(self, start, end, on_headers=None):
        self.calls.append((start, end))
        if self.failure is not None:
            raise self.failure
        if on_headers is not None:
            on_headers()
        for offset in range(start, end + 1, 32):
            yield self.body[offset:min(offset + 32, end + 1)]


class RangeCacheTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.body = bytes(range(256)) * 8
        self.source = Source(self.body)
        track = {'url': 'http://example.invalid/video', 'http_headers': {}, 'filesize': len(self.body)}
        self.cache = CachedRangeReader(track, Path(self.temp.name) / 'video.mp4')
        self.cache.reader = self.source

    def tearDown(self):
        self.temp.cleanup()

    def read(self, start, end):
        return b''.join(self.cache.chunks(start, end))

    def test_overlapping_ranges_fetch_only_the_missing_original_bytes(self):
        self.assertEqual(self.read(100, 199), self.body[100:200])
        self.assertEqual(self.read(150, 249), self.body[150:250])
        self.assertEqual(self.read(110, 239), self.body[110:240])
        self.assertEqual(self.source.calls, [(100, 199), (200, 249)])

    def test_disjoint_cached_spans_preserve_the_gap_and_trailing_bytes(self):
        self.read(0, 99)
        self.read(200, 299)
        self.assertEqual(self.read(50, 249), self.body[50:250])
        self.assertEqual(self.source.calls, [(0, 99), (200, 299), (100, 199)])

    def test_interrupted_read_retains_only_bytes_already_received(self):
        incoming = self.cache.chunks(0, 127)
        self.assertEqual(next(incoming), self.body[:32])
        incoming.close()
        self.assertEqual(self.read(0, 127), self.body[:128])
        self.assertEqual(self.source.calls, [(0, 127), (32, 127)])

    def test_concurrent_reads_share_verified_bytes(self):
        ready = threading.Barrier(2)
        def read():
            ready.wait()
            return self.read(0, 255)
        with ThreadPoolExecutor(max_workers=2) as pool:
            first, second = pool.submit(read), pool.submit(read)
            self.assertEqual(first.result(), self.body[:256])
            self.assertEqual(second.result(), self.body[:256])
        self.assertEqual(self.source.calls, [(0, 255)])

    def test_cache_hit_does_not_contact_or_revalidate_the_upstream(self):
        self.read(0, 127)
        self.source.failure = ValueError('upstream_http_403')
        self.assertEqual(self.read(16, 63), self.body[16:64])
        self.assertEqual(self.source.calls, [(0, 127)])

    def test_missing_bytes_report_upstream_failure_without_a_retry(self):
        self.read(0, 31)
        self.source.failure = ValueError('upstream_http_403')
        with self.assertRaisesRegex(ValueError, 'upstream_http_403'):
            self.read(32, 63)
        self.assertEqual(self.source.calls, [(0, 31), (32, 63)])

    def test_incomplete_cache_is_an_explicit_error(self):
        self.read(0, 63)
        self.cache.path.write_bytes(b'')
        with self.assertRaisesRegex(ValueError, 'cached_range_incomplete'):
            self.read(0, 63)
        self.assertEqual(self.source.calls, [(0, 63)])
