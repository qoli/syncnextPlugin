# Syncnext 官方插件

此 repo 維護由 Syncnext 載入的網站頻道插件。每個 `plugin_<provider>/` 目錄包含可公開下載的 `config.json`、JavaScript 實作與可重複的測試 fixture。

## 入口

| 需要處理的事 | 唯一負責文件 |
| --- | --- |
| `$http`／`$next`、`config.json`、資料模型與 App 交接契約 | [技術協議：doc.md](./doc.md) |
| 靜態檢查、fixture、smoke、App 驗證、結果判讀與產物管理 | [測試契約：TESTING.md](./TESTING.md) |
| 新增或維護插件、Notion preflight、來源表匯出、遠端驗證、公告與發布 | [發布 runbook：MAINTENANCE.md](./MAINTENANCE.md) |
| 新插件的可複製骨架 | [plugin_blueprint](./plugin_blueprint/) |

文件責任不重疊：技術協議定義「可傳什麼」，測試契約定義「如何證明它可用」，發布 runbook 定義「何時及如何對外生效」。

## 目前狀態

- 正式插件入口由 [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json) 發布。
- `sourcesv3.json` 是 Notion 來源表的自動匯出成品；新增或改動正式來源只能依 [MAINTENANCE.md](./MAINTENANCE.md) 的流程處理。
- 一般插件 smoke 由 Codex 定時任務在 macOS 本機每日執行，涵蓋正式訂閱表中的全部插件，並接入 tvOS 共用的 challenge core；完整診斷保存在本機，且不能取代 tvOS／iOS App 驗證。

## 本機 Smoke

```sh
npm run smoke:daily
```

Codex 定時任務每日於 **08:00（Asia/Shanghai）** 在本聊天執行，排程由 Codex 管理；
上述命令只執行一次 smoke。結果位於
`~/Library/Logs/SyncnextPluginSmoke/syncnextPlugin_all_plugin_test_runs/`。
執行條件、challenge 工具鏈與排程說明見 [TESTING.md §3.2](./TESTING.md#32-macos-每日-smoke)。
報告沒有問題時立即安靜結束；有問題時，依 [MAINTENANCE.md §5.1](./MAINTENANCE.md#51-codex-每日自動維護)
修復、驗證並發布已生效的更新至 GitHub 與 Telegram。
一般 smoke 不再由 GitHub Actions 執行；原始報告保存在本機，repo 內既有報告是遷移前留存。
