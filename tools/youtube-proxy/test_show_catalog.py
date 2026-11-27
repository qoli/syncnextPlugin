"""Regression fixtures for the five real GundamInfo SHOW playlist cards."""

import copy
from pathlib import Path
import sys
import unittest

from yt_dlp import YoutubeDL
from yt_dlp.extractor.youtube import YoutubeTabIE as BaseYoutubeTabIE

sys.path.insert(0, str(Path(__file__).with_name("plugins") / "syncnext"))
from yt_dlp_plugins.extractor.syncnext_shows import YoutubeTabIE

from gateway import is_traditional_chinese_playlist, playlist_medias


SHOWS = (
    ("PLWjd5-5xOmvw", "Mobile Suit Gundam the Witch from Mercury(繁中字幕)"),
    ("PLNnxffb3X1XE", "Mobile Suit Gundam Unicorn RE:0096(繁中字幕)"),
    ("PLH28wqlpBLfA", "[繁中字幕] Mobile Suit Gundam SEED DESTINY HD Remaster"),
    ("PLGCy0ANGbKCM", "[繁中字幕] Mobile Suit Gundam SEED HD Remaster"),
    ("PLJV1h9xQ7Hx_RmW7By87bGVXlUSSd3Kgo", "[繁中字幕] After War Gundam X"),
)


def card(identifier, title, kind="LOCKUP_CONTENT_TYPE_SHOW"):
    return {
        "contentId": identifier,
        "contentType": kind,
        "metadata": {"lockupMetadataViewModel": {"title": {"content": title}}},
        "rendererContext": {"commandContext": {"onTap": {"innertubeCommand": {
            "browseEndpoint": {"browseId": "VL" + identifier}}}}},
    }


class ShowCatalogTests(unittest.TestCase):
    def setUp(self):
        self.downloader = YoutubeDL({"quiet": True, "no_warnings": True})
        self.addCleanup(self.downloader.close)
        self.extractor = YoutubeTabIE(self.downloader)
        self.original = BaseYoutubeTabIE(self.downloader)

    def test_five_show_cards_are_real_playlist_results(self):
        for identifier, title in SHOWS:
            with self.subTest(playlist=identifier):
                fixture = card(identifier, title)
                before = copy.deepcopy(fixture)
                entry = self.extractor._extract_lockup_view_model(fixture)
                self.assertEqual(entry["url"], "https://www.youtube.com/playlist?list=" + identifier)
                self.assertEqual(entry["ie_key"], "YoutubeTab")
                self.assertEqual(entry["title"], title)
                self.assertEqual(fixture, before)

    def test_ordinary_playlist_and_video_keep_original_behavior(self):
        fixtures = [card("PLLlBv52XOt4I", "【EN Dub ver】SEED DESTINY", "LOCKUP_CONTENT_TYPE_PLAYLIST"),
                    card("RJ4FLf15XeE", "Episode 10", "LOCKUP_CONTENT_TYPE_VIDEO")]
        for fixture in fixtures:
            self.assertEqual(self.extractor._extract_lockup_view_model(fixture),
                             self.original._extract_lockup_view_model(fixture))

    def test_non_playlist_show_is_not_invented_as_a_playlist(self):
        fixture = card("some-show", "Unproven show")
        fixture["rendererContext"]["commandContext"]["onTap"]["innertubeCommand"] = {}
        self.assertIsNone(self.extractor._extract_lockup_view_model(fixture))

    def test_traditional_chinese_entry_does_not_include_english_dubs(self):
        entries = [{"id": identifier, "title": title} for identifier, title in SHOWS]
        english = {"id": "PLGpoKWN7Bq4g", "title": "【EN Dub ver】Mobile Suit Gundam SEED"}
        catalog = {"entries": [english, *entries]}
        selected = playlist_medias(catalog, "http://mac:18772", "avc", "zh-TW")
        self.assertEqual(len(selected), len(SHOWS))
        self.assertTrue(all(is_traditional_chinese_playlist(e) for e in entries))
        self.assertFalse(is_traditional_chinese_playlist(english))
        all_entries = playlist_medias(catalog, "http://mac:18772", "avc")
        self.assertEqual(len(all_entries), len(SHOWS) + 1)
        self.assertEqual(all_entries[-1]["id"], "youtube:PLGpoKWN7Bq4g:avc")

    def test_multilingual_tw_labels_are_preserved(self):
        for title in ("MOVIE (CN.HK.TW.EN.KR Sub)", "[TW Sub] MOVIE", "台灣中文字幕", "台湾中文字幕版"):
            self.assertTrue(is_traditional_chinese_playlist({"title": title}))
        self.assertFalse(is_traditional_chinese_playlist({"title": "SEEDGP2026"}))


if __name__ == "__main__":
    unittest.main()
