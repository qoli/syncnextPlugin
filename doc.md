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

說明適用於 Syncnext 主程式（tvOS / iOS）所載入的兩個插件倉庫：`SyncnextPlugin` 與 `SyncnextPluginQAQ`，兩者共用相同的協議與執行邏輯。

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

1. **使用者在 Syncnext（tvOS/iOS 主程式）中點選來源 / 頻道頁**，原生端讀取 `config.json` 並載入 `files` 內的腳本。
2. Syncnext 依 `pages`、`search`、`episodes`、`player` 的設定呼叫對應函式。分類頁與播放／劇集函式僅會收到一個 `inputURL` 參數；只有 `search` 會額外帶入第二個 `pluginKey`（實際上是該插件訂閱地址），用來對應搜尋結果。
3. 插件透過 `$http` 發送請求取得 HTML / JSON / m3u8 等內容。
4. 插件將內容解析為 Syncnext 能理解的物件陣列。
5. 插件透過 `$next.toMedias` / `$next.toSearchMedias` / `$next.toEpisodes` / `$next.toPlayer*` 等 API 回傳資料，必要時可連續呼叫（例如先回傳封面牆再回傳劇集）。
6. Syncnext 依 `pages[].key` 定義分類分頁，並以 `pluginKey` 追蹤搜尋結果，最後渲染封面牆、播放列表或錯誤畫面。

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

* `host`：主域名，也是插件 JavaScript 唯一應依賴的域名欄位。
* `hosts`：可選的保留擴展欄位。當前插件層不應依賴它，也不應假設 runtime 會自動 mirror failover。
* `files`：腳本載入與打包順序，由於 Syncnext 會依序注入，在 `browserify` 打包時也請保持一致（先工具、後主程式）。
* `pages`：定義首頁/分類等入口，`url` 可使用 `${pageNumber}` 占位符；`key` 僅用於原生 UI 標識分類，不會自動傳入 JS 函式。**至少保留一個 `key: "index"` 的項目**，Syncnext 會以此作為預設入口，缺少該項會導致插件載入後首頁為空。
* 為兼容舊版 runtime，`pages[*].url` 與 `search.url` 仍建議保持完整絕對 URL；不要為了多域名而改成新模板語法。
* `search`：唯一必填欄位為 `url` 與 `javascript`，`url` 支援 `${keyword}`；執行搜尋時 Syncnext 會以第二參數提供 `pluginKey`（實際為插件訂閱 URL），務必原樣傳回 `$next.toSearchMedias(json, pluginKey)` 以對應結果。
* `episodes` 與 `player`：分別用於點擊媒體後取得劇集清單與實際播放網址，欄位僅需指定函式名稱與（可選）`timeout`。
* `permission`：對阿里雲盤授權等敏感功能（`$next.aliLink` / `$next.aliPlay`）必須顯式標記 `AliDrive`。
* `notification`：可選字串，顯示於 Syncnext 內的頻道通知區域（如僅支援海外 IP），請勿寫入敏感資訊或密鑰。
* `timeout`：可在 pages/search/episodes/player 上個別覆蓋，單位為秒；若未設置則使用 Syncnext 預設值。

# $http API

`$http` 用於發出 HTTP 請求並取得結果，語意類似 fetch，但為了兼容性有更簡化的版本。

## `$http.fetch(req)`

發送網路請求（GET / POST / 其他方法）。

> ⚠️ **注意**  
> tvOS / iOS 端的 JavaScriptCore 執行環境尚未完整實作標準 Promise。當前 Syncnext 的 `$http.fetch` 應使用 `then(successCallback).catch(errorCallback)`；不要假設 `then(success, failure)` 一定可用，也不要把 `$http.fetch` 直接 `return` 給其他函式等待 `await`。若需要封裝請求邏輯，建議維持 callback 風格，或在 `then` 內直接處理完成事件。

```js
var req = {
  url: inputURL,
  method: "GET",
};

$http.fetch(req).then(function (res) {
  // res.statusCode
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

### `$next.toMedias(json)`

建立封面牆（首頁 / 分類）。對於分類頁，僅需傳入 JSON 字串即可；Syncnext 會依當前頁面及 `pages[].key` 自行綁定結果。第二參數僅供內部搜尋快取使用，常規分類頁請勿傳入。

```js
function buildMedias(inputURL) {
  // ...
  $next.toMedias(JSON.stringify(returnDatas));
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

此為建立搜尋結果封面牆的標準方式；第二參數 `key` 等同於 Syncnext 傳入的 `pluginKey`，務必原樣傳回。

---

## 劇集播放列表

### `$next.toEpisodes(json)`

回傳一組劇集列表。

### `$next.toEpisodesCandidates(json)`（1.138+）

傳遞「多組來源的候選播放列表」，Syncnext 會自動測試可播放性並選擇最佳來源。

用途：

* 多來源影片站
* 同劇集多解析度 URL

> ⚠️ **重要**
> `toEpisodesCandidates` 對 **1 組或多組** candidates 都合法。真正的前提不是候選組數，而是每組 `episodes[0].episodeDetailURL` 都必須是 **App 可直接探測的真實地址**。
>
> 這裡的「可直接探測」指：
> * `http(s)` URL
> * 不能是插件私有 payload
> * 不能是還要靠 `Player()` 再解一次的中間 key
> * 不能是只對 Node / curl 可用、但在 tvOS `JSHttp` 會跳轉或失敗的包裝頁
>
> 若插件把 unresolved key、resolver 包裝頁、detail JSON 頁面、或其他非真實播放地址交給 `toEpisodesCandidates`，Syncnext 會在候選可達性檢查與質量評分階段失敗。

---

## 新插件避坑（2026-04 AGE 重構經驗）

以下規則不是 AGE 私有特例，而是新插件開發時應優先遵守的通用原則。

### 1. 不要把 Node 測試結果當作 tvOS JavaScriptCore 的真相

`node_test_all_plugins.js`、`curl`、瀏覽器 DevTools 只能驗證「網站現在是否可解析」，不能代表 Syncnext App 內的 `JavaScriptCore + JSHttp` 也會得到同樣結果。

常見差異來源：

* App 端會自動補安全導航 headers
* `Origin` / `Referer` 可能與 Node 行為不同
* 某些 resolver 會對 App 端 header 指紋做不同跳轉
* Promise 橋接契約與標準 JS 執行器不同

結論：

* Node 測試可作為 smoke test
* 真正涉及播放、選線、resolver 的插件，仍必須在 tvOS / iOS 實機或模擬器上驗證

### 2. `Episodes` 的核心責任是輸出「可被 App 消費」的地址

不要把 `Episodes` 理解成「先隨便塞一個 key，之後再靠 `Player()` 補救」。

對 Syncnext 而言：

* `$next.toEpisodes(json)`：輸出單組劇集列表
* `$next.toEpisodesCandidates(json)`：輸出候選劇集源，App 會先做可達性探測與質量評分

因此：

* 若插件要走 `toEpisodesCandidates`，`episodeDetailURL` 就必須已經是 App 可直接探測的真實地址
* 不能把私有 payload、resolver 包裝頁、JSON 詳情頁、iframe 頁面交給 `toEpisodesCandidates`
* 若插件設計成「Episodes 就是 candidates 模式」，那失敗時應 `emptyView`，而不是再退回另一套協議掩蓋問題

### 3. 不要按 candidates 組數決定 API，應按地址形態決定

錯誤做法：

* 「只有 1 組就用 `toEpisodes`」
* 「多於 1 組才用 `toEpisodesCandidates`」

正確做法：

* 只要候選組的地址已是 App 可直接探測的真實地址，就可以使用 `toEpisodesCandidates`
* 1 組 candidates 依然合法
* 能不能用 candidates，取決於地址是否可探測，不取決於候選組數

### 4. 小心 resolver 包裝頁與 iframe/廣告跳轉

有些站點的播放鏈路是：

* 劇集 key
* resolver 包裝頁
* HTML / iframe 播放頁
* 最終 m3u8 / mp4

對 Syncnext App 來說：

* iframe 包裝頁通常不是可直接播放地址
* 包裝頁若只返回 HTML，會被候選探測誤判
* 某些 resolver 在 App 端還會被重定向到廣告站或假頁面

實務規則：

* 若站點存在 resolver，優先在插件內把 resolver 解到最終播放 URL
* 不要把 resolver URL 本身交給 `toEpisodesCandidates`
* 不要把 iframe 包裝頁交給 `toPlayer`

### 5. `JSHttp` 的自動 headers 可能改變上游站點行為

Syncnext 的 `JSHttp` 會自動補一組接近瀏覽器導航請求的 headers。這通常能提升通用抓站成功率，但對 resolver 類站點可能反而造成副作用。

已知風險：

* 自動 `Origin` / `Referer` 可能觸發上游反爬或錯誤跳轉
* 同一個 URL 在 `curl` 可用，但在 App 端因 header 指紋不同而返回另一份 HTML

實務規則：

* 遇到 resolver 在 App 端跳轉異常時，先比對 header 差異
* 必要時在插件請求內顯式覆蓋 `Origin` / `Referer`
* 不要假設「瀏覽器能播」就代表「App 端用同一 URL 也能播」

### 6. 先定義插件的播放責任邊界，再寫代碼

寫新插件前，先回答這個問題：

* `Episodes` 輸出的是最終播放地址，還是中間頁？
* `Player()` 是只做轉發，還是負責最終解密？
* App 端是否會在 `Player()` 之前先探測 `episodeDetailURL`？

若這三件事沒先定清楚，後面很容易出現：

* `Episodes` 以為可以交 payload
* `Player()` 以為自己能兜底
* App 端其實早在候選探測階段就已失敗

建議流程：

1. 先畫出站點播放鏈路：劇集 key -> 中間頁 -> 最終播放 URL
2. 再決定哪一層由 `Episodes` 解完
3. 最後才選擇 `toEpisodes` 或 `toEpisodesCandidates`

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

Syncnext 1.74+ 會讀取 `notification` 字串並在主程式內顯示提示，例如：

```json
{
  "notification": "僅支援海外 IP，請配合代理"
}
```

後續版本亦預留擴展空間（遠端通知、自動刷新、背景更新等），但目前僅 `notification` 對外公開。

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

* 搜尋函式會在載入時進行靜態檢查，若仍呼叫 `$next.toMedias` 將被阻擋並強迫改用 `$next.toSearchMedias(json, key)`。

## Alpha 4.2（Syncnext 1.74+）

* config.json 支援 notification

## Alpha 4.1（Syncnext 1.72+）

* 開始提醒開發者將搜尋遷移到 `$next.toSearchMedias`，但分類頁仍保留單參數 `$next.toMedias(json)` 相容層。

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

1. 分類 / 首頁頁面請呼叫 `$next.toMedias(JSON.stringify(datas))`，搜尋流程一律使用 `$next.toSearchMedias(JSON.stringify(datas), key)` 並原樣傳回 Syncnext 提供的 `key`。
2. 搜尋 / 封面牆 JSON 至少包含 `id`、`title`、`detailURLString`，再依需求附上 `coverURLString`、`descriptionText`，並在送出前 `JSON.stringify()`。
3. 解析邏輯先在本機以 `node_Test.js` 或 `localServer.sh` + `test/` 夾帶的樣本驗證，減少真站測試頻率。
4. 影音來源一律先以 `$http.head`（或 `$next.toPlayerCandidates`）驗證可用性，並在需要時傳遞 Referer / UA。
5. 若來源可能失敗，使用 `$next.emptyView()` 把原因展示給使用者，避免留白頁。
6. 需要阿里雲盤能力的插件記得在 `config.json` 寫上 `"permission": "AliDrive"` 並優先用 `$next.aliLink`/`$next.aliPlay`。
7. 上線前移除 `print()` / `console.log()` 等除錯語句，保證輸出純資料。

---

# 常見錯誤

| 錯誤             | 原因                                           | 修正                                                |
| -------------- | -------------------------------------------- | ------------------------------------------------- |
| 封面牆 / 分類頁為空     | `buildMedias` 未呼叫 `$next.toMedias()` 或 JSON 結構不符      | 確保呼叫 `$next.toMedias(JSON.stringify(datas))` 並包含必要欄位 |
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
