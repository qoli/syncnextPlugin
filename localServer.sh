#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec python3 -m http.server 8000 --bind 127.0.0.1 --directory "$repo_dir/test"
