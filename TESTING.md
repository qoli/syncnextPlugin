# Syncnext 插件測試契約

本文件是本 repo 唯一的測試契約：定義應執行的驗證層次、可接受的證據、結果如何判讀，以及 smoke 產物如何管理。

- API、JSON 欄位、`$http`／`$next` 與 App 交接格式：見 [doc.md](./doc.md)。
- 新增、來源表匯出、遠端驗證、公告與發布順序：見 [MAINTENANCE.md](./MAINTENANCE.md)。
- Repo 入口與最近 smoke 摘要：見 [README.md](./README.md)。

測試不授權發布、修改 Notion 或修改 `SyncnextClash`；需要這些動作時，回到發布 runbook。

## 1. 測試層次與責任

| 層次 | 必要時機 | 證明的事 | 不證明的事 |
| --- | --- | --- | --- |
| 靜態檢查 | 每次插件程式或設定變更 | JS 可解析、JSON 合法 | 上游可達或 App 可播放 |
| 專屬 fixture 測試 | 每次新增插件；修改 parser／契約時 | 固定上游回應能產出預期模型 | 真站目前狀態 |
| Node/Bun smoke | 需要整合驗證時 | 目前可走過列表、搜尋、分集、播放的 Node 路徑 | tvOS/iOS JavaScriptCore + JSHttp 行為 |
| subscription smoke | 變更正式來源表後 | 公開 `sourcesv3.json` 能發現正確插件入口 | Notion 權限或匯出 job 的正確性 |
| App 驗證 | 播放、候選選線、headers、host bootstrap 或 resolver 變更 | 實際 Syncnext runtime 可用 | 上游長期穩定性 |

每個 `plugin_<provider>` 至少應有 `config.json`、`app.js` 與一個可重複執行的 `node_test_*.js` 或等效 fixture。測試輸入不得依賴私有 token、Cookie 或未記錄的人工狀態。

## 2. 每次修改的最低驗證

從 repo 根目錄執行，將 `<provider>` 替換為實際資料夾名稱：

```bash
node --check plugin_<provider>/app.js
python -m json.tool plugin_<provider>/config.json >/dev/null
node plugin_<provider>/node_test_*.js
git diff --check
```

若測試修改了播放器候選或分集候選，fixture 必須驗證 payload 可 `JSON.parse`，且符合 [doc.md](./doc.md) 中的 App 契約。尤其 `$next.toPlayerCandidates` 的 payload 必須是候選物件的 JSON 陣列，不是 `{ candidates: [...] }` 包裝。

## 3. 限縮 smoke

`node_test_all_plugins.js` 沒有指定 `--only` 時會跑所有本機插件，且預設寫入 repo 下的產物。先使用 help 檢視選項；它不會產生檔案：

```bash
node node_test_all_plugins.js --help
```

日常或單插件 smoke 必須使用暫存輸出：

```bash
tmp_dir=$(mktemp -d /tmp/syncnext-plugin-smoke.XXXXXX)
node node_test_all_plugins.js \
  --only=plugin_<provider> \
  --output-dir="$tmp_dir" \
  --history-mode=latest-only
```

若正式來源表已匯出並通過發布 runbook 的遠端 JSON gate，才可進行 subscription smoke：

```bash
tmp_dir=$(mktemp -d /tmp/syncnext-subscription-smoke.XXXXXX)
node node_test_all_plugins.js \
  --discovery=subscriptions \
  --subscriptions-url=https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json \
  --only=plugin_<provider> \
  --output-dir="$tmp_dir" \
  --history-mode=latest-only
```

## 4. 結果判讀

- JS 語法、設定 JSON、fixture 模型或已知 App 契約失敗：**必須修復**，不能發布。
- 列表／搜尋／分集／播放流程回傳空值：先用 fixture、Arc DOM 或上游 API 確定 selector／資料是否漂移。
- 403、Cloudflare、SafeLine、地區限制或短暫上游失效：記為**遠端限制**，不可偽稱測試通過，也不可直接當作程式錯誤。
- Node/Bun 轉綠：只代表 Node 路徑可用。涉及 `JSHttp`、headers、hosts、resolver、候選選線或播放時，仍需 App 實測。
- App 實測失敗：以 App log、實際請求與協議契約定位；不要以 Node 結果覆蓋 App 證據。

## 5. Smoke 產物與 README 狀態

預設 runner 會管理：

```text
syncnextPlugin_all_plugin_test_runs/<timestamp>/
syncnextPlugin_all_plugin_test_runs/latest.json
syncnextPlugin_all_plugin_test_runs/latest.log
syncnextPlugin_all_plugin_test_runs/latest.summary.log
syncnextPlugin_all_plugin_test_runs/invalid_sources_latest.*
```

規則：

- 個人調試使用 `/tmp` 輸出；不要把生成結果留在 repo。
- 只有明確要更新受版本控制的 smoke 摘要時，才使用 `--update-readme=README.md`；其更新範圍僅限 README 的 `AUTO-SMOKE-STATUS` 區塊。
- README 只保留摘要；逐插件 HTTP、搜尋與播放診斷以 `latest.*` 和時間戳報告為準。
- 若誤寫入 repo，先以 `git status --short` 和 `git diff` 精確辨識本次產物；只處理本次新建或改動的 generated 檔，不清理既有歷史。

## 6. 通過條件與交接

一個可交付的插件變更至少具備：

1. 第 2 節靜態與 fixture 檢查通過。
2. 有需要時，限縮 smoke 的結果與任何遠端限制說明。
3. 若改動影響 App runtime，已完成相稱的 App 驗證。
4. 產物未意外污染工作樹。

達成後才可依 [MAINTENANCE.md](./MAINTENANCE.md) 進行 commit、來源登錄與對外發布。
