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

## 基本架構概念

Syncnext 插件是以 JavaScript 撰寫的模組，Syncnext 會在沙盒環境中執行插件程式碼，並提供一組 API 讓插件能回傳媒體資料、播放列表、播放 URL、阿里雲盤內容等。

整體流程概念：

1. **使用者在 Syncnext 中點選來源 / 頻道**
2. Syncnext 呼叫插件的某個函式，例如：

   * `Search(inputURL, key)` → 搜尋
   * `Home(inputURL)` → 頻道首頁
3. 插件透過 `$http` 發送請求取得內容
4. 插件將內容轉換為 Syncnext 能理解的 JSON
5. 插件透過 `$next.toMedias` / `$next.toSearchMedias` / `$next.toEpisodes` 等 API 回傳畫面
6. Syncnext 渲染封面牆或播放列表

---

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

### 🚫 `$next.toMedias(json)`（已廢棄，勿再用）

Syncnext 1.72 起完全刪除。

若使用將造成：

* Search 代碼拒絕執行
* Release 版本調用錯誤 API

### ✅ `$next.toMedias(json, key)`（正確用法）

建立封面牆（非搜尋場景）：

```js
$next.toMedias(JSON.stringify(returnDatas), key);
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

* 阻止使用已廢棄 `$next.toMedias(json)`
* Search 若調用廢棄 API → 拒絕執行

## Alpha 4.2（Syncnext 1.74+）

* config.json 支援 notification

## Alpha 4.1（Syncnext 1.72+）

* `$next.toMedias(json)` 完全移除

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

1. **封面牆一律使用 `toMedias(json,key)` 與 `toSearchMedias`**
2. 絕對不要使用已廢棄的 toMedias(json)
3. 播放地址務必加入 HEAD 檢查
4. 優先使用 `toPlayerCandidates` 增強穩定性
5. 若來源容易掛，適時使用 emptyView
6. 搜尋結果 JSON 請保持簡潔：

   * title
   * cover
   * url / id
7. 所有 JSON 請使用 `JSON.stringify()`

---

# 常見錯誤

| 錯誤         | 原因                   | 修正                           |
| ---------- | -------------------- | ---------------------------- |
| 無法顯示搜尋結果   | 使用了舊的 toMedias(json) | 更改為 toSearchMedias(json,key) |
| 點擊影片卻無法播放  | 未加入 headers          | 使用 toPlayerByJSON            |
| 播放地址偶爾失效   | 單來源                  | 使用 toPlayerCandidates        |
| Search 不執行 | 使用了廢棄 API            | 移除舊版 toMedias                |

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
