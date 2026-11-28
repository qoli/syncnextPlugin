"""Session-local, on-demand storage of already verified original media bytes."""

from pathlib import Path
import threading

from youtube import RangeReader


class CachedRangeReader:
    def __init__(self, track, path):
        self.reader = RangeReader(track)
        self.path = Path(path)
        self.spans = []  # Half-open byte intervals, sorted and disjoint.
        self.lock = threading.Lock()

    def _include(self, start, end):
        merged = []
        for a, b in sorted([*self.spans, (start, end)]):
            if merged and a <= merged[-1][1]:
                merged[-1] = (merged[-1][0], max(b, merged[-1][1]))
            else:
                merged.append((a, b))
        self.spans = merged

    def chunks(self, start, end, on_headers=None, on_read=None):
        # The same track's HTTP reader is already serial. Audio and video have
        # separate readers, connections and files. No body is fetched ahead of demand.
        with self.lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with self.path.open('r+b' if self.path.exists() else 'w+b') as stored:
                cursor = start
                while cursor <= end:
                    covered = next((b for a, b in self.spans if a <= cursor < b), None)
                    if covered is not None:
                        count = min(64 * 1024, end + 1 - cursor, covered - cursor)
                        stored.seek(cursor)
                        body = stored.read(count)
                        if len(body) != count:
                            raise ValueError('cached_range_incomplete')
                        if on_read is not None:
                            on_read('cache', len(body))
                        cursor += len(body)
                        yield body
                        continue
                    next_cached = min((a for a, _ in self.spans if a > cursor), default=end + 1)
                    missing_end = min(end + 1, next_cached)
                    incoming = self.reader.chunks(cursor, missing_end - 1, on_headers=on_headers)
                    try:
                        for body in incoming:
                            stored.seek(cursor)
                            if stored.write(body) != len(body):
                                raise ValueError('cached_range_write_failed')
                            self._include(cursor, cursor + len(body))
                            if on_read is not None:
                                on_read('upstream', len(body))
                            cursor += len(body)
                            yield body
                    finally:
                        incoming.close()
