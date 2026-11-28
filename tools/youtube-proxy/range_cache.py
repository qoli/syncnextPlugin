"""Session-local, on-demand storage of already verified original media bytes."""

from pathlib import Path
import threading
import time

from youtube import RangeReader


class CachedRangeReader:
    def __init__(self, track, path, on_recovery=None):
        self.reader = RangeReader(track, on_recovery=on_recovery)
        self.path = Path(path)
        self.spans = []  # Half-open byte intervals, sorted and disjoint.
        self.lock = threading.Lock()
        self.changed = threading.Condition(self.lock)
        self.pending = []  # Missing intervals currently being fetched by a client.

    def _include(self, start, end):
        merged = []
        for a, b in sorted([*self.spans, (start, end)]):
            if merged and a <= merged[-1][1]:
                merged[-1] = (merged[-1][0], max(b, merged[-1][1]))
            else:
                merged.append((a, b))
        self.spans = merged

    def chunks(self, start, end, on_headers=None, on_read=None, on_wait=None):
        with self.changed:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            # Each request has its own cursor. Publish spans only after unbuffered
            # writes, so concurrent readers can immediately use verified bytes.
            stored = self.path.open('r+b' if self.path.exists() else 'w+b', buffering=0)
        with stored:
            cursor = start
            while cursor <= end:
                waited, claim = None, None
                with self.changed:
                    covered = next((b for a, b in self.spans if a <= cursor < b), None)
                    if covered is not None:
                        count = min(64 * 1024, end + 1 - cursor, covered - cursor)
                    elif any(a <= cursor < b for a, b in self.pending):
                        started = time.monotonic()
                        self.changed.wait()
                        waited = time.monotonic() - started
                    else:
                        boundary = min([end + 1] + [a for a, _ in (*self.spans, *self.pending) if a > cursor])
                        claim = (cursor, boundary)
                        self.pending.append(claim)
                if waited is not None:
                    if on_wait is not None:
                        on_wait(waited)
                    continue
                if claim is None:
                    stored.seek(cursor)
                    body = stored.read(count)
                    if len(body) != count:
                        raise ValueError('cached_range_incomplete')
                    if on_read is not None:
                        on_read('cache', len(body))
                    cursor += len(body)
                    yield body
                    continue
                incoming = self.reader.chunks(cursor, claim[1] - 1, on_headers=on_headers)
                try:
                    for body in incoming:
                        stored.seek(cursor)
                        if stored.write(body) != len(body):
                            raise ValueError('cached_range_write_failed')
                        with self.changed:
                            self._include(cursor, cursor + len(body))
                            self.changed.notify_all()
                        if on_read is not None:
                            on_read('upstream', len(body))
                        cursor += len(body)
                        yield body
                finally:
                    try:
                        incoming.close()
                    finally:
                        with self.changed:
                            self.pending.remove(claim)
                            self.changed.notify_all()
