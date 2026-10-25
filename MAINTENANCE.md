# Syncnext 插件新增／維護／發布 Runbook

`MAINTENANCE.md` 是 `SyncnextPlugin_official` 唯一的操作型 runbook：新增插件、修復既有插件、登錄 v3 來源、發布用戶公告，都必須依本文件執行。`README.md`、`doc.md`、藍圖與 App 文件只描述介面或背景；若流程敘述與本文件不同，以本文件為準。

文件責任分界：技術 payload 與 runtime 契約見 [doc.md](./doc.md)；測試層次、結果判讀與 smoke 產物見 [TESTING.md](./TESTING.md)；PluginBundle Hash 由本文件第 4.1–4.3 節的生成、檢查與公開 bytes 驗證管理；本文件只負責把已驗證的變更依正確順序推送、登錄、匯出與發布。

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
| `SyncnextClash` | 網路分流規則 | 明確授權、具實測證據的 canonical 規則；每日任務授權見第 5.1 節 | 僅憑域名變動猜測的規則、無關路由策略 |

不可違反的規則：

- `SyncnextAPI/sourcesv3.json` 是 **Notion 來源表的自動匯出成品**。不得手動新增、刪除、排序或修正該檔。
- 新插件必須先推送到公開插件 repo，讓 `config.json` 的 raw URL 可讀，再把該 URL 登錄到 Notion 來源表。
- Notion 的「v3 來源表」與「頻道更新日誌」是兩個獨立資源；其中一個可讀寫，不代表另一個也可讀寫。
- 未通過下列 Notion 權限 preflight，不得以手動修改 JSON、另一張表或臨時公開 URL 繞過。
- 一般工作不得僅因插件域名變動就查詢或修改 `SyncnextClash`；查詢及具體修改仍須人類明確授權。第 5.1 節的每日任務已獲持續授權，可依實測證據完成規則查核、補漏與發布，不逐次重問。
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
6. 完成所有腳本修改後執行 `node tools/update-plugin-cache.js plugin_<provider>`，讓 `config.cache` 與 `files` 的實際內容一致。Hash 更新必須與腳本放在同一個 commit。

第三方倉庫的 JSON 檔名與發布目錄可能不同；先核對其真正的 `files` 與公開 URL，
不可直接套用本工具的 `plugin_*` 目錄發現規則。逐一以原始 bytes 計算 SHA-256
與 byte 數，保持完整 `cache.resources`，並在提交後驗證公開 URL 與同一 commit
的 Git blob。Git clean filter、換行轉換或 CDN 傳播造成的不一致都必須如實回報，
不能以工作樹 Hash 代替公開 bytes。

### 4.2 本機驗證

測試命令、通過定義與產物清理以 [TESTING.md](./TESTING.md) 為唯一契約；本節只列出進入發布 gate 前的最低操作。

至少執行：

```bash
node --check plugin_<provider>/app.js
python -m json.tool plugin_<provider>/config.json >/dev/null
node tools/update-plugin-cache.js --check plugin_<provider>
node plugin_<provider>/node_test_*.js
git diff --check
```

這個 gate 也會驗證 `challenge` capability 與 `host + hosts` exact-origin 契約；不要以全局白名單補充或繞過插件聲明。

如果工具顯示 `Plugin cache manifest warning`，代表 Git clean filter（例如換行正規化）會在提交時改變資源 bytes，令工作樹生成的 Hash 可能與 GitHub Raw 不一致。提交前應先統一檔案換行，或在 `.gitattributes` 為該資源聲明明確規則，再重新生成並檢查 manifest；不要忽略警告或手工覆寫 Hash。

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

1. 執行第 3 節定位，完成最小修正；若改動 `config.json.files` 指向的任何腳本，先執行 `node tools/update-plugin-cache.js plugin_<provider>`，再完成第 4.2 節驗證。
2. 只提交／推送插件 repo 的預期檔案；推送後仍要驗證遠端 raw config。
3. 僅當來源表欄位（名稱、入口 URL、搜尋、置頂、提示）需要變動時，才走第 4.4 節的來源表、匯出與遠端 JSON 驗證。
4. 若只改插件程式且 `api` 不變，不必重跑 `Download JSON`；但用戶可感知的修復仍要依第 7 節公告。
5. 網路與分流問題依第 5.1 節的證據流程查核；每日任務已有該節的持續授權。其他工作若尚未獲授權，先取得查詢同意，修改前再取得具體規則指令；不能只憑域名改動推測規則。

### 5.1 Codex 每日自動維護

使用者已授權 Codex 定時任務每日於 **08:00（Asia/Shanghai）** 在本聊天使用 macOS 本機
執行 `npm run smoke:daily`，並在 smoke 報告有問題時，自動完成**確認問題、修復、驗證及發布**。
授權包括提交／推送本次插件修復，依本地出口比較與實際分流證據查核、補充及提交／推送
`SyncnextClash` 規則，追蹤對應 CI 至完成、驗證公開產物，以及更新 Notion 頻道日誌並發布
Telegram 公告。這是整套插件維護 SOP，不能只執行 smoke、分類錯誤或列出狀態碼後結束。
已驗證的本次插件／規則修復不再逐次詢問是否修復、commit 或 push；保留各 repo 的測試、
權限及公開資源驗證 gate，並維持分 repo 提交。
本機 smoke 腳本、工具鏈及依賴版本可依既有授權調整；不得因此繞過共用 challenge core
或降低 gate，Gimy 的新增依賴限制仍依本節末段。

1. 先執行 smoke，確認本輪程序結果與報告時間；不能把 `--smoke-fail-exit=soft` 的 exit 0
   當成全部通過，也不能讀取舊報告冒充本輪成功。案例失敗、fatal error、插件不可用／未證明、
   challenge 失敗，或 runner／報告不完整，都進入問題定位。
2. **沒有問題時立即安靜結束**，不啟動維護、修復、GitHub／Notion 更新或 Telegram 公告。
3. 依第 3、5 節定位完整請求鏈，核對官網、公開 API、解析器、headers／Referer、App 橋接
   與實際播放地址。分類只是定位起點；不能因 403、Cloudflare、404 或逾時就直接結案。
   插件缺陷依第 4.1–4.3 節完成必要修復、cache hash、fixture、focused smoke 與必要的 App 驗收。
   單片失效不能冒充全站故障，也不能以換片、隱藏 fallback、跳過案例或降低 gate 消除失敗。
4. 疑似上游、IP／地域或網路限制時，先用新鮮 API／官網資料確認 URL，再在本機原路徑與
   多個可用的不同地區出口比較同一批 URL。使用實際 HTTPS GET、相同必要 headers，保持
   TLS 驗證；記錄 HTTP 狀態、回應 body／HLS、時間及實際出口 IP／地區。不能以節點名稱、
   delay、HEAD 或其他 domain 的 IP 回顯，代替 CDN GET 及其真實分流證據。
5. 海外出口成功而原路徑失敗時，查核 `SyncnextClash` canonical 規則、公開生成檔及本機
   已載入 provider 的版本、覆蓋範圍、順序、target，並以失敗請求對應的實際連線／規則／
   proxy chain 判斷是否漏規則、載入舊版或分流錯誤。使用適用的 localClash 操作 Skill。
   多地失敗也只能支持已測範圍內的上游問題；同 ASN、DNS／CDN edge、路由器重新解析等
   未拆開的差異須保留，不把路徑相關拒絕武斷說成全球上游故障或已證實地域封鎖。
6. 確認規則缺漏時，已授權在 `SyncnextClash` 的目前 checkout／branch 修改
   `rulesets/proxy.yaml` 或 `rulesets/unbreak.yaml`，只涵蓋已確認的域名與分流需求，保留其他
   規則及順序。依該 repo `AGENTS.md` 安裝 lock 指定依賴、validate、unittest 與指定版本
   sing-box 生成／SRS 往返驗證。以獨立 commit 推送本次修復，由既有 main 發布 workflow
   更新相容檔及 `generated` 分支；不得手改生成檔或夾帶插件 repo 的變更。
7. 插件與規則修復推送後，追蹤**本次 commit** 對應 CI 至完成，確認測試、生成、發布及
   讀回步驟實際成功；只推送成功或看到舊綠燈不能算發布完成。核對消費端使用的公開 URL、
   config／資源 bytes；規則另核對 manifest 的來源 commit、來源檔及產物 SHA-256。
   CI 失敗則依日誌修復本次問題並重驗；不能宣稱尚未公開的修復已生效。
8. 規則發布後，可針對本次變更刷新本機**既有對應 rule-provider**，讀回其內容／版本、
   target 與順序，再以原本本機網路及失敗案例做 focused smoke，取得新的實際命中規則／
   proxy chain。此授權不涵蓋更改共享／預設群組選擇或成員、全域 reload、程序重啟、DNS、
   防火牆或接管路由器。若 provider 無法更新或必要驗收受阻，明確區分「公開發布完成」與
   「本機已生效」。master playlist 200 也不能當成 segments／AVPlayer 完整播放證明。
9. 僅在來源表欄位有變更時執行第 4.4 節；只改插件且 `api` 不變或只改規則時不重跑匯出。
   確認實際修復及對應發布 gate 通過後，依第 7 節更新並讀回 Notion 最新日誌，產生當日
   文案、Telegram dry-run，再以 `--skip-copilot` 正式發布。規則修復應描述適用範圍與更新
   規則需求，不能偽稱插件程式已改或所有裝置都已恢復。沒有修復或 gate 未通過時不公告。

開始維護時記錄既有工作樹與未推送提交，只提交／推送本次修復，保留其他工作；
不能為此建立／切換分支或 worktree，也不能夾帶既有無關提交。App 與來源資料的
操作邊界仍依 workspace 指令及本文件；Clash 僅限上述具證據的規則維護與對應 provider 更新。
權限不足、無法完成必要驗收或只有已查證的遠端限制時，
保留可定位證據並回報阻塞；不重複發布相同公告或反覆回報未變的已知阻塞。

Gimy 的 Cloudflare Managed Challenge 維持 2026-10-25 已確認的未支援狀態；每日仍測試，
但未另獲授權前不新增 Mac 瀏覽器執行層、解題服務或其他依賴。已知狀態未變時不重複詢問
或公告；網站恢復、故障類型改變或另有授權時，才依新證據更新判定。

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

- 每日一般 smoke 由 Codex 定時任務於 08:00（Asia/Shanghai）在 macOS 本機執行；排程、工具鏈和本機報告位置依 [TESTING.md §3.2](./TESTING.md#32-macos-每日-smoke)。原始 smoke 報告保存在本機；問題修復與發布依第 5.1 節。
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
- Clash 規則：只有明確授權時（含第 5.1 節每日任務的持續授權），在 `SyncnextClash` 建立獨立 commit。
- App 程式：除非任務明確要求，保持完全不動。

完成回報至少包含：

- 變更的插件與提交／推送狀態。
- Notion preflight 的資源可用性與任何阻塞項。
- 來源表是否更新；若有，workflow 成功狀態與遠端 `sourcesv3.json`／config 驗證結果。
- 測試命令、結果，以及遠端限制與已知限制。
- Notion 日誌讀回、Telegram dry-run 與發布結果。
- `SyncnextClash` 是否查詢／修改；若有，列明證據、具體規則、commit、發布 CI、公開產物及本機載入／復測結果。

## 9. 快速 Checklist

### 新增插件

- [ ] Notion 來源表、日誌、API workflow、插件 repo、Telegram 均通過 preflight。
- [ ] 插件程式、設定與可重複 fixture 測試完成。
- [ ] JS／JSON／專屬測試／限定 smoke 通過。
- [ ] `config.cache` 已重新生成，`node tools/update-plugin-cache.js --check plugin_<provider>` 通過。
- [ ] 插件已推送，遠端 raw config 可讀且 JSON 合法。
- [ ] Notion v3 來源列已讀回且無重複。
- [ ] **Download JSON** 成功，遠端 `sourcesv3.json` 中有且僅有一筆正確入口。
- [ ] subscription smoke 能發現並驗證新來源。
- [ ] Notion 最新日誌已讀回；Telegram dry-run 後已發布。
- [ ] 無意外 smoke 輸出、無未授權的 Clash／App 變更。

### 維護既有插件

- [ ] 從具體證據定位故障階段並完成最小修正。
- [ ] JS／JSON／專屬測試與必要 smoke 通過。
- [ ] `config.cache` 已重新生成並通過檢查。
- [ ] 插件推送後，遠端 raw config 已驗證。
- [ ] 僅在來源欄位改變時更新 Notion 表並重跑匯出。
- [ ] 用戶可感知的變更已依序完成 Notion 讀回、Telegram dry-run 與發布。
- [ ] `SyncnextClash` 查核／修改具有明確授權或第 5.1 節持續授權；如有修復，已完成獨立提交、CI、公開產物與本機復測驗證。
