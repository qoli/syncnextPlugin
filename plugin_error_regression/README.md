# plugin_error_regression

這是一個專用於 Syncnext UI 回歸測試的插件。

它會在封面列表階段保留這句錯誤：

`封面列表為空：站點頁面結構可能變更，或目前返回了非預期內容。`

同時它仍然會返回 1 個可點擊的封面項目與 1 個劇集，方便直接進入 `UniversalResultView`。

用途：

1. 在 Syncnext 中打開這個插件。
2. 確認首頁仍然能看到 1 個封面項目。
3. 點進結果頁，驗證 `UniversalResultView` 是否錯誤顯示 coverList 錯誤。
4. 不重啟 App，直接再打開埋堆堆、AGE 或任意原生 / VOD 頁面。
5. 驗證這句插件錯誤不會再串場顯示到原生 `UniversalResultView`。

建議把這個插件 config 透過本地 HTTP 服務或 GitHub Raw 地址接入 Syncnext。
