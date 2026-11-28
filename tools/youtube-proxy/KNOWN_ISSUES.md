# YouTube proxy 已知問題

## YT-PROXY-001：Premium seek 可能等待既有 Range 完成

**狀態：未解決，保留為已知問題。** 記錄日期：2026-11-29；觀測日期：2026-11-28。

### 現象與影響

Premium AV1 透過 MPD 播放時，前後 seek 雖能取得新畫面並繼續播放，仍可能等待數秒至十餘秒。即使目標位置的資料已在 Mac 快取中，也不能保證 seek 立即生效。proxy 的快取命中耗時與端到端出圖時間是不同指標。

### 重現條件與量測

- 環境：`SyncNext Data`，tvOS 27.0 Simulator；Syncnext 1.225（610）。本輪證據不代表實體 Apple TV 或 HDMI 音訊驗收。
- 來源：GundamInfo 繁中 SEED 第 28 集，影片 ID `wEcjpZHbc0k`，Premium AV1 1080p／AAC，使用完整插件與 MPD／原始 Range 代理。
- App 既有 case：`YouTubeSeekPerformance`；經正式插件解析與播放器執行，檢查新畫面 generation 及來源時鐘持續推進。
- 設定：`playerSkipStart=false`、`playerMusicRecognition=false`、`playerFrameInterpolationEnabled=false`、播放速度 1。片頭片尾能力不列入本輪驗收。

在目前保留的代理實作上，依序執行以下目標；時間由發出 seek 至觀察到新畫面計算：

| 次序 | 目標時間（秒） | 出圖等待（秒） |
| --- | ---: | ---: |
| 1 | 300 | 8.018 |
| 2 | 90 | 10.835 |
| 3 | 900 | 15.742 |
| 4 | 300 | 3.007 |
| 5 | 90 | 3.350 |
| 6 | 900 | 15.020 |

六次均取得新畫面及後續時鐘進展；case 的功能檢查通過，**不表示 seek 效能已達預期**。這組數值是單輪實測，會受上游速度與快取狀態影響，不能當作延遲上限或 SLA。

重跑既有 Debug case 的輸入如下；先依 App repository 的 Simulator 契約建置及選擇固定裝置，再傳入啟動參數：

```text
--syncnext-acceptance-case=YouTubeSeekPerformance
--syncnext-acceptance-run-id=<UUID>
--youtube-seek-origin=http://<MacIP>:<port>
--youtube-seek-video-id=wEcjpZHbc0k
--youtube-seek-targets=300,90,900,300,90,900
```

### 已確認的等待位置

第 6 次 seek 發出時，前一筆 `bytes=17563648-21757951`（4 MiB）尚未完成。對齊 App 與 proxy 日誌可見：

- 該舊請求總耗時 17.367 秒，`cacheFillWaitSeconds=0`。
- 發出 seek 後約 14.719 秒，舊請求才完成。
- 新目標 Range 在 seek 後約 14.727 秒才送達 proxy；新畫面在約 15.020 秒出現。

因此，這次延遲主要發生在播放器送出新目標請求之前，不能歸因於新目標 Range 在 Mac 快取鎖內排隊。Aether 的 `HTTPDiscIOReader` 在同步 Range 讀取期間持有讀取鎖，seek 亦取得該鎖，與此等待型態一致；仍需另外驗證任何讀取取消或串流接線修正的效果。

### 未採用的 Mac 端試驗

以下試驗均使用相同 Simulator App 與六個 seek 目標，但分別重新解析及建立播放會話，上游速度與快取狀態可能不同；結果未證實改善，不能用來推定單一變因的效能收益：

| 試驗 | 六次出圖等待（秒，依相同次序） | 決策 |
| --- | --- | --- |
| 按 sidx 片段邊界回應較短的 206 | 16.245、15.964、27.396、4.658、5.241、4.825 | 撤回，未套用現役 |
| 先交付已快取前綴，再由客戶端續讀 | 33.952、38.269、25.004、4.344、40.722、1.027 | 撤回，未套用現役 |

現役仍使用完整所求範圍的精確 Range、同會話原始位元組快取、併發缺口協調及既有導向恢復；未加入上述子範圍路徑或 MPD 改寫。

### 修改邊界與後續判定

2026-11-29 的使用者決策是維持修改邊界為 **macOS YouTube proxy**，不允許擴大修改 App、SyncnextHybrid 或 Aether。此問題先記錄，不把功能測試、HTTP smoke 或快取命中數據寫成端到端效能修復完成。

往後若重新評估，需保留新畫面及時鐘的檢查，對齊 seek 發出、舊讀取結束、新目標 Range 到達與出圖時間，並區分冷讀取、快取重訪與上游傳輸耗時。原始私人日誌、Cookie、簽名網址、App container 與機器專屬路徑不放入本文件或插件包。
