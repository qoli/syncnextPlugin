#!/usr/bin/env python3
"""Package only reviewed source files, never runtime metadata or Cookie jars."""

import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


FILES = (
    "plugin_youtube/config.json", "plugin_youtube/app.js", "plugin_youtube/node_test_youtube.js",
    "tools/youtube-proxy/gateway.py", "tools/youtube-proxy/youtube.py", "tools/youtube-proxy/manifests.py",
    "tools/youtube-proxy/range_cache.py", "tools/youtube-proxy/test_range_cache.py",
    "tools/youtube-proxy/manage.py", "tools/youtube-proxy/index.html", "tools/youtube-proxy/requirements.txt",
    "tools/youtube-proxy/cookies_from_arc.mjs", "tools/youtube-proxy/README.md",
    "tools/youtube-proxy/Setup.command", "tools/youtube-proxy/Import Cookies.command", "tools/youtube-proxy/Start.command",
    "tools/youtube-proxy/test_proxy.py", "tools/youtube-proxy/test_cookie_recovery.py", "tools/youtube-proxy/cookies_from_arc.test.mjs",
    "tools/youtube-proxy/build_bundle.py",
    "tools/youtube-proxy/plugins/syncnext/yt_dlp_plugins/extractor/syncnext_shows.py",
    "tools/youtube-proxy/test_show_catalog.py",
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.output, "w", ZIP_DEFLATED) as bundle:
        for name in FILES:
            bundle.write(root / name, "Syncnext-YouTube/" + name)
        bundle.write(root / "tools/youtube-proxy/README.md", "Syncnext-YouTube/開始測試.md")
    print(args.output)


if __name__ == "__main__":
    main()
