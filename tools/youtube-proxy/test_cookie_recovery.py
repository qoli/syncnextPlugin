"""Exercise expiry, fresh CDP credentials, retry policy and concurrent requests."""

from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
from types import SimpleNamespace
import tempfile
import threading
import unittest
from unittest.mock import patch

from gateway import Gateway, PROFILES, ProxyError
from youtube import private_youtube_cookies, youtube_cookie_identity


INVALID = "WARNING: The provided YouTube account cookies are no longer valid"
PREMIUM = "[debug] Detected YouTube Premium subscription"


def cookies(path, generation, logged_in=True):
    lines = ["# Netscape HTTP Cookie File"]
    pairs = {"PREF": "fixture-preference"}
    if logged_in:
        pairs.update({"SAPISID": "fixture-session-" + generation,
                      "LOGIN_INFO": "fixture-login-" + generation})
    for name, value in pairs.items():
        lines.append(f".youtube.com\tTRUE\t/\tTRUE\t0\t{name}\t{value}")
    path.write_text("\n".join(lines) + "\n")
    path.chmod(0o600)


class CookieRecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.original = self.root / "input.cookies.txt"
        cookies(self.original, "old")
        self.gateway = Gateway.__new__(Gateway)
        g = self.gateway
        g.args = SimpleNamespace(extractor="fixture-yt-dlp", node="fixture-node", player_client="tv_samsung",
                                 js_runtime="deno", subtitle_language="zh-TW", cdp_url="http://localhost:9222",
                                 cdp_cookie_file=self.root / "cdp.cookies.txt")
        g.artifacts = self.root
        g.lock, g.extract_lock = threading.Lock(), threading.Lock()
        g.cookie_path = self.root / "working.cookies.txt"
        g.cookie_count = private_youtube_cookies(self.original, g.cookie_path)
        g.cookies_invalid = False
        g.failed_cookie_ids = set()
        g.cookie_refreshes = 0
        g.cookie_refresh_error = None
        self.extract_commands = []
        self.cdp_commands = []

    def execute(self, command, *, stdout=None, stderr=None, **kwargs):
        if command[0] == "fixture-node":
            self.cdp_commands.append(command)
            cookies(Path(command[command.index("--output") + 1]), "fresh")
            return SimpleNamespace(returncode=0, stdout="", stderr="")
        self.extract_commands.append(command)
        stale = "fixture-session-old" in self.gateway.cookie_path.read_text()
        stdout.write(json.dumps({"id": "sample"}))
        stderr.write(INVALID if stale else PREMIUM)
        if stale:
            # Reproduce the actual failure: yt-dlp stripped authentication
            # before the next queued player request can read the cookie jar.
            cookies(self.gateway.cookie_path, "stripped", logged_in=False)
        return SimpleNamespace(returncode=0)

    def extract(self, directory="operation", profile="premium"):
        return self.gateway.extract("https://www.youtube.com/watch?v=abcdefghijk",
                                    self.root / directory, profile=profile)

    def test_invalid_cookies_refresh_and_replay_exact_operation(self):
        with patch("gateway.subprocess.run", side_effect=self.execute):
            result = self.extract()
        self.assertEqual(result["proxyAccount"], {"cookiesUsed": True, "premiumDetected": True})
        self.assertEqual(len(self.cdp_commands), 1)
        self.assertEqual(len(self.extract_commands), 2)
        self.assertEqual(self.extract_commands[0], self.extract_commands[1])
        command = self.extract_commands[1]
        self.assertEqual(command[command.index("--format") + 1], PROFILES["premium"]["selector"])
        self.assertIn("youtube:player_client=tv_samsung;lang=zh-TW", command)
        self.assertTrue((self.root / "operation/rejected-cookies-1/extractor.private.log").exists())
        self.assertIn("fixture-session-old", self.original.read_text())
        events = (self.root / "events.jsonl").read_text()
        self.assertIn("cookie_cdp_refreshed", events)
        self.assertNotIn("fixture-session-", events)

    def test_bootstrap_without_file_uses_cdp_before_extraction(self):
        self.gateway.cookie_count = 0
        self.gateway.cookie_path.unlink()
        with patch("gateway.subprocess.run", side_effect=self.execute):
            result = self.extract()
        self.assertTrue(result["proxyAccount"]["premiumDetected"])
        self.assertEqual(len(self.extract_commands), 1)
        self.assertEqual(len(self.cdp_commands), 1)

    def test_silently_stripped_login_cookies_also_refresh(self):
        def run(command, *, stdout=None, stderr=None, **kwargs):
            if command[0] == "fixture-node":
                return self.execute(command, **kwargs)
            stale = "fixture-session-old" in self.gateway.cookie_path.read_text()
            if stale:
                self.extract_commands.append(command)
                stdout.write("{}")
                cookies(self.gateway.cookie_path, "stripped", logged_in=False)
                return SimpleNamespace(returncode=0)
            return self.execute(command, stdout=stdout, stderr=stderr, **kwargs)
        with patch("gateway.subprocess.run", side_effect=run):
            result = self.extract()
        self.assertTrue(result["proxyAccount"]["premiumDetected"])
        self.assertEqual(len(self.extract_commands), 2)
        self.assertEqual(len(self.cdp_commands), 1)

    def test_cdp_failure_remains_latched_for_next_request(self):
        def run(command, **kwargs):
            if command[0] == "fixture-node":
                self.cdp_commands.append(command)
                return SimpleNamespace(returncode=1)
            return self.execute(command, **kwargs)
        with patch("gateway.subprocess.run", side_effect=run):
            for name in ("first", "next"):
                with self.assertRaises(ProxyError) as caught:
                    self.extract(name)
                self.assertEqual(caught.exception.code, "youtube_cdp_unavailable")
        self.assertTrue(self.gateway.cookies_invalid)
        self.assertEqual(len(self.extract_commands), 1)
        self.assertEqual(len(self.cdp_commands), 2)

    def test_unchanged_cdp_snapshot_is_not_retried(self):
        def run(command, **kwargs):
            if command[0] == "fixture-node":
                self.cdp_commands.append(command)
                cookies(Path(command[command.index("--output") + 1]), "old")
                return SimpleNamespace(returncode=0)
            return self.execute(command, **kwargs)
        with patch("gateway.subprocess.run", side_effect=run):
            with self.assertRaises(ProxyError) as caught:
                self.extract()
        self.assertEqual(caught.exception.code, "youtube_cookies_invalid")
        self.assertEqual(len(self.extract_commands), 1)
        self.assertTrue(self.gateway.cookies_invalid)

    def test_logged_out_cdp_cannot_continue_anonymously(self):
        def run(command, **kwargs):
            if command[0] == "fixture-node":
                cookies(Path(command[command.index("--output") + 1]), "logout", logged_in=False)
                return SimpleNamespace(returncode=0)
            return self.execute(command, **kwargs)
        with patch("gateway.subprocess.run", side_effect=run):
            with self.assertRaises(ProxyError) as caught:
                self.extract()
        self.assertEqual(caught.exception.code, "youtube_cdp_login_required")
        self.assertEqual(len(self.extract_commands), 1)

    def test_rejected_generation_cycle_terminates(self):
        generations = iter(("fresh", "old"))
        def run(command, *, stdout=None, stderr=None, **kwargs):
            if command[0] == "fixture-node":
                self.cdp_commands.append(command)
                cookies(Path(command[command.index("--output") + 1]), next(generations))
                return SimpleNamespace(returncode=0)
            self.extract_commands.append(command)
            stdout.write("{}")
            stderr.write(INVALID)
            cookies(self.gateway.cookie_path, "stripped", logged_in=False)
            return SimpleNamespace(returncode=0)
        with patch("gateway.subprocess.run", side_effect=run):
            with self.assertRaises(ProxyError) as caught:
                self.extract()
        self.assertEqual(caught.exception.code, "youtube_cookies_invalid")
        self.assertEqual(len(self.extract_commands), 2)
        self.assertEqual(len(self.cdp_commands), 2)

    def test_concurrent_requests_share_refreshed_generation(self):
        with patch("gateway.subprocess.run", side_effect=self.execute):
            with ThreadPoolExecutor(max_workers=2) as pool:
                results = list(pool.map(self.extract, ("first", "second")))
        self.assertTrue(all(r["proxyAccount"]["premiumDetected"] for r in results))
        self.assertEqual(len(self.cdp_commands), 1)
        self.assertEqual(len(self.extract_commands), 3)

    def test_non_cookie_extraction_failure_does_not_trigger_cdp(self):
        cookies(self.gateway.cookie_path, "fresh")
        def run(command, *, stdout=None, stderr=None, **kwargs):
            self.assertEqual(command[0], "fixture-yt-dlp")
            self.extract_commands.append(command)
            stdout.write("null")
            stderr.write("ERROR: upstream HTTP 403")
            return SimpleNamespace(returncode=1)
        with patch("gateway.subprocess.run", side_effect=run):
            with self.assertRaises(ProxyError) as caught:
                self.extract(profile="avc")
        self.assertEqual(caught.exception.code, "extract_failed")
        self.assertEqual(len(self.extract_commands), 1)
        self.assertEqual(self.gateway.cookie_refreshes, 0)

    def test_cookie_identity_accepts_session_cookie_expiry_zero(self):
        self.assertIsNotNone(youtube_cookie_identity(self.original))
        cookies(self.original, "logout", logged_in=False)
        self.assertIsNone(youtube_cookie_identity(self.original))


if __name__ == "__main__":
    unittest.main()
