# Syncnext YouTube 本機插件

GundamInfo 播放列表、分集與 Mac 區網代理。只做 manifest 包裝：AVC 使用 HLS，Premium AV1 使用 MPD；原始影音 fMP4 使用 HTTP Range 轉送，字幕直接投遞 WebVTT。不轉碼、不重封裝 MP4、不需要 FFmpeg。

頻道固定為 `https://www.youtube.com/@GundamInfo/playlists`。此插件為私人用途，不計劃發布，不加入官方來源表。

## 開始測試

Mac 需要 Python 3.11+、Node 22+ 與 Deno。使用 Homebrew 可執行 `brew install python node deno`。

1. 在 `tools/youtube-proxy/` 執行 **Setup.command**，建立私有環境與鎖定的 yt-dlp。
2. 在既有 Arc 的 YouTube 分頁登入，保持 CDP `http://localhost:9222` 可用。缺少 Cookie 時代理會自動取得；不再需要手動匯入。只讀取有效、未分區的 YouTube Cookie，不讀取其他網站。**Import Cookies.command** 仍可供手動匯出診斷。
3. 執行 **Start.command**，等 `ready`。多網卡或換連接埠可用 `./Start.command --bind <Mac區網IP> --port 18771`。
4. Syncnext：**設定 → 插件開發者 → 顯示插件開發入口**；主畫面進入 **插件開發**，貼上 `http://<MacIP>:<port>/plugin_youtube/config.json`，選 **重新載入 → 正常模式**。AVC HLS 沿用既有交接；Premium MPD 的外掛 VTT 需要支援 `subtitle` 欄位的 App，不能推定既有 App Store 版本已支援。

Mac 根網址提供狀態頁。保持前景程序執行，Ctrl-C 停止；不安裝登入項目。執行期間以 caffeinate 暫停閒置睡眠。環境、Cookie、每輪私有日誌位於 `~/Library/Application Support/SyncnextYouTubeProxy/`。

## 清單與畫質

- **繁中 · AVC 原畫質**：只顯示上游標題明示繁中、繁體或 TW 字幕的列表，包括繁中 SEED、DESTINY、水星魔女及 Unicorn。選該影片最佳 AVC MP4 與 AAC 140；SEED 測試集為 1080p，部分影片目前僅有 480p，不放大。
- **全部播放列表 · AVC**：保留頻道所有列表，繁中列表排在前面；英語配音等其他分組仍可選取。標題與字幕語言不代表所在地可播放。
- **Premium 1080p AV1**：必須當次偵測到 Premium，且選中標記 Premium 的 1080p AV1 MP4。缺少該格式即失敗，不切換到 AVC。
- **SEED 驗證樣本**：保留繁中 SEED 列表內 `RJ4FLf15XeE` 第 10 集的固定入口，一般與 Premium 分開。

頻道目錄在啟動時取得；每個列表首次開啟時取得完整分集，保留上游順序。搜尋範圍為列表名稱與驗證樣本。每次選播重新解析，不重用舊簽名網址。重新啟動可更新目錄。Cookie 失效會自動從既有 Arc CDP 取得最新登入 Cookie，重跑同一次解析，無須重新啟動或改插件網址。

目錄使用 `lang=zh-TW` 取得繁中標題。鎖定版本的 yt-dlp 原本會略過 `LOCKUP_CONTENT_TYPE_SHOW`；隨包的 extractor plugin 僅把明確連到 `VL<playlistID>` 的 SHOW 卡片交回原有播放列表解析器，其他卡片維持原行為。2026-11-28 對照頻道頁確認目錄由 51 筆補齊為 56 筆，恢復 5 個繁中分組；繁中 SEED 列表當時提供 48 集，包含上述第 10 集。數量依上游更新，不補造缺集。

AVC 交接 `{url, headers}`，網址為 HLS master。Premium 明確交接原始影音的 `manifest.mpd`，有字幕時另帶 `subtitle: {url, name, language}`，指向穩定的原始 VTT。書房與客廳日誌都確認 AV1 HLS 被原生 AVPlayer 接管並回報 `-11848`；MPD 交給 Aether 的 DASH opener，沿用其 AV1 解碼能力。這是各畫質固定的交付契約，沒有失敗後切換畫質或播放器的重試。

AVC HLS 的字幕由 AVPlayer 選擇。App 的插幀畫面原本會遮住該字幕層；Hybrid 以不抑制原生渲染的 legible output 鏡像所選文字到插幀畫面上方，停止插幀便移除鏡像，原生字幕選擇保持不變。書房不支援 VT 插幀，需分開記錄原始影音實播及以正式 mount 檢查字幕遮擋邊界的證據；不能把後者說成已產生 VT 中間幀。

## 投遞契約

| 路徑 | 內容 |
| --- | --- |
| `/sessions/<UUID>/master.m3u8` | 宣告影音 codec、獨立音訊與可用的 WebVTT 字幕群組 |
| `video.m3u8`、`audio.m3u8` | 依原始 sidx 產生 EXTINF、EXT-X-MAP 與 EXT-X-BYTERANGE |
| `video.mp4`、`audio.mp4` | 原始上游檔案的精確 Range，GET／HEAD／206／416 |
| `subtitles.m3u8`、`subtitles.vtt` | WebVTT rendition；只補 X-TIMESTAMP-MAP，保留 cue 與時間戳 |
| `/api/subtitles/<videoID>/zh-TW.vtt` | 與下載檔位元一致的原始 VTT，可獨立使用 |
| `manifest.mpd` | Premium 的原始影音交付；AVC 亦保留此診斷入口，不內嵌字幕 |

字幕只取人工 `zh-TW` VTT，不用自動翻譯替代。沒有該語言時，狀態為 `available: false`，master 不宣告字幕；已列出卻下載失敗則明確失敗。包裝方式依 [RFC 8216](https://www.rfc-editor.org/rfc/rfc8216) 的 fMP4 byte range 與 WebVTT rendition。

影音轉送各自重用上游 HTTPS 連線；完整讀完回應才保留連線，取消或失敗時關閉未讀完的回應，不重試同一次請求。同一播放工作階段已收到、且通過 `206`／`Content-Range` 檢查的原始位元組，按需寫入該輪 `sessions/<UUID>/media-cache/`，重疊 Range 只向同一上游讀缺口。快取不跨播放工作階段共用、不預下載，也不改 MPD、影音位元組或字幕。

`events.jsonl` 的 Range 紀錄包含 `startedAt`、`upstreamHeadersSeconds`、`firstChunkSeconds`、`firstWriteSeconds` 與 `elapsedSeconds`，可對齊 tvOS seek 日誌。`cacheReadBytes`／`upstreamReadBytes` 區分實際讀取來源；全命中時不會有上游請求。每輪磁碟快取留在上述私人 run 目錄，不會打入插件包。

Cookie、上游簽名網址與私人 extractor 日誌保留在 Mac，不出現在插件交接或測試包。區網 HTTP 沒有配對與 TLS，可連到代理的裝置能使用已解析的串流。解析及媒體連線使用 IPv4；不修改 Clash 或系統路由。遇到 `youtube_cookies_invalid`，或 yt-dlp 清掉登入 Cookie 時，自動透過 CDP 更新並重跑原請求；畫質、client 與 URL 不變。Cookie 更新與解析共用鎖，避免其他請求使用失效副本。每組已被拒絕的 Cookie 不重用；CDP 不可用、沒有登入、或回傳同一組失效 Cookie 時明確失敗，不匿名繼續。CDN 403、地區或格式限制不觸發 Cookie 重試，也不換 client 或改畫質。

## 驗證與打包

從 repo 根目錄執行：

```sh
"$HOME/Library/Application Support/SyncnextYouTubeProxy/venv/bin/python" -m unittest discover -s tools/youtube-proxy -p 'test_*.py' -v
node --test tools/youtube-proxy/cookies_from_arc.test.mjs
node --check plugin_youtube/app.js
python3 -m json.tool plugin_youtube/config.json >/dev/null
node tools/update-plugin-cache.js --check plugin_youtube
node plugin_youtube/node_test_youtube.js
python3 tools/youtube-proxy/build_bundle.py --output /tmp/Syncnext-YouTube.zip
```

Cookie 測試覆蓋真實失效路徑的狀態：CDP 更新後重跑同一命令、CDP 中斷／未登入／同一失效 Cookie、登入標記被清除、併發請求及非 Cookie 錯誤不重試。

目錄回歸測試使用 5 個真實 SHOW 卡片與 VL 導向，檢查繁中分組、一般列表不受影響；需使用 Setup.command 安裝的鎖定 yt-dlp 環境。真站驗證另確認 CLI 實際載入 `syncnext_shows` plugin，不能只直接呼叫測試內的解析方法。

測試覆蓋原始 byte range、HEAD 不取流、416、sidx 到 HLS 的索引、VTT 首句 26 秒空白與 cue 不變，以及插件列表／搜尋／分集／播放。真站 smoke 使用私有單筆訂閱表指向正在執行的 Mac，沿用 repo `node_test_all_plugins.js --discovery=subscriptions --subscriptions-file=... --only=plugin_youtube --strict-probe`，輸出到暫存目錄。

書房電視的 `YouTubeProxyPoC` Debug case 用 `--youtube-proxy-packaged=1` 經正式插件讀取繁中 SEED 的完整分集，再選第 10 集。`--youtube-proxy-profile=avc` 選 HLS，預設 Premium MPD；`--youtube-proxy-interpolation=0|1` 記錄插幀設定，AVC 加 `--youtube-proxy-subtitle-overlay-probe=1` 檢查不支援插幀的書房裝置上，實際 VTT 文字是否出現在正式 picture mount 的不透明畫面上方。開發版、已安裝的正式版、HDMI 聽感是不同證據，需分別記錄。此包不包含 App 更新，僅供私人使用。

打包採明確的原始碼檔案清單，不含 Cookie、執行環境、日誌或簽名網址。
