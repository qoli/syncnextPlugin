# Syncnext 插件新增／維護／發布 Runbook

`MAINTENANCE.md` 是 `SyncnextPlugin_official` 唯一的操作型 runbook：新增插件、修復既有插件、登錄 v3 來源、發布用戶公告，都必須依本文件執行。`README.md`、`doc.md`、藍圖與 App 文件只描述介面或背景；若流程敘述與本文件不同，以本文件為準。

文件責任分界：技術 payload 與 runtime 契約見 [doc.md](./doc.md)；測試層次、結果判讀與 smoke 產物見 [TESTING.md](./TESTING.md)；本文件只負責把已驗證的變更依正確順序推送、登錄、匯出與發布。

## 0. 目的、邊界與不可跳過的規則

本 runbook 處理三種工作：

1. **新增**：建立 `plugin_<provider>`、讓它可被 App 下載，並登錄正式 v3 來源。
2. **維護**：修正既有插件的站點、解析、播放或設定問題。
3. **發布**：把已對用戶生效的更新寫入更新日誌並發到 Telegram。

涉及的系統與責任如下：

| 系統 | 用途 | 可修改內容 | 不能混入的內容 |
| --- | --- | --- | --- |
| `SyncnextPlugin_official` | 插件程式、測試、維護文件、Telegram 文案 | `plugin_*`、專屬測試、此 runbook | `SyncnextAPI` JSON、Clash 規則、App 程式 |
| Notion v3 來源表 | 正式頻道的資料來源 | 一筆來源紀錄 | 插件程式、Telegram 文案 |
| `SyncnextAPI` | 將 Notion 表匯出成公開 JSON | 只由 workflow 生成的 JSON | 手動編輯 `sourcesv3.json` |
| Notion 頻道更新日誌 | 用戶可見的變更敘述 | 最新日期區塊 | 維護命令、提交雜湊、內部細節 |
| Telegram | 公開頻道公告 | 由已核對的日誌產生的文案 | 未讀回 Notion 的草稿 |
| `SyncnextClash` | 可選的網路規則 | 僅人類明確指定的規則 | 因域名變更而推測的規則 |

不可違反的規則：

- `SyncnextAPI/sourcesv3.json` 是 **Notion 來源表的自動匯出成品**。不得手動新增、刪除、排序或修正該檔。
- 新插件必須先推送到公開插件 repo，讓 `config.json` 的 raw URL 可讀，再把該 URL 登錄到 Notion 來源表。
- Notion 的「v3 來源表」與「頻道更新日誌」是兩個獨立資源；其中一個可讀寫，不代表另一個也可讀寫。
- 未通過下列 Notion 權限 preflight，不得以手動修改 JSON、另一張表或臨時公開 URL 繞過。
- 不因插件域名變動而查詢或修改 `SyncnextClash`；要先取得人類明確同意。任何修改還需要第二次、含具體規則內容的明確指令。
- 不把不同 repo 的變更放進同一個 commit。
- 不向用戶公告命令、測試、headers、repo 路徑、提交雜湊或其他維護細節。

## 1. 固定資源與資料契約

### 1.1 已知資源

| 名稱 | 識別／位置 | 用途 |
| --- | --- | --- |
| 插件 repo | `/Volumes/Data/Github/SyncnextProjects/SyncnextPlugin_official` | 插件邏輯與測試；remote 為 `qoli/syncnextPlugin` |
| API repo | `/Volumes/Data/Github/SyncnextProjects/SyncnextAPI` | 自動生成並發布資料 JSON；remote 為 `qoli/syncnext-api` |
| v3 來源表 | Notion page `58f3de30e9dc4b7f8de6a714150057f4`；data source `49162846-b78c-423a-a42c-0deca2033053` | `sourcesv3.json` 的唯一資料來源 |
| 頻道更新日誌 | Notion page `c79c74fb231648b4a0fb41d2d161bd72` | 用戶可見公告的來源 |
| 匯出 workflow | `qoli/syncnext-api` 的 **Download JSON** | 執行 `notion-api-worker`，自動提交生成結果 |
| 公開 v3 JSON | `https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json` | App 與 subscription smoke 的驗證目標 |
| Telegram 發布器 | `telegram/post_channel_changelog.sh` | 讀取已核對的 Markdown 並發布 |

以上 Notion ID 是操作定位，並非權限授予；若資源搬遷，先更新本節，再開始發布。

### 1.2 v3 插件來源紀錄

新增官方插件時，來源表至少要有：

| 欄位 | 要求 |
| --- | --- |
| `name` | 用戶可辨識的頻道名稱 |
| `api` | `syncnextPlugin://https://raw.githubusercontent.com/qoli/syncnextPlugin/main/plugin_<provider>/config.json` |
| `Search` | 與插件能力一致的布林值 |
| `Top` | 由產品決策指定的布林值；不得自行預設置頂 |
| `note` | 對用戶有用的短提示；沒有必要時留空 |
| `id` | 由 Notion／匯出資料保留的穩定識別，不以複製貼上覆蓋既有值 |

可選欄位如 `Cover`、`Priority` 只在已有明確產品需求時填入。不要把 cookie、token、內部網址或測試說明放入表格。

## 2. Notion 權限 Preflight（任何寫入前）

預設使用已授權的 Notion API／connector；不要從瀏覽器 Cookie、環境檔或腳本讀取及轉存憑證。若 API 無法存取，而使用者明確提供已登入的 Arc session，可在該 session 以 UI 操作並立刻讀回確認。

開始新增或發布前，逐項確認：

| Gate | 要求 | 失敗時的處置 |
| --- | --- | --- |
| 來源表 read | 能列出 v3 來源表並看到現有列與欄位 | 請表格擁有者把資料庫／data source 分享給 integration；停止來源表流程 |
| 來源表 write | 能建立一筆測試以外的正式列，或已確認有編輯權 | 不得手動改 `sourcesv3.json`；請求編輯權 |
| 日誌 read | 能讀回目前最上方日期區塊 | 不發布 Telegram；請求頁面讀取權 |
| 日誌 write | 能在最上方建立最新日期區塊 | 不以本地 Markdown 取代 Notion；請求編輯權 |
| API workflow | 對 `qoli/syncnext-api` 可 dispatch 並讀取 workflow 結果 | 由有權限者執行匯出並提供成功 run URL；不要自行提交生成 JSON |
| 插件 repo | 可推送 `qoli/syncnextPlugin` 的預期分支 | 不建立指向未公開 config 的來源列 |
| Telegram | 可做 dry-run，且發布憑證／目標已被腳本安全處理 | 不在未預覽時發布 |

Preflight 結果應記錄為「可讀／可寫／不可用」及阻塞資源，不要記錄 token、cookie 或其內容。

## 3. 共同準備與問題定位

在插件 repo 開始：

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextPlugin_official
git status --short
git branch --show-current
```

先讀 `plugin_<provider>/config.json`，再讀 `app.js` 與既有專屬測試。從 app log、smoke 結果、fixture 或實際 DOM/API 確認故障階段：

- 首頁／分類列表
- 搜尋
- 詳情與分集
- 播放地址解析
- headers／Referer 交接
- HLS／AVPlayer 實際載入

不要把單一影片失效、Cloudflare／SafeLine、403、地域限制或直播上游波動直接判為 parser 壞掉。需要瀏覽器驗證時，優先使用已登入的 Arc CDP session，不要啟動另一個持久化瀏覽器。

## 4. 新增插件流程

### 4.1 建立與實作

1. 完成第 2 節 preflight；至少來源表、插件 repo 與 API workflow 必須可用。
2. 建立 `plugin_<provider>/config.json`、`app.js`，並加上可重複執行的 `node_test_*.js` fixture 測試。
3. 讓 `config.json` 的 page `javascript` 名稱與實際函式一致；入口函式不是固定的 `Home`／`Play` 等名稱，而由設定宣告。
4. 驗證列表、搜尋、分集與播放。多候選播放必須傳 `JSON.stringify([{ url, headers }, ...])` 給 `$next.toPlayerCandidates`，不可包成 `{ candidates: [...] }`。
5. 對多 host 站點，把目前穩定主站放在 `host`，候選放在 `hosts`，並提供 `HostsProbeRequest()`；所有相對、跳轉與播放 URL 要以選中的 host 正規化。

### 4.2 本機驗證

測試命令、通過定義與產物清理以 [TESTING.md](./TESTING.md) 為唯一契約；本節只列出進入發布 gate 前的最低操作。

至少執行：

```bash
node --check plugin_<provider>/app.js
python -m json.tool plugin_<provider>/config.json >/dev/null
node plugin_<provider>/node_test_*.js
git diff --check
```

需要整合 smoke 時，限縮插件並使用暫存輸出，避免污染 repo：

```bash
tmp_dir=$(mktemp -d /tmp/syncnext-plugin-smoke.XXXXXX)
node node_test_all_plugins.js \
  --only=plugin_<provider> \
  --output-dir "$tmp_dir" \
  --history-mode=latest-only
```

`node node_test_all_plugins.js --help` 只顯示選項、不建立輸出；未指定 `--only` 會測試所有本機插件。遠端限制要在結果中如實標示，不可偽裝為通過。

### 4.3 推送插件並驗證公開 config

只有測試通過後才建立插件 repo commit。staging 必須只包含本次插件、測試與有意修改的文件：

```bash
git status --short
git diff --stat
git add plugin_<provider>/app.js plugin_<provider>/config.json plugin_<provider>/node_test_*.js
git commit -m "✨ feat(plugin_<provider>): add provider"
git push origin main
```

若推送被拒，先檢查差異並 rebase；rebase 後重新執行受影響的驗證，再推送。

接著驗證 raw config，而非只驗證本機檔：

```bash
config_url="https://raw.githubusercontent.com/qoli/syncnextPlugin/main/plugin_<provider>/config.json"
curl --fail --silent --show-error "$config_url" | python -m json.tool >/dev/null
```

此 gate 失敗時，停止，不要登錄 Notion 來源表。

### 4.4 登錄來源表、匯出並驗證

1. 在 Notion v3 來源表建立一筆資料，欄位遵守第 1.2 節；`api` 使用已驗證的 config URL 加上 `syncnextPlugin://` 前綴。
2. 讀回剛建立的列，核對 `name`、`api`、`Search`、`Top`、`note`；確認沒有重複 `api` 或意外修改其他列。
3. dispatch `qoli/syncnext-api` 的 **Download JSON** workflow，等待它成功：

```bash
gh workflow run "Download JSON" --repo qoli/syncnext-api
gh run list --repo qoli/syncnext-api --workflow "Download JSON" --limit 1
gh run watch <run-id> --repo qoli/syncnext-api --exit-status
```

workflow 會執行 `notion-api-worker/src/export-json.ts` 並自動提交 JSON；不要手動修改或提交 `sourcesv3.json`。除了 run 結果為 success，還要檢查 job log 是否顯示 `Updated sourcesv3.json: <n> items`，而非「fetch failed／fetched empty payload; keeping existing file」的 warning。匯出器會在失敗時保留舊檔，故 workflow success 本身不足以證明來源已更新。
4. 讀取遠端 raw `sourcesv3.json`，確認 JSON 合法，且剛新增的 `api` 恰好出現一次：

```bash
sources_url="https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json"
curl --fail --silent --show-error "$sources_url" > /tmp/sourcesv3.json
python -m json.tool /tmp/sourcesv3.json >/dev/null
```

以 parser 或明確欄位比對 `name` 與完整 `api`；不要只 grep 到 provider 名稱就宣告成功。

5. 以 subscription 清單驗證新來源可被 smoke runner 發現：

```bash
tmp_dir=$(mktemp -d /tmp/syncnext-subscription-smoke.XXXXXX)
node node_test_all_plugins.js \
  --discovery=subscriptions \
  --subscriptions-url="$sources_url" \
  --only=plugin_<provider> \
  --output-dir="$tmp_dir" \
  --history-mode=latest-only
```

任何一個遠端 gate 失敗時，回到其擁有系統修正：config 問題回插件 repo、資料列問題回 Notion、匯出失敗回 workflow 權限／日誌。不可直接改 JSON 成品。

## 5. 維護既有插件流程

1. 執行第 3 節定位，完成最小修正與第 4.2 節驗證。
2. 只提交／推送插件 repo 的預期檔案；推送後仍要驗證遠端 raw config。
3. 僅當來源表欄位（名稱、入口 URL、搜尋、置頂、提示）需要變動時，才走第 4.4 節的來源表、匯出與遠端 JSON 驗證。
4. 若只改插件程式且 `api` 不變，不必重跑 `Download JSON`；但用戶可感知的修復仍要依第 7 節公告。
5. 發現域名改動時，先提出是否要**查詢** `SyncnextClash` 的問題。未得到同意前，完全不讀取或修改該 repo；獲得查詢同意後只列出匹配，等待第二次具體修改指令。

## 6. Smoke 輸出管理與清理

`node_test_all_plugins.js` 的預設輸出位置是 repo 下的 `syncnextPlugin_all_plugin_test_runs/`。預設 `history-mode=keep` 會建立時間戳資料夾，並更新：

```text
syncnextPlugin_all_plugin_test_runs/<timestamp>/
syncnextPlugin_all_plugin_test_runs/latest.json
syncnextPlugin_all_plugin_test_runs/latest.log
syncnextPlugin_all_plugin_test_runs/latest.summary.log
syncnextPlugin_all_plugin_test_runs/invalid_sources_latest.*
```

規則：

- 日常與單插件調試一律使用第 4.2 節的 `/tmp` 輸出；完成後由系統暫存區管理，不把結果留在 repo。
- 只有明確要更新受版本控制的 smoke 狀態或 README 區塊時，才使用 repo 輸出／`--update-readme`，並在 commit 中包含這些生成檔。
- 若誤在 repo 根目錄執行，先以 `git status --short` 與 `git diff` 精確列出本次生成的檔案；只移除本次新建的時間戳資料夾，並只還原本次改動的 generated latest 檔。不要清理整個歷史資料夾，也不要碰使用者既有輸出。
- 在清理後再次確認 `git status --short`；未經明確意圖，不應留下 smoke 輸出變更。

## 7. 用戶更新日誌與 Telegram 發布

只有當修正已推送，且若涉及來源表則已通過第 4.4 節遠端驗證，才進入公告。

### 7.1 Notion 更新日誌

在 Notion page `c79c74fb231648b4a0fb41d2d161bd72` 最上方新增當日區塊：

```text
# <mention-date start="YYYY-MM-DD"/>
### 更新：
- 「插件名稱」用戶可理解的變化。
```

讀回最上方區塊並確認日期、文案和排序。公告只說用戶影響，例如「修復部分影片無法開啟」；只有人類已批准並實際更改規則時才提及網路規則。

### 7.2 Telegram

從已讀回的最新 Notion 區塊手動更新：

```text
syncnextPlugin_all_plugin_test_runs/channel_changelog.md
```

格式：

```markdown
*Syncnext 頻道更新日誌*

*YYYY-MM-DD 更新：*
- 「插件名稱」用戶可理解的變化。
```

先 dry-run，核對日期和內容，再發布：

```bash
cd /Volumes/Data/Github/SyncnextProjects/SyncnextPlugin_official
./telegram/post_channel_changelog.sh --skip-copilot --dry-run
./telegram/post_channel_changelog.sh --skip-copilot
```

`--skip-copilot` 是預設且唯一的常規流程。只有使用者明確要求重新由 Copilot 擷取／改寫時，才使用 `--use-copilot`。不得發布舊日期的 `channel_changelog.md`。

## 8. Commit、推送與回報

提交前逐 repo 核對範圍：

```bash
git status --short
git diff --check
git diff --stat
```

- 插件、測試與此 runbook：在 `SyncnextPlugin_official` 建立獨立 commit。
- `sourcesv3.json`：由 `SyncnextAPI` workflow 自動提交；不建立人工資料 commit。
- Clash 規則：只有明確授權時，在 `SyncnextClash` 建立獨立 commit。
- App 程式：除非任務明確要求，保持完全不動。

完成回報至少包含：

- 變更的插件與提交／推送狀態。
- Notion preflight 的資源可用性與任何阻塞項。
- 來源表是否更新；若有，workflow 成功狀態與遠端 `sourcesv3.json`／config 驗證結果。
- 測試命令、結果，以及遠端限制與已知限制。
- Notion 日誌讀回、Telegram dry-run 與發布結果。
- 是否完全未查詢／修改 `SyncnextClash`。

## 9. 快速 Checklist

### 新增插件

- [ ] Notion 來源表、日誌、API workflow、插件 repo、Telegram 均通過 preflight。
- [ ] 插件程式、設定與可重複 fixture 測試完成。
- [ ] JS／JSON／專屬測試／限定 smoke 通過。
- [ ] 插件已推送，遠端 raw config 可讀且 JSON 合法。
- [ ] Notion v3 來源列已讀回且無重複。
- [ ] **Download JSON** 成功，遠端 `sourcesv3.json` 中有且僅有一筆正確入口。
- [ ] subscription smoke 能發現並驗證新來源。
- [ ] Notion 最新日誌已讀回；Telegram dry-run 後已發布。
- [ ] 無意外 smoke 輸出、無未授權的 Clash／App 變更。

### 維護既有插件

- [ ] 從具體證據定位故障階段並完成最小修正。
- [ ] JS／JSON／專屬測試與必要 smoke 通過。
- [ ] 插件推送後，遠端 raw config 已驗證。
- [ ] 僅在來源欄位改變時更新 Notion 表並重跑匯出。
- [ ] 用戶可感知的變更已依序完成 Notion 讀回、Telegram dry-run 與發布。
- [ ] 未經首次明確人類授權，未查詢 `SyncnextClash`；未經第二次含具體規則的指令，未修改它。
