#!/usr/bin/env python3
"""Explicit setup, Cookie import and foreground launch for the Mac proxy."""

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time


HERE = Path(__file__).resolve().parent
STATE = Path.home() / "Library/Application Support/SyncnextYouTubeProxy"


def lan_address():
    result = subprocess.check_output(["/sbin/route", "-n", "get", "default"], text=True)
    interface = next(line.split(":", 1)[1].strip() for line in result.splitlines() if line.strip().startswith("interface:"))
    return subprocess.check_output(["/usr/sbin/ipconfig", "getifaddr", interface], text=True).strip()


def require_program(name):
    found = shutil.which(name)
    if not found:
        raise SystemExit(f"缺少 {name}。請先依 README 安裝必要工具。")
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("setup", "import-cookies", "start"))
    parser.add_argument("--bind", help="Apple TV 能連到的 Mac IPv4；省略時取預設網路介面")
    parser.add_argument("--port", default=18771, type=int)
    parser.add_argument("--cdp-url", default="http://localhost:9222")
    args = parser.parse_args()
    os.umask(0o077)
    STATE.mkdir(parents=True, exist_ok=True)
    if args.action == "setup":
        if sys.version_info < (3, 11):
            raise SystemExit("需要 Python 3.11 或更新版本，請依 README 安裝。")
        for program in ("deno", "node"):
            require_program(program)
        subprocess.run([sys.executable, "-m", "venv", str(STATE / "venv")], check=True)
        subprocess.run([str(STATE / "venv/bin/python"), "-m", "pip", "install", "-r", str(HERE / "requirements.txt")], check=True)
        print("安裝完成。可執行 Import Cookies.command 匯入 Cookie，再執行 Start.command。")
        return
    cookie_file = STATE / "youtube.cookies.txt"
    if args.action == "import-cookies":
        subprocess.run([require_program("node"), str(HERE / "cookies_from_arc.mjs"), "--output", str(cookie_file), "--cdp-url", args.cdp_url], check=True)
        print("已匯入 YouTube Cookie。代理會在登入失效時自動透過 CDP 更新。")
        return
    extractor = STATE / "venv/bin/yt-dlp"
    if not extractor.exists():
        raise SystemExit("請先執行 Setup.command。")
    address = args.bind or lan_address()
    directory = STATE / "runs" / time.strftime("%Y%m%d-%H%M%S")
    print("代理日誌：" + str(directory), flush=True)
    print(f"插件網址：http://{address}:{args.port}/plugin_youtube/config.json", flush=True)
    command = [str(STATE / "venv/bin/python"), str(HERE / "gateway.py"), "--bind", address, "--port", str(args.port),
               "--artifacts", str(directory), "--extractor", str(extractor),
               "--js-runtime", "deno:" + require_program("deno"), "--node", require_program("node"),
               "--cdp-url", args.cdp_url, "--cdp-cookie-file", str(cookie_file)]
    if cookie_file.exists():
        command += ["--cookie-file", str(cookie_file)]
    (STATE / "last-run.json").write_text(json.dumps({"artifacts": str(directory), "origin": f"http://{address}:{args.port}"}, indent=2))
    # Foreground only: quitting Terminal/Ctrl-C stops both the proxy and its
    # temporary idle-sleep assertion. No login item or LaunchAgent is installed.
    os.execv("/usr/bin/caffeinate", ["caffeinate", "-i", *command])


if __name__ == "__main__":
    main()
