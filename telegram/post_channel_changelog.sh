#!/bin/bash

set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
workspace_root=$(cd "$repo_root/.." && pwd)
main_app_root="$workspace_root/Syncnext"
main_telegram_dir="$main_app_root/telegram"
changelog_helper="$main_app_root/Scripts/callcopilot_changelog_common.sh"

notion_page_id="c79c74fb231648b4a0fb41d2d161bd72"
notion_page_title="Syncnext 頻道更新日誌"
output_file="$repo_root/syncnextPlugin_all_plugin_test_runs/channel_changelog.md"
image_file="$repo_root/telegram/SyncnextChannelChangelog.png"
token_file="$main_telegram_dir/.token"
chat_id="@RonnieAppsChannel"
parse_mode="Markdown"
model_name=""
skip_copilot=1
dry_run=0

usage() {
  cat <<EOF
Usage:
  $(basename "$0") [options]

Options:
  --output PATH          Generated Telegram markdown file.
                         Default: $output_file
  --image PATH           Telegram photo used for this changelog post.
                         Default: $image_file
  --chat-id CHAT_ID      Telegram channel username or chat id.
                         Default: $chat_id
  --token-file PATH      Telegram bot token file.
                         Default: $token_file
  --token TOKEN          Telegram bot token. Prefer TELEGRAM_BOT_TOKEN or --token-file.
  --model MODEL          Optional Copilot model name passed to callCopilot.sh.
  --use-copilot          Regenerate --output from Notion through Copilot.
  --skip-copilot         Publish the existing --output file without regenerating it.
                         This is the default mode.
  --dry-run              Generate/print message, but do not send Telegram messages.
  --no-parse-mode        Send plain text without Telegram Markdown parsing.
  -h, --help             Show this help.

The target Notion page is "$notion_page_title":
  https://www.notion.so/qoli/Syncnext-c79c74fb231648b4a0fb41d2d161bd72
EOF
}

fail() {
  echo "錯誤: $*" >&2
  exit 1
}

read_token_from_file() {
  local path="$1"

  if [ -f "$path" ]; then
    tr -d '\r\n' < "$path"
  fi
}

build_copilot_prompt() {
  local destination="$1"

  cat <<'EOF' | sed \
    -e "s|__NOTION_PAGE_ID__|$notion_page_id|g" \
    -e "s|__NOTION_PAGE_TITLE__|$notion_page_title|g" \
    -e "s|__DESTINATION__|$destination|g"
你要為 Telegram 頻道撰寫一則面向 Syncnext 用戶的頻道更新公告。

任務：
1. 先檢查可用工具中是否存在 Notion MCP / Notion 相關工具；如果不存在，報錯並停止。
2. 使用 Notion MCP 讀取 page `__NOTION_PAGE_ID__`（__NOTION_PAGE_TITLE__）。不要使用 web fetch、瀏覽器抓取或 HTML 解析。
3. 從頁面正文抽取最新日期區塊。日期 heading 格式通常是 `# <mention-date start="YYYY-MM-DD"/>`。只取最上方最新日期區塊，到下一個日期 heading 之前為止。
4. 將該區塊改寫成適合 Telegram 頻道發布的繁體中文 Markdown。
5. 內容必須面向用戶，只描述用戶可理解的變化與影響。
6. 不要包含 commit hash、驗證命令、測試輸出、Node/curl、repo 路徑、內部 runtime 名稱或維護者操作細節。
7. Telegram Markdown 使用 legacy Markdown：標題使用 `*粗體*`，列表使用 `- ` 或 `• `。不要使用 `#` heading。
8. 第一行必須是 `*Syncnext 頻道更新日誌*`。
9. 第二段需要包含最新日期，例如 `2026-04-27`。
10. 必須真的寫入檔案：__DESTINATION__
11. 如果抽取內容不是最新日期區塊，或混入了舊日期內容，直接報錯並停止，不要寫出錯誤文件。
12. 完成後最後只回報已寫入的檔案路徑與抽取到的日期。
EOF
}

generate_with_copilot() {
  local destination="$1"
  local prompt

  if [ ! -f "$changelog_helper" ]; then
    fail "缺少 Copilot helper：$changelog_helper"
  fi

  # shellcheck source=../../Syncnext/Scripts/callcopilot_changelog_common.sh
  source "$changelog_helper"

  mkdir -p "$(dirname "$destination")"
  prompt="$(build_copilot_prompt "$destination")"
  (
    cd "$repo_root"
    repo_root="$repo_root" syncnext_run_copilot_prompt "$prompt" "$model_name"
  )

  if [ ! -s "$destination" ]; then
    fail "Copilot 沒有寫出有效內容：$destination"
  fi
}

post_to_telegram() {
  local message_file="$1"
  local token="$2"
  local image_path="$3"

  if [ ! -f "$main_telegram_dir/post_channel_update.py" ]; then
    fail "缺少 Telegram 發佈 helper：$main_telegram_dir/post_channel_update.py"
  fi
  if [ ! -f "$image_path" ]; then
    fail "缺少 Telegram 配圖：$image_path"
  fi

  SYNCNEXT_TELEGRAM_BOT_TOKEN="$token" \
  SYNCNEXT_TELEGRAM_CHAT_ID="$chat_id" \
  SYNCNEXT_TELEGRAM_PARSE_MODE="$parse_mode" \
  SYNCNEXT_TELEGRAM_MESSAGE_FILE="$message_file" \
  SYNCNEXT_TELEGRAM_IMAGE_FILE="$image_path" \
  SYNCNEXT_TELEGRAM_DRY_RUN="$dry_run" \
  PYTHONPATH="$main_telegram_dir${PYTHONPATH:+:$PYTHONPATH}" \
  python3 - <<'PY'
import os
import sys

from post_channel_update import (
    CAPTION_LIMIT,
    MESSAGE_LIMIT,
    chunk_text,
    normalize_markdown_for_telegram,
    read_text,
    send_photo,
    send_message,
)

token = os.environ["SYNCNEXT_TELEGRAM_BOT_TOKEN"]
chat_id = os.environ["SYNCNEXT_TELEGRAM_CHAT_ID"]
parse_mode = os.environ["SYNCNEXT_TELEGRAM_PARSE_MODE"] or None
message_file = os.environ["SYNCNEXT_TELEGRAM_MESSAGE_FILE"]
image_file = os.environ["SYNCNEXT_TELEGRAM_IMAGE_FILE"]
dry_run = os.environ.get("SYNCNEXT_TELEGRAM_DRY_RUN") == "1"

message = read_text(message_file).strip()
if not message:
    print(f"Message file is empty: {message_file}", file=sys.stderr)
    raise SystemExit(1)

if parse_mode == "Markdown":
    message = normalize_markdown_for_telegram(message)

if dry_run:
    print(f"Image: {image_file}", file=sys.stderr)
    print(message)
    raise SystemExit(0)

api_base = f"https://api.telegram.org/bot{token}"
if len(message) <= CAPTION_LIMIT:
    response = send_photo(api_base, chat_id, image_file, message, parse_mode)
    if not response.get("ok"):
        print(f"sendPhoto failed: {response}", file=sys.stderr)
        raise SystemExit(1)
    print("Posted channel changelog photo with caption.")
    raise SystemExit(0)

response = send_photo(api_base, chat_id, image_file, None, None)
if not response.get("ok"):
    print(f"sendPhoto failed: {response}", file=sys.stderr)
    raise SystemExit(1)

for chunk in chunk_text(message, MESSAGE_LIMIT):
    response = send_message(api_base, chat_id, chunk, parse_mode)
    if not response.get("ok"):
        print(f"sendMessage failed: {response}", file=sys.stderr)
        raise SystemExit(1)

print("Posted channel changelog photo and text messages.")
PY
}

token_arg=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --output)
      output_file="${2:-}"
      [ -n "$output_file" ] || fail "--output 缺少參數"
      shift 2
      ;;
    --image)
      image_file="${2:-}"
      [ -n "$image_file" ] || fail "--image 缺少參數"
      shift 2
      ;;
    --chat-id)
      chat_id="${2:-}"
      [ -n "$chat_id" ] || fail "--chat-id 缺少參數"
      shift 2
      ;;
    --token-file)
      token_file="${2:-}"
      [ -n "$token_file" ] || fail "--token-file 缺少參數"
      shift 2
      ;;
    --token)
      token_arg="${2:-}"
      [ -n "$token_arg" ] || fail "--token 缺少參數"
      shift 2
      ;;
    --model)
      model_name="${2:-}"
      [ -n "$model_name" ] || fail "--model 缺少參數"
      shift 2
      ;;
    --use-copilot)
      skip_copilot=0
      shift
      ;;
    --skip-copilot)
      skip_copilot=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --no-parse-mode)
      parse_mode=""
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "未知參數：$1"
      ;;
  esac
done

if [ "$skip_copilot" -eq 0 ]; then
  generate_with_copilot "$output_file"
elif [ ! -s "$output_file" ]; then
  fail "--skip-copilot 指定的輸出檔不存在或為空：$output_file"
fi

token="${token_arg:-${TELEGRAM_BOT_TOKEN:-}}"
if [ -z "$token" ]; then
  token="$(read_token_from_file "$token_file")"
fi
if [ -z "$token" ] && [ "$dry_run" -eq 1 ]; then
  token="dry-run-token"
fi
[ -n "$token" ] || fail "缺少 Telegram bot token，請設定 TELEGRAM_BOT_TOKEN、--token 或 --token-file。"

post_to_telegram "$output_file" "$token" "$image_file"
