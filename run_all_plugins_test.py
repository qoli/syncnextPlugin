#!/usr/bin/env python3
"""Python wrapper for node_test_all_plugins.js."""

from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
from pathlib import Path


def log(message: str) -> None:
    print(message, flush=True)


def run_cmd(cmd: list[str], cwd: Path) -> int:
    shown = " ".join(shlex.quote(part) for part in cmd)
    log(f"$ {shown} (cwd={cwd})")
    completed = subprocess.run(cmd, cwd=str(cwd), check=False)
    return completed.returncode


def build_parser() -> argparse.ArgumentParser:
    root = Path(__file__).resolve().parent

    parser = argparse.ArgumentParser(
        description="Run Syncnext official plugin full test via node_test_all_plugins.js."
    )
    parser.add_argument(
        "--repo-root",
        default=str(root),
        help="SyncnextPlugin_official repository root. Default: script directory.",
    )
    parser.add_argument(
        "--node-script",
        default="node_test_all_plugins.js",
        help="Node test script path relative to --repo-root.",
    )
    parser.add_argument(
        "--plugin-root",
        default=".",
        help="Plugin root passed to Node script.",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Output dir passed to Node script.",
    )
    parser.add_argument(
        "--output-folder",
        default="syncnextPlugin_all_plugin_test_runs",
        help="Output folder name passed to Node script.",
    )
    parser.add_argument("--only", default="", help="Only test these plugins (comma-separated).")
    parser.add_argument("--exclude", default="", help="Exclude these plugins (comma-separated).")
    parser.add_argument("--max-plugins", type=int, default=0, help="Max plugins to test.")
    parser.add_argument("--limit-medias", type=int, default=3, help="Test first N medias per plugin.")
    parser.add_argument("--invoke-timeout-ms", type=int, default=45000)
    parser.add_argument("--request-timeout-ms", type=int, default=25000)
    parser.add_argument("--probe-timeout-ms", type=int, default=15000)
    parser.add_argument("--connectivity-timeout-ms", type=int, default=12000)
    parser.add_argument("--vm-load-timeout-ms", type=int, default=8000)
    parser.add_argument("--all-episodes", action="store_true")
    parser.add_argument("--strict-probe", action="store_true")
    parser.add_argument("--skip-connectivity-check", action="store_true")
    parser.add_argument("--strict-connectivity-check", action="store_true")
    parser.add_argument("--no-probe", action="store_true")
    parser.add_argument("--allow-emptyview", action="store_true")
    parser.add_argument("--verbose-console", action="store_true")
    parser.add_argument(
        "--extra-args",
        default="",
        help='Raw extra args appended to Node command, e.g. "--only=plugin_libvio".',
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    repo_root = Path(args.repo_root).resolve()
    node_script = (repo_root / args.node_script).resolve()

    if not node_script.exists():
        log(f"[fatal] Node script not found: {node_script}")
        return 1

    cmd = [
        "node",
        str(node_script),
        f"--plugin-root={args.plugin_root}",
        f"--output-dir={args.output_dir}",
        f"--output-folder={args.output_folder}",
        f"--max-plugins={args.max_plugins}",
        f"--limit-medias={args.limit_medias}",
        f"--invoke-timeout-ms={args.invoke_timeout_ms}",
        f"--request-timeout-ms={args.request_timeout_ms}",
        f"--probe-timeout-ms={args.probe_timeout_ms}",
        f"--connectivity-timeout-ms={args.connectivity_timeout_ms}",
        f"--vm-load-timeout-ms={args.vm_load_timeout_ms}",
    ]

    if args.only.strip():
        cmd.append(f"--only={args.only.strip()}")
    if args.exclude.strip():
        cmd.append(f"--exclude={args.exclude.strip()}")
    if args.all_episodes:
        cmd.append("--all-episodes")
    if args.strict_probe:
        cmd.append("--strict-probe")
    if args.skip_connectivity_check:
        cmd.append("--skip-connectivity-check")
    if args.strict_connectivity_check:
        cmd.append("--strict-connectivity-check")
    if args.no_probe:
        cmd.append("--no-probe")
    if args.allow_emptyview:
        cmd.append("--allow-emptyview")
    if args.verbose_console:
        cmd.append("--verbose-console")
    if args.extra_args.strip():
        cmd.extend(shlex.split(args.extra_args.strip()))

    return run_cmd(cmd, repo_root)


if __name__ == "__main__":
    sys.exit(main())
