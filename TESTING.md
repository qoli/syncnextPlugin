# Syncnext 插件測試契約

本文件是本 repo 唯一的測試契約：定義應執行的驗證層次、可接受的證據、結果如何判讀，以及 smoke 產物如何管理。

- API、JSON 欄位、`$http`／`$next` 與 App 交接格式：見 [doc.md](./doc.md)。
- 新增、來源表匯出、遠端驗證、公告與發布順序：見 [MAINTENANCE.md](./MAINTENANCE.md)。
- Repo 入口與本機 smoke 命令：見 [README.md](./README.md)。

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
node tools/update-plugin-cache.js --check plugin_<provider>
node plugin_<provider>/node_test_*.js
git diff --check
```

`update-plugin-cache.js --check` 同時驗證可選 `challenge` capability：只接受固定的 `schema: 1`、`mode: "managed"`、`scope: "hosts"`，並拒絕非 exact HTTP(S) origin、credentials、query、fragment 與 wildcard。

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

若上游搜尋 API 對關鍵字長度或格式有明確限制，可在插件的 `search` 設定加入
`smokeKeyword`，提供一個可重現且確實存在的搜尋詞。命令列 `--search-keyword`
仍具有最高優先權；沒有設定時，runner 才會繼續從首頁媒體標題自動取樣。
若站方明確要求搜尋間隔，可另外設定 `search.smokeDelayMs`（最多 30000 ms）；
runner 會在 connectivity probe 與正式搜尋之間等待一次，不會重試或把節流錯誤當成成功。

若插件定義 `HostsProbeRequest()`，連通性檢查使用該 request 與 `accept` 條件，經相同的
HTTP session／managed adapter 執行，不再猜測未簽名的首頁或搜尋 URL。宣告的 probe
無效、拋錯或不符合接受條件時明確失敗，不改試其他 URL；沒有此函式的插件維持原有檢查。
例如歐樂 API 的 `_vv` 由插件產生，不能以未簽名請求的 401 推定插件不可用。
修改這段流程時執行 `node --test tools/smoke-host-probe.test.mjs tools/smoke-managed-challenge.test.mjs`，
確認簽名 request、headers、session、接受條件及 managed challenge 的失敗語意。

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

### 3.1 Managed challenge Smoke

`challenge = { "schema": 1, "mode": "managed", "scope": "hosts" }` 的插件使用
外部 adapter，把 tvOS 共用 Swift challenge core 編譯成 WASI，並在
同一個 `$http.fetch` session 內完成 challenge、cookie 與原本的 list、search、episodes、player
流程。Runner 需要明確傳入 adapter、兩個 WASM artifact 與 target registry；缺任何一項都會
fail-closed：

```bash
node node_test_all_plugins.js \
  --only=plugin_<provider> \
  --output-dir="$tmp_dir" \
  --history-mode=latest-only \
  --smoke-fail-exit=availability \
  --challenge-adapter-module=/path/to/adapter.mjs \
  --challenge-core-wasm=/path/to/plugin-challenge-core-cli.wasm \
  --challenge-calculator-wasm=/path/to/safeline-calculator.wasm \
  --challenge-targets-file=/path/to/targets.json \
  --require-managed-challenge
```

報告分開記錄兩個答案：

- `availability`：實際插件流程是否至少完成 list 與一條 episodes/player journey。
- `challenge.status`：`exercised`、`not-observed` 或 `failed`。沒有觀察到 challenge 不等於插件
  不可用；solver、cookie、verify 或 challenge retry 失敗則保持獨立紅燈。

CI gate 另外要求已設定的 search 至少成功一次。任何播放樣本自身為網盤限定或空來源會留在
case 明細，但只要另有實際播放 journey 成功，不會把整個插件誤判為不可用。

### 3.2 macOS 每日 Smoke

一般 smoke 已從 public GitHub Actions 遷移至 Codex 定時任務，每日於 **08:00（Asia/Shanghai）**
在建立任務的本聊天使用 macOS 本機執行。本機網路是此 smoke 的
預期執行環境；從正式 `sourcesv3.json` 載入所有插件，沒有排除名單，包含 `plugin_czzy`
與 `plugin_libvio`。Managed 插件透過第 3.1 節的 adapter 與 WASI core 執行。

本機入口是 `tools/run-subscription-smoke.mjs`，使用目前 Node 執行檔（已驗證 Node 26）。
需要相鄰的 private `../Syncnext` checkout，以及 swift.org Swift 6.4.1 toolchain 和
matching `swift-6.4.1-RELEASE_wasm` SDK。Xcode 內附 Apple Swift 不能替代 WASM toolchain；
安裝方式見 [Swift 官方說明](https://www.swift.org/documentation/articles/wasm-getting-started.html)。
預設 compiler 位於 `~/Library/Developer/Toolchains/swift-6.4.1-RELEASE.xctoolchain/usr/bin/swift`。
更換依賴版本或 checkout 時，明確設定 `SYNCNEXT_CHALLENGE_SWIFT`、
`SYNCNEXT_CHALLENGE_SWIFT_SDK`、`SYNCNEXT_CHALLENGE_HARNESS`，並在 Codex 任務的執行環境提供這些設定。

每次執行會先以增量建置更新共用 core，通過 native／WASI 測試及 target discovery，
再跑訂閱 smoke。工具鏈及 target 缺失會直接失敗，不會改走不含 adapter 的流程。
建置與 WASM 產物位於 `~/Library/Caches/SyncnextPluginSmoke/`，不修改 App 的建置產物。

```bash
# 立即執行；完整結果保存在本機
npm run smoke:daily
```

腳本只執行單次 smoke。每日排程使用 Codex 的本聊天定時任務，由 Codex 管理時間、啟用及停用。
每次任務確認報告是本輪產物，核對案例、插件可用性和 challenge 結果。
沒有問題時立即安靜結束，不啟動其他維護、修復或發布工作；有問題時依
[MAINTENANCE.md §5.1](./MAINTENANCE.md#51-codex-每日自動維護) 執行完整的確認、修復、驗證與發布；
疑似上游／地域限制時，包含本機多出口比較、實際分流查核及有證據的 Clash 規則補漏與發布驗證。
最新完整報告保存在 `~/Library/Logs/SyncnextPluginSmoke/syncnextPlugin_all_plugin_test_runs/`。

本機排程使用 `--strict-probe`：player/media probe 未通過，該 player case 就計入 fail。
同時保留 `--smoke-fail-exit=soft`，讓所有插件都能產出完整報告；exit 0 只代表執行完成，
實際可用性仍以 `latest.json` 的 `summary`、`availability` 與 `challenge.status` 判讀。
建置、discovery 或訂閱表下載失敗仍回傳非零。smoke 腳本只產生本機報告；
修復後的 commit、push 與公告由 Codex 按維護 SOP 執行。
private Syncnext 的 `Managed Plugin Smoke` workflow 不屬於本次一般 smoke 排程遷移。

## 4. 結果判讀

- JS 語法、設定 JSON、fixture 模型或已知 App 契約失敗：**必須修復**，不能發布。
- 列表／搜尋／分集／播放流程回傳空值：先用 fixture、Arc DOM 或上游 API 確定 selector／資料是否漂移。
- 403、Cloudflare、SafeLine、疑似地區限制或上游失效：先記錄為**待定位的遠端失敗**，不可直接當作插件程式錯誤或只憑狀態碼結案。每日任務依發布 runbook §5.1 核對實際協議、出口差異與 Clash 覆蓋；確認外部限制且沒有可修復項後，才以證據回報遠端阻塞。
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

- 第 3.2 節每日排程使用 `~/Library/Logs/SyncnextPluginSmoke/`，只更新本機 latest 檔；repo 內既有報告為遷移前留存。
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
