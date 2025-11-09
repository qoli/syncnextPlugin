# Syncnext 插件化頻道協議 — 開發者完整文檔

（以下內容為根據目前網站所載資訊所整理與補全的技術文檔，面向希望為 Syncnext 開發插件、頻道、媒體源的開發者。）

## 簡介

Syncnext 的「插件化頻道協議」允許開發者以 JavaScript 實現自定義頻道、媒體牆、播放列表、搜尋功能，並透過內建 API（`$http` / `$next`）與 Syncnext 主程式互動，使得第三方來源能無縫輸入 Syncnext 內容系統。

此文檔旨在：

* 解釋協議核心概念
* 完整整理 `$http` 與 `$next` API
* 提供版本差異與更新歷史
* 指導如何實作搜尋、媒體牆、播放列表、播放功能
* 提供開發最佳實踐與常見錯誤示例

---

## 專案結構與開發資源

### 目錄總覽

* `plugin_*`：每個資料夾對應一個來源，內含 `config.json`、主程式（`app.js` / `main.js`）及額外的解析工具（如 `txml.js`）。
* `doc.md`：本文件，記錄協議、專案工作流程與最新注意事項。
* `node_Test.js`：Node.js 解析腳手架，可離線調試 `$http` 解析邏輯或複製成插件專用測試。
* `test/`：保存網站回應或 `.m3u8` 樣本，方便脫機調試；搭配 `localServer.sh` 可快速起 HTTP 伺服器。
* `localServer.sh`：`python3 -m http.server` 的封裝，預設於 `http://localhost:8000` 服務 `test/` 內容。
* `README.md` / `AGENTS.md`：分別列出外部文檔連結與倉庫貢獻指南。

### 常用開發命令

* `npm install`：安裝 `browserify`、`txml`、`crypto-js` 等通用相依。
* `node node_Test.js`：執行參考解析腳本，驗證 JSON 結構或複製改造成插件測試。
* `npx browserify plugin_wogg/app.js -o plugin_wogg/dist.js`：將插件打包成單檔，其他插件替換檔案路徑即可。
* `bash localServer.sh`：啟動靜態伺服器，便於對 `test/` 內部快取資源做人工播放測試。

### 編碼與命名慣例

* 採 2 空白縮排、以 `const`/`let` 為主並保留結尾分號；僅在需要時使用 `var`。
* 插件檔名與資料夾維持 `plugin_<provider>` 命名，`config.json.files` 的陣列順序即為載入順序（例如先載入 `txml.js` 再載入主程式）。
* 每個頁面、搜尋、播放、劇集入口都在 `config.json` 內以 `javascript` 字串名稱對應函式，無需限制為 `Home` / `Play` 等保留名稱，但建議使用語意清楚的動詞。
* 新增或修改來源時，盡量提供 fixture（HTML / JSON / m3u8）或 Node 測試腳本，讓 reviewer 能重現。

---

## 基本架構概念

Syncnext 插件是以 JavaScript 撰寫的模組，Syncnext 會在沙盒環境中執行插件程式碼，並提供一組 API 讓插件能回傳媒體資料、播放列表、播放 URL、阿里雲盤內容等。

整體流程概念：

1. **使用者在 Syncnext 中點選來源 / 頻道頁**，主程式讀取 `config.json` 並載入 `files` 內的腳本。
2. Syncnext 依 `pages`、`search`、`episodes`、`player` 的設定呼叫對應函式，每個函式至少取得 `inputURL`，若頁面定義了 `key` 則會以第二參數帶入。
3. 插件透過 `$http` 發送請求取得 HTML / JSON / m3u8 等內容。
4. 插件將內容解析為 Syncnext 能理解的物件陣列。
5. 插件透過 `$next.toMedias` / `$next.toSearchMedias` / `$next.toEpisodes` / `$next.toPlayer*` 等 API 回傳資料，必要時可連續呼叫（例如先回傳封面牆再回傳劇集）。
6. Syncnext 依 `key` 與 API 回應渲染封面牆、播放列表或錯誤畫面。

---

## `config.json` 關鍵欄位

```json
{
  "name": "玩偶哥哥",
  "description": "阿里雲盤資源庫",
  "notification": "",
  "host": "https://wogg.xxooo.cf/",
  "files": ["txml.js", "app.js"],
  "permission": "AliDrive",
  "pages": [
    {
      "key": "movie",
      "title": "電影",
      "url": "https://wogg.xxooo.cf/index.php/vodshow/1--------${pageNumber}---.html",
      "timeout": 120,
      "javascript": "buildMedias"
    }
  ],
  "episodes": { "javascript": "getEpisodes" },
  "player": { "javascript": "Player" },
  "search": {
    "url": "https://wogg.xxooo.cf/index.php/vodsearch/-------------.html?wd=${keyword}",
    "javascript": "Search"
  }
}
```

重點說明：

* `files`：腳本載入與打包順序，由於 Syncnext 會依序注入，在 `browserify` 打包時也請保持一致（先工具、後主程式）。
* `pages`：定義首頁/分類等入口，`url` 可使用 `${pageNumber}` 占位符；`key` 會傳入 JS 函式並應被原樣帶入 `$next.toMedias(..., key)` 以維持分頁狀態。**至少保留一個 `key: "index"` 的項目**，Syncnext 會以此作為預設入口，缺少該項會導致插件被拒絕載入。
* `search`：唯一必填欄位為 `url` 與 `javascript`，`url` 支援 `${keyword}`；`key` 由 Syncnext 於執行搜尋時提供。
* `episodes` 與 `player`：分別用於點擊媒體後取得劇集清單與實際播放網址，欄位僅需指定函式名稱與（可選）`timeout`。
* `permission`：對阿里雲盤授權等敏感功能（`$next.aliLink` / `$next.aliPlay`）必須顯式標記 `AliDrive`。
* `notification`：供插件展示額外提示（如僅支援海外 IP），請勿寫入敏感資訊。
* `timeout`：可在 pages/search/episodes/player 上個別覆蓋，單位為秒；若未設置則使用 Syncnext 預設值。

# $http API

`$http` 用於發出 HTTP 請求並取得結果，語意類似 fetch，但為了兼容性有更簡化的版本。

## `$http.fetch(req)`

發送網路請求（GET / POST / 其他方法）。

```js
var req = {
  url: inputURL,
  method: "GET",
};

$http.fetch(req).then(function (res) {
  // res.status
  // res.headers
  // res.body: string
});
```

支援：

* `url`
* `method`
* `headers`
* `body`

示例（帶 Referer + POST）：

```js
var headers = {
  Referer: "https://www.libvio.vip/",
};

var req = {
  url: url,
  method: "POST",
  headers: headers,
  body: JSON.stringify(data),
};

$http.fetch(req).then(function (res) {
  ...
});
```

---

## `$http.head(req)`（Syncnext 1.135+）

用於取得 URL 的 HEAD，只回傳 header 方便測試影片來源是否有效：

```js
var req = { url: inputURL };
$http.head(req).then(function (res) {
  // res.headers 內含 Content-Type 等資訊
});
```

HEAD 特別適合：

* 判斷真實播放地址（如 m3u8 是否存在）
* 避免 GET 整串影片造成流量浪費

---

# $next API

`$next` 提供插件將結果回傳給 Syncnext UI。

以下為完整 API 與用途敘述。

## `$next.aliLink(string)`

傳遞阿里雲盤分享連結給 Syncnext。主要用於自動解析阿里雲盤內容。

## `$next.aliPlay(fileID)`

要求 Syncnext 直接播放某個阿里雲盤的 fileID。

---

## 媒體牆（封面牆）類 API

### `$next.toMedias(json, key?)`

建立封面牆（首頁 / 分類）。`key` 會對應 `config.json.pages[].key`，新插件應盡量把它當作第二參數傳回，讓 Syncnext 能記住使用者所在頁面；舊版客戶端（或仍未調整的插件）若僅傳入 `json` 仍可運作，但不再建議沿用。

```js
function buildMedias(inputURL, key) {
  // ...
  $next.toMedias(JSON.stringify(returnDatas), key);
}
```

### ✅ `$next.toSearchMedias(json, key)`

搜尋模式的封面牆（Search 專用）。

```js
function Search(inputURL, key) {
  // ... 解析搜尋結果
  $next.toSearchMedias(JSON.stringify(returnDatas), key);
}
```

此為建立搜尋結果封面牆的標準方式。

---

## 劇集播放列表

### `$next.toEpisodes(json)`

回傳一組劇集列表。

### `$next.toEpisodesCandidates(json)`（1.138+）

傳遞「多組來源的候選播放列表」，Syncnext 會自動測試可播放性並選擇最佳來源。

用途：

* 多來源影片站
* 同劇集多解析度 URL

---

## 播放功能

### `$next.toPlayer(string)`

傳遞一個播放地址。

### `$next.toPlayerByJSON(json)`（1.115+）

支援傳遞播放時需要的 HTTP headers，例如 Referer：

```js
var data = {
  url: playURL,
  headers: {
    "User-Agent": "Mozilla/...",
    Referer: originURL
  }
};

$next.toPlayerByJSON(JSON.stringify(data));
```

### `$next.toPlayerCandidates(json)`（1.135+）

傳遞一組可播放地址，由 Syncnext 自動測試：

```js
{
  candidates: [
    { url: "https://1...", headers: {} },
    { url: "https://2...", headers: {} }
  ]
}
```

Syncnext 會：

* HEAD 檢查
* 測試是否可播放
* 自動 fallback

---

## 錯誤訊息呈現

### `$next.emptyView(string)`（1.93+）

讓播放列表顯示一個錯誤或無結果畫面。

用途：

* 搜尋無結果
* 劇集來源掛掉
* 插件解析錯誤

---

# config.json 擴展點

Syncnext 1.74+ 支援：

```json
{
  "notification": true
}
```

未來可擴展，包括：

* 插件接收通知
* 自動刷新
* 背景更新

---

# 版本更新歷史（Alpha 1 → 4.6）

本段追蹤協議與 API 的演化脈絡。

## Alpha 4.6（Syncnext 1.135+）

新增：

* `$http.head(req)`
* `$next.toPlayerCandidates(json)`

## Alpha 4.5（Syncnext 1.116+）

新增：

* `$next.toPlayerByJSON(json)` 支援傳遞播放 headers

## Alpha 4.4（Syncnext 1.93+）

新增：

* `$next.emptyView(string)`

## Alpha 4.3（Syncnext 1.75+）

* 新版客戶端會對僅傳單一參數的 `$next.toMedias(json)` 顯示錯誤，請同步傳入 `key` 以避免被阻擋。
* Search 入口若仍舊呼叫廢棄 API（如舊版 toMedias）會被拒絕執行，務必改用 `$next.toSearchMedias(json, key)`。

## Alpha 4.2（Syncnext 1.74+）

* config.json 支援 notification

## Alpha 4.1（Syncnext 1.72+）

* 宣告廢棄僅帶單一參數的 `$next.toMedias`，後續版本將逐步移除，相容層僅保留給舊版 Syncnext。

## Alpha 4

* 統一 Search 寫法

## Alpha 3

* 新增阿里雲盤 API
* 加入登入檢查

## Alpha 2

* 重建設計方案

## Alpha 1

* 初版可用

---

# 實作示例

## 搜尋範例（標準寫法）

```js
function Search(inputURL, key) {
  var req = { url: inputURL, method: "GET" };

  $http.fetch(req).then(function (res) {
    var html = res.body;
    var returnDatas = parseSearchResults(html);

    $next.toSearchMedias(JSON.stringify(returnDatas), key);
  });
}
```

---

## 播放範例（帶 headers）

```js
function Play(url) {
  var data = {
    url: url,
    headers: {
      Referer: "https://example.com/",
      "User-Agent": "Mozilla..."
    }
  };

  $next.toPlayerByJSON(JSON.stringify(data));
}
```

---

# 最佳實踐

1. `toMedias` 與 `toSearchMedias` 都要同時傳遞 JSON 字串與 `key`，僅在維護舊版時才保留單參數 fallback。
2. 搜尋 / 封面牆 JSON 只保留 `title`、`coverURLString`、`detailURLString` 等必要欄位，並在送出前 `JSON.stringify()`。
3. 解析邏輯先在本機以 `node_Test.js` 或 `localServer.sh` + `test/` 夾帶的樣本驗證，減少真站測試頻率。
4. 影音來源一律先以 `$http.head`（或 `$next.toPlayerCandidates`）驗證可用性，並在需要時傳遞 Referer / UA。
5. 若來源可能失敗，使用 `$next.emptyView()` 把原因展示給使用者，避免留白頁。
6. 需要阿里雲盤能力的插件記得在 `config.json` 寫上 `"permission": "AliDrive"` 並優先用 `$next.aliLink`/`$next.aliPlay`。
7. 上線前移除 `print()` / `console.log()` 等除錯語句，保證輸出純資料。

---

# 常見錯誤

| 錯誤             | 原因                                           | 修正                                                |
| -------------- | -------------------------------------------- | ------------------------------------------------- |
| 封面牆 / 分類頁跳回預設 | `toMedias` 未傳入 `key`，Syncnext 無法對應頁面             | 呼叫 `$next.toMedias(JSON.stringify(datas), key)` |
| 無法顯示搜尋結果     | Search 仍呼叫舊 `toMedias` 或忘記 `JSON.stringify()` | 改用 `$next.toSearchMedias(JSON.stringify(datas), key)` |
| 點擊影片卻無法播放    | 播放接口缺少 Referer/UA 或未先 HEAD 檢查                 | 改用 `$next.toPlayerByJSON()` 並補上 headers       |
| 播放地址偶爾失效     | 只有單一播放來源、未做候選與驗證                         | 建立 `$next.toPlayerCandidates()` 或增加 `$http.head` |
| Search 不執行      | `config.json` 的 `files`/`javascript` 名稱不符或未加載工具 | 檢查 `files` 順序與函式名稱，確保與實作一致         |

---

# 未來方向（IDEA）

* AnyCookie + WAF 支援（插件化）
* 更完整的通知、刷新流程
* 更多播放協議支援
* 本地快取優化

---

# 參考項目

* [https://github.com/qoli/syncnextPlugin](https://github.com/qoli/syncnextPlugin)
* [https://github.com/alexiscn/JSDrive](https://github.com/alexiscn/JSDrive)

---

# 結語

以上為根據網站內容精煉、重新組織、補全邏輯後的完整版本。若你正在維護或新增 Syncnext 插件，本文件即可作為完整的開發者入門與進階參考。
