# Syncnext Plugin Maintenance SOP

這份文檔描述 `SyncnextPlugin_official` 的日常維護流程。目標是讓插件更新、規則同步、用戶公告和提交發布可以穩定重複執行。

## 維護範圍

- 插件 repo：`SyncnextPlugin_official`
- Clash / Passwall 規則 repo：`SyncnextClash`
- 主 App repo：`Syncnext`
- 用戶更新日誌：Notion「Syncnext 頻道更新日誌」
- Telegram 發布腳本：`telegram/post_channel_changelog.sh`
- Telegram 固定配圖：`telegram/SyncnextChannelChangelog.png`

不同 repo 的變更要分開提交。不要把插件、Clash 規則、主 App 的無關修改混在同一個 commit。

## 1. 定位插件

插件都放在 repo 根目錄的 `plugin_*` 目錄下：

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextPlugin_official
ls plugin_*
```

典型插件結構：

```text
plugin_xxx/
  config.json
  app.js
  node_test_*.js
```

先讀 `config.json`，再讀 `app.js`。不要直接假設站點仍使用舊域名、舊 selector 或舊 API。

## 2. 更新域名與多 Hosts

當站點換域名或發布頁提供多條線路時，優先使用多 Hosts 方案。

`config.json` 建議格式：

```json
{
  "host": "https://primary.example.com/",
  "hosts": [
    "https://primary.example.com",
    "https://backup.example.com"
  ]
}
```

維護要求：

- `host` 放目前最穩定的主線路。
- `hosts` 放可探測的候選線路。
- 插件內提供 `HostsProbeRequest()`，讓 App 可以探測可用線路。
- 不要只在 `app.js` 裡硬編碼單一域名。
- 相對 URL、舊域名跳轉 URL、播放器 URL 都要 rebasing 到目前選中的 host。
- 站點需要 UA、Referer 或 Origin 時，集中放在 helper 裡，不要散落在每個請求中。

若站點有官方發布頁，域名來源以發布頁為準；維護時同步清理失效域名。

## 3. 插件驗證

每次改插件後至少執行：

```bash
python -m json.tool plugin_xxx/config.json >/dev/null
node --check plugin_xxx/app.js
```

如果插件有專用測試腳本：

```bash
node --check plugin_xxx/node_test_*.js
node plugin_xxx/node_test_*.js
```

全量或指定插件 smoke test：

```bash
node node_test_all_plugins.js --only=plugin_xxx
```

判斷測試結果時要區分：

- 語法錯誤：必須修復。
- JSON 結構錯誤：必須修復。
- selector / parser 回傳空：優先用瀏覽器或 fixture 確認 DOM/API 是否變更。
- 403、Cloudflare、SafeLine、地區限制：標記為遠端限制，不要當成語法驗證失敗。
- 播放地址失效：確認是單集資源問題還是解析流程問題。

## 4. Clash / Passwall 規則人工確認

當插件域名更新時，不要自行推導是否需要調整 `SyncnextClash`。

正確流程是：先詢問人類是否需要查詢 Clash / Passwall 中是否存在相似域名規則；查詢確認只代表可以列出匹配結果，不代表可以修改。任何規則修改都需要人類再次明確指示具體改法。

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextClash
```

常見文件：

```text
Unbreak-classical.yaml
proxy-classical.yaml
passwall/direct_host
passwall/proxy_host
```

`SyncnextClash` 對域名只有三種維護狀態：

1. 中國直連：Clash 使用 `Unbreak-classical.yaml`，Passwall 使用 `passwall/direct_host`。
2. 中國需要代理：Clash 使用 `proxy-classical.yaml`，Passwall 使用 `passwall/proxy_host`。
3. 沒有規則：不加入 `SyncnextClash`，交給 Clash 預設規則處理。

人工確認原則：

- 規則維護只能根據人類確認的域名範圍執行。
- 不要因為插件域名更新，就自動新增、刪除或改寫 Clash / Passwall 規則。
- 不要按「主站、API、CDN、播放器」等功能分類自行決定規則。
- 不要自行把候選域名歸類到「中國直連」、「中國需要代理」或「沒有規則」。
- 可以在獲得同意後查詢相似域名規則，並把查詢結果列出來交給人類決定。
- 只有在人類明確指示後，才能修改 `Unbreak-classical.yaml`、`proxy-classical.yaml`、`passwall/direct_host`、`passwall/proxy_host` 或其他規則文件。
- 人類沒有確認時，插件維護流程不應修改 `SyncnextClash`。
- Clash repo 單獨 commit，不和插件 repo 混在一起。

詢問範例：

```text
插件域名已更新。是否需要我去 SyncnextClash 查詢是否存在相似域名規則？
我只會先列出匹配結果，不會自行修改規則。
```

獲得同意後，可以只做查詢：

```bash
rg -n "example|example-old|example-new" \
  Unbreak-classical.yaml \
  proxy-classical.yaml \
  passwall/direct_host \
  passwall/proxy_host
```

查詢後回報：

- 找到哪些相似域名。
- 分別在哪些文件。
- 目前文件中已有的規則形態。
- 建議不要直接修改，等待人類確認具體改法。

如果人類已確認需要修改規則，修改後再做基本檢查：

```bash
python - <<'PY'
from pathlib import Path

for path in ("passwall/direct_host", "passwall/proxy_host"):
    items = [
        x.strip()
        for x in Path(path).read_text().splitlines()
        if x.strip() and not x.strip().startswith("#")
    ]
    dupes = sorted({x for x in items if items.count(x) > 1})
    print(f"{path} duplicates:", dupes)
PY
```

## 5. Notion 用戶更新日誌

插件或規則更新完成後，更新 Notion「Syncnext 頻道更新日誌」。

內容要求：

- 面向用戶，不面向維護者。
- 說明用戶能感知到的變化與影響。
- 只有在人類確認並實際調整網路規則後，才提及 Clash / Passwall 或網路規則。
- 不寫 commit hash。
- 不寫測試命令。
- 不寫 repo 路徑。
- 不寫 Node、curl、runtime、內部 helper 名稱。
- 不寫「已驗證」這類內部流程描述。

推薦格式：

```text
# 2026-04-27
### 更新：
- 「插件名稱」更新域名適配，改善部分網路環境下無法開啟的問題。
```

## 6. Telegram 發布

Telegram 發布腳本在插件 repo：

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextPlugin_official/telegram
./post_channel_changelog.sh
```

腳本會：

- 使用 Copilot 從 Notion「Syncnext 頻道更新日誌」抽取最新日期區塊。
- 改寫成 Telegram Markdown。
- 使用固定配圖 `SyncnextChannelChangelog.png` 發布到 Telegram 頻道。
- 預設發布到 `@RonnieAppsChannel`。

常用命令：

```bash
# 只預覽，不發送
./post_channel_changelog.sh --dry-run

# 使用已存在的 markdown，不重新抽 Notion
./post_channel_changelog.sh --skip-copilot

# 預覽已存在的 markdown
./post_channel_changelog.sh --skip-copilot --dry-run

# 指定頻道
./post_channel_changelog.sh --chat-id @YourChannel

# 指定 token
TELEGRAM_BOT_TOKEN=xxx ./post_channel_changelog.sh

# 指定配圖
./post_channel_changelog.sh --image /path/to/image.png
```

預設 token 文件來自主 App repo：

```text
/Volumes/Data/Github/SyncnextProjects/Syncnext/telegram/.token
```

如果 Telegram 文案短於 caption 限制，腳本會用 `sendPhoto` + caption；如果文案較長，腳本會先發圖，再分段發文字。

## 7. Git 提交與推送

提交前確認 repo 狀態：

```bash
git status --short
git diff --stat
```

提交規範：

- 插件邏輯：`🔧 chore(plugin_xxx): update hosts`
- Telegram 工具：`🔧 chore(telegram): add channel changelog publisher`
- 測試或 smoke 狀態：`🤖 chore(smoke): update plugin smoke status`

提交插件 repo：

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextPlugin_official
git add plugin_xxx config_or_script
git commit -m "🔧 chore(plugin_xxx): update hosts"
git push
```

提交 Clash repo：

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextClash
git add <人類確認需要修改的規則文件>
git commit -m "🔧 chore(rules): update provider domains"
git push
```

如果 `git push` 被拒絕，先 fetch/rebase：

```bash
git fetch origin
git rebase origin/main
git push
```

rebase 後要重新確認本地變更仍然符合預期。

## 8. 完整維護 Checklist

維護某個插件時照以下順序執行：

- 定位 `plugin_xxx`。
- 檢查官方站點或發布頁的目前域名。
- 更新 `config.json` 的 `host` / `hosts`。
- 更新 `app.js` 的請求 host、headers、URL rebasing。
- 執行 JSON 與 JS 語法檢查。
- 執行插件專用測試或 smoke test。
- 若域名變更，詢問人類是否需要查詢 `SyncnextClash` 相似域名規則；未確認前不要修改規則。
- 更新 Notion 用戶更新日誌。
- 用 `telegram/post_channel_changelog.sh --dry-run` 預覽 Telegram 文案。
- 確認文案後執行 Telegram 發布。
- 分 repo commit。
- 分 repo push。

## 9. 常見風險

- 上游站點返回 403，不一定代表插件壞了；先確認是否反爬、地區限制或 challenge 頁。
- 多 Hosts 中某些域名可打開首頁，但搜索或播放器接口不可用；不要只測首頁。
- 播放頁可能返回舊域名、相對路徑或跳轉 URL；必須做 URL normalize。
- Notion 更新日誌不要包含維護者語言，Telegram 發出去後用戶只需要知道影響。
- 主 App repo 常有獨立開發中的 Swift 變更；維護插件時不要碰或 revert 這些無關變更。
