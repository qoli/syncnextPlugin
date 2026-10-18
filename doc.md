# Syncnext 插件協議

本文件保留插件與 App 的交接契約。可執行真相是 App 的
[JS bridge](../Syncnext/Syncnext%20tvOS/Services/Plugin/JavaScriptCore/)、
[SourcePlugin](../Syncnext/Syncnext%20tvOS/Services/Plugin/SourcePlugin.swift) 與
[PluginModel](../Syncnext/Syncnext%20tvOS/Services/Plugin/PluginModel.swift)。
測試見 [TESTING.md](TESTING.md)，對外生效流程見 [MAINTENANCE.md](MAINTENANCE.md)。

## 設定與入口

可複製的最小實作是 [plugin_blueprint](plugin_blueprint/) 的 `config.json` 與
`app.js`，不另抄錄整份範例。

| 欄位 | 語意 |
| --- | --- |
| `name`、`description`、`notification` | 頻道名稱、描述與通知文字 |
| `host` | 插件 JS 使用的主站 |
| `hosts` | bootstrap probe 候選；JS 使用 runtime 選定的單一 host |
| `files` | 唯一腳本清單與載入順序，工具腳本先於使用者腳本 |
| `pages` | 分類的 `key`、`title`、`url`、`javascript`；預設首頁使用 `key: "index"` |
| `search` | `url` 與 `javascript`；URL 支援 `${keyword}` |
| `episodes`、`player` | 入口函式 `javascript` 與可選 `timeout` |
| `timeout` | 操作的 JS 結果等待及 HTTP／SafeLine inactivity timeout，單位為秒 |

分類 URL 支援 `${pageNumber}`。入口名稱由設定宣告，不預設為 `Home`／`Play`。
分類、劇集與播放器函式接收 `inputURL`；搜尋另接收 `pluginKey`，需原樣交回
`$next.toSearchMedias(json, pluginKey)`。

`AliDrive` permission、`$next.aliLink` 與 `$next.aliPlay` 已移除。宣告該 permission
會初始化失敗；OpenList 不提供替代的插件網盤 API。

### Host bootstrap 與 managed challenge

多 host 插件可定義 `HostsProbeRequest()`，回傳 request 與 `accept` 條件：

```js
function HostsProbeRequest() {
  return {
    url: HOST + "/movie_bt",
    method: "GET",
    accept: {
      statusCodes: [200],
      bodyIncludesAny: ["bt_img"],
      bodyExcludesAny: ["访问验证", "captcha"],
      titleExcludesAny: ["403 Forbidden"]
    }
  };
}
```

驗收看 redirect 後的最終 response；正式 JS 只依賴 `__syncnextPrimaryHost`。
bootstrap 不代表每次 request 都可切換 host，JS 不自行輪詢候選域名。

需要 App 代管網站驗證時，配置完整 capability：

```json
"challenge": { "schema": 1, "mode": "managed", "scope": "hosts" }
```

權限只涵蓋 `host + hosts` 的 exact HTTP(S) origins，包括 scheme 與非預設 port。
不授權 wildcard、父域名或 redirect 自動擴權，也不提供 Cookie 名稱／solver 設定。
未聲明 capability 時仍可做一般 HTTP；challenge、block 或無法安全分類的驗證頁
會明確失敗。

### 腳本 Hash

`cache` 是 advisory cache manifest，不能取代 `files`：

```json
"cache": {
  "schema": 1,
  "resources": {
    "app.js": { "sha256": "<64 位小寫十六進制>", "bytes": 1234 }
  }
}
```

每個 `files` 項目都記錄公開原始 bytes 的 SHA-256 與 byte 數。修改腳本後用
`node tools/update-plugin-cache.js plugin_<provider>` 更新，並以 `--check` 驗證。
Hash 必須與腳本一起發布。

缺失、無效或不匹配的 manifest 不寫入該 Hash 的持久快取，但可使用本次網絡回應；
網絡失敗仍是載入失敗。若腳本改動卻未更新 Hash，runtime 可繼續使用符合舊 Hash
的本機內容，不額外探測 freshness。

## HTTP 與 JavaScript 環境

`$http.fetch` 與 `$http.head` 接收一個 request object：

```js
$http.fetch({
  url: inputURL,
  method: "GET",
  headers: { Referer: HOST }
}).then(function (response) {
  // response.statusCode、response.headers、response.body
}).catch(function (error) {
  $next.emptyView("來源請求失敗");
});
```

`fetch` request 支援 `url`、`method`、`headers`、`body`；`head` 用於 HEAD 探測。
App 提供自訂 `JSPromise`，不能把 Node／瀏覽器的 `fetch(url, options)`、Promise
或模組能力當作相同接口。實際 headers、cookies、redirect 與取消行為以 `JSHttp`
為準；Node parser 通過不代表 tvOS JavaScriptCore 與真實媒體可播放。

其他公開 bridge：

- `$prefs.getValueForKey(key)`、`$prefs.setValueForKey(value, key)`；實作直接使用
  UserDefaults，不能假設存在插件獨立 namespace 或 `get`／`set`／`remove` aliases。
- `console.log(string)`；其他 console methods 不在 `JSConsoleExports`。
- timer 與 callback 生命週期由 `JSCommunicationHandler` 擁有，取消後的 callback
  不能作為新操作的結果。

## 結果與資料模型

下列 API 的 JSON 參數均為 `JSON.stringify(...)` 後的字串。
欄位增減與 optional 語意以
[StandardMedia.swift](../Syncnext/Syncnext%20tvOS/Services/Plugin/StandardMedia.swift)、
[StandardPlayerData.swift](../Syncnext/Shared/Models/Plugin/StandardPlayerData.swift)
與 `JSNext.swift` 為準。

| API | 輸入 |
| --- | --- |
| `$next.toMedias(json)` | 媒體陣列；分類不傳搜尋 key |
| `$next.toSearchMedias(json, pluginKey)` | 媒體陣列與原樣傳回的搜尋 key |
| `$next.toEpisodes(json)` | 單一劇集列表；`episodeDetailURL` 交給插件 player resolver |
| `$next.toEpisodesCandidates(json)` | `{ source, episodes }` 陣列；候選需提供 App 可直接探測的真實 HTTP(S) 播放地址 |
| `$next.toPlayer(url)` | 一個已解析的播放地址 |
| `$next.toPlayerByJSON(json)` | `{ url, headers }` |
| `$next.toPlayerCandidates(json)` | `[{ url, headers }, ...]`，不包成 `{ candidates: [...] }` |
| `$next.emptyView(text)` | 記錄操作的空結果／錯誤訊息；實際呈現由當前 App 操作決定 |

媒體最小欄位：

```json
{ "id": "media-1", "title": "影片", "detailURLString": "https://example.com/detail/1" }
```

可選的封面與描述為 `coverURLString`、`descriptionText`。

劇集最小欄位：

```json
{ "id": "episode-1", "title": "第 1 集", "episodeDetailURL": "https://example.com/play/1" }
```

其他 metadata 直接查模型，不為它們建立另一份欄位表。播放 JSON 必須包含
`headers`，沒有額外 headers 時傳 `{}`。字幕／quality 等未出現在 decoder 的自訂
欄位不能當成有效的 App 交接契約。

`toEpisodesCandidates` 可以只有一組，但不能交付尚待 resolver 解碼的私有 payload、
中間 key 或包裝頁。這類輸入使用 `toEpisodes`，由插件 `Player()` 解出真實地址後
再回傳 player 結果。普通劇集請求可以是插件擁有的 opaque token；最終 player
輸出仍須為 App 可接受的 HTTP(S) 媒體 URL。

## 本機 OCR

`$vision.recognizeText(base64Image, callback)` 接收原始 Base64 圖片字串，
不接收 URL 或 data URL。未取消的工作異步回調一次：

```js
$vision.recognizeText(base64Image, function (result) {
  if (result.error) {
    $next.emptyView("文字辨識失敗：" + result.error.code);
    return;
  }
  // result.observations: text、confidence、bbox { x, y, w, h }
});
```

成功結果包含原圖尺寸；bbox 是以左上角為原點的原圖像素。
無效輸入、不支援圖片、超限或辨識失敗以 `error.code` 回報。辨識在 App 本機進行，
取消後不回傳晚到結果，也不切換外部 OCR provider。
