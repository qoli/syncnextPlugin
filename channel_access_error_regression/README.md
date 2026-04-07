# channel_access_error_regression

這是一個 test-only 插件樣本，用來回歸測試「插件頻道首頁無法打開」時的全屏錯誤頁。

它不測解析，也不測劇集或播放器。  
它只會請求：

`https://www.youknow.tv/label/new/`

然後無論返回的是 `403`、Cloudflare 攔截頁、錯頁，或其它失敗內容，都只回傳空封面列表，讓 Syncnext 進入真正的首頁訪問錯誤頁。

目的：

1. 驗證插件頻道首頁打不開時，是否會顯示全屏錯誤頁。
2. 驗證錯誤頁能否正確顯示 `插件頻道`、`封面列表`、`HTTP 403`、host 與遠端摘要。
3. 方便你拍照後直接看出「哪個插件首頁打不開」。

接入方式：

1. 在 `SyncnextPlugin_official/` 根目錄啟動本地 HTTP：

   ```bash
   python3 -m http.server
   ```

2. 在 App 中使用：

   ```text
   http://<你的IP>:8000/test/channel_access_error_regression/config.json
   ```

注意：

- 這個插件放在 `test/` 下，不是正式插件。
- 它不應加入正式 sources。
- 它不會被 `node_test_all_plugins.js` 掃描，因為那個腳本只掃根目錄的 `plugin_*`。
- 這個樣本依賴 `youknow.tv` 目前對非瀏覽器請求返回 Cloudflare 403；如果未來該站恢復可直接訪問，再替換成新的真實失敗地址即可。
