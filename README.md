# Syncnext 官方插件

此 repo 維護由 Syncnext 載入的網站頻道插件。每個 `plugin_<provider>/` 目錄包含可公開下載的 `config.json`、JavaScript 實作與可重複的測試 fixture。

## 入口

| 需要處理的事 | 唯一負責文件 |
| --- | --- |
| `$http`／`$next`、`config.json`、資料模型與 App 交接契約 | [技術協議：doc.md](./doc.md) |
| 靜態檢查、fixture、smoke、App 驗證、結果判讀與產物管理 | [測試契約：TESTING.md](./TESTING.md) |
| 新增或維護插件、Notion preflight、來源表匯出、遠端驗證、公告與發布 | [發布 runbook：MAINTENANCE.md](./MAINTENANCE.md) |
| 新插件的可複製骨架 | [plugin_blueprint/README.md](./plugin_blueprint/README.md) |
| 多來源候選播放的實作案例 | [youknow_multisource_case.md](./youknow_multisource_case.md) |

文件責任不重疊：技術協議定義「可傳什麼」，測試契約定義「如何證明它可用」，發布 runbook 定義「何時及如何對外生效」。

## 目前狀態

- 正式插件入口由 [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json) 發布。
- `sourcesv3.json` 是 Notion 來源表的自動匯出成品；新增或改動正式來源只能依 [MAINTENANCE.md](./MAINTENANCE.md) 的流程處理。
- 下方狀態區塊僅摘要最近一次 Bun／Node smoke；完整診斷位於產物檔，且不能取代 tvOS／iOS App 驗證。

## 最新 Smoke 摘要

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-21T06:05:33.647Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

- Plugins: `9`
- Cases: `24/33` passed
- Fatal plugins: `4`
- Invalid source entries: `4`

Detailed diagnostics: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json), and [invalid sources](./syncnextPlugin_all_plugin_test_runs/invalid_sources_latest.json).
Interpretation and rerun rules: [TESTING.md](./TESTING.md).
<!-- AUTO-SMOKE-STATUS:END -->
