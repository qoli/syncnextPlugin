# Plugin 插件藍本（以 `plugin_colafun` 為例）

> 目標：提供一個可複製的骨架，讓新插件能快速對齊 Syncnext 的資料流、命名與測試方式。

## 1. 目錄與檔案配置

```
plugin_<provider>/
├─ config.json      # 插件入口設定，宣告頁面、搜尋、播放等端點
├─ app.js           # 實作 Home/Search/Play/Episodes 所需的 JavaScript
└─ txml.js          # HTML parsing helper；可直接複製 blueprint 版本
```

建立新插件時：

1. 複製整個 `plugin_blueprint/` 資料夾並重新命名為 `plugin_<provider>/`。
2. 搜尋 `TODO` 或 `example.com` 並依據目標網站更新設定。
3. 覆用 `txml.js`（僅當目標網站 DOM 差異極大時才調整）。
4. 在 `config.json` 與 `app.js` 內替換 URL、CSS class、資料解析邏輯；必要時加入額外 helper 檔案並記得更新 `config.json.files`。

## 2. `config.json` 範本

```jsonc
{
  "name": "頻道名稱",
  "description": "頻道敘述",
  "host": "https://example.com",
  "files": ["txml.js", "app.js"], // 確保 Syncnext 會打包必要檔案
  "pages": [
    {
      "key": "index", // Home tab key，需在 app.js 中對應
      "title": "最近更新",
      "url": "https://...page=${pageNumber}",
      "timeout": 20,
      "javascript": "buildMedias" // app.js 內暴露的函式名稱
    }
    // 可新增其他分頁：熱門 / 最新 / 類別等
  ],
  "episodes": {
    "javascript": "Episodes"
  },
  "player": {
    "timeout": 20,
    "javascript": "Player"
  },
  "search": {
    "url": "https://...name=${keyword}",
    "javascript": "buildSearchMedias"
  }
}
```

- `key` 與 `javascript` 名稱需和 `app.js` 中的函式完全一致；`plugin_blueprint/app.js` 已預先提供 `buildMedias`、`buildSearchMedias`、`Episodes`、`Player`。
- page URL 建議保留 `pageNumber` 變數，讓 Syncnext 自動處理翻頁。
- 搜尋端點同樣透過佔位符 `${keyword}`。

## 3. `app.js` 核心流程

`plugin_colafun/app.js` 與本藍本中的偽代碼展示了最小可行實作，可按下列步驟套用到新網站：

1. **通用 builder**

   - `buildMediaData`：統一媒體卡片欄位（id、封面、標題、描述、detail URL）。
   - `buildEpisodeData`：統一單集結構（id、title、episodeDetailURL）。
   - 覆用既有函式可確保 `$next` 接到一致的 JSON。

2. **HTML 解析**

   - `txml.js` 允許用 `tXml.getElementsByClassName`、`getElementById` 取得節點。
   - 如目標網站 class/id 變動，只需調整 `buildMedias`/`Episodes` 內的 DOM 取值。

3. **Medias / Search**（列表頁）

   ```js
   function buildMedias(listURL, key) {
     const req = { url: listURL, method: "GET" };
     const datas = [];
     $http.fetch(req).then(function (res) {
       const cards = tXml.getElementsByClassName(res.body, "card shadow-sm");
       cards.forEach(function (dom) {
         const title = findAllByKey(dom, "title")[0];
         const href = buildURL(findAllByKey(dom, "href")[0]);
         const cover = findAllByKey(dom, "data-original")[0];
         const desc = dom.children[1].children[1].children[0].children[0];
         datas.push(buildMediaData(href, cover, title, desc, href));
       });
       $next.toMedias(JSON.stringify(datas), key); // 搜尋頁改用 toSearchMedias
     });
   }
   ```

   - 重點是：解析 → 封裝 → 呼叫 `$next.toMedias` 或 `$next.toSearchMedias`。
   - 若網站提供 JSON，可直接解析 JSON 而非 HTML。

4. **Episodes**（分集）

   ```js
   function Episodes(detailURL) {
     $http.fetch({ url: detailURL }).then(function (res) {
       const list = tXml.getElementById(res.body, "item-url-0");
       const datas = list.children.map(function (node) {
         const href = buildURL(node.attributes.href);
         return buildEpisodeData(href, node.children[0], href);
       });
       $next.toEpisodes(JSON.stringify(datas));
     });
   }
   ```

   - 如果站內有多個播放源，可在這裡進行篩選或拆分。

5. **Player**（取得可播放 URL）
   ```js
   function Player(episodeURL) {
     $http.fetch({ url: episodeURL }).then(function (res) {
       const embedSrc = tXml.getElementsByClassName(
         res.body,
         "embed-responsive-item"
       )[0].attributes.src;
       const apiURL =
         "https://m.colafun.com/o.html?path=" + embedSrc.match(/url=(.*)/)[1];
       $http.fetch({ url: apiURL }).then(function (res) {
         const playURL = JSON.parse(res.body).url;
         $next.toPlayer(playURL);
       });
     });
   }
   ```
   - 典型流程：先解析播放頁 → 如需要再呼叫二次 API → 回傳最終串流 URL。
   - 在提交前使用 `$http.head` 檢查 URL 是否可達。

## 4. 擴充建議

- **Helper 拆分**：若格式化邏輯複雜，將其抽到 `helpers.js` 並於 `files` 陣列中註冊。
- **多分類支援**：在 `config.json.pages` 中新增多組分頁，並共用 `buildMedias` 或定義新的解析函式。
- **錯誤處理**：可在 `$http.fetch` 後加上 `.catch`，回傳 `$next.toMedias("[]", key)` 以避免 Syncnext 卡住。

## 5. 測試與驗證清單

1. `npm install`（首次）→ `node node_Test.js plugin_<provider>/app.js` 驗證函式載入是否無誤。
2. `npx browserify plugin_<provider>/app.js -o plugin_<provider>/dist.js`（若需要單檔輸出）。
3. `bash localServer.sh`，使用 `test/` 內的 fixture 進行手動測試；可為新插件加上對應的 HTML/JSON 範例。
4. 在 Syncnext App 中驗證：
   - Home/Category 分頁可翻頁。
   - 搜尋輸入文字能得到結果。
   - `Episodes` 列出完整分集。
   - `Play` 成功返回可播 URL（建議測試多部影片）。
5. 移除 `print()` 等除錯輸出，再提交 PR。

照此藍本調整 URL、CSS class、API 路徑，即可快速建立新的 `plugin_<provider>` 並保持與 `plugin_colafun` 一致的行為與介面。
