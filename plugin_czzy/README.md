# 廠長資源維護筆記

## 域名來源

- 維護域名時先查看導航頁：`https://cz01.vip`
- 2026-08-02 讀取導航頁時，頁面標題為「厂长资源官网」。
- 導航頁說明 `cz01.vip` 是導航頁地址，`cz01.tv` 是易記域名。
- 導航頁推薦訪問入口為：
  - `https://www.4kcz.com`
  - `https://czzy.top`
  - `https://www.cz4k.com`
- 導航頁同時提示舊域名已失效；不要再把已確認失效的舊域名放回 `hosts`。

## 當前策略

- `config.json.host` 使用 `https://www.4kcz.com`。2026-08-16 重新驗證時，無既有 Cookie 的獨立 Chrome context 與 macOS `URLSession` 均可直接取得真實 `/movie_bt` 列表，因此恢復為 primary。
- `czzy.top` 與 `www.cz4k.com` 保留為站方公布的候選入口；SafeLine 是 App 已支援的正常前置層，不應把未解題的 challenge 頁誤判為 Host 有效內容。
- `config.json.hosts` 保留站方推薦且可作為影片站入口的候選域名：
  - `https://www.4kcz.com`
  - `https://czzy.top`
  - `https://www.cz4k.com`
- `cz01.vip` 和 `cz01.tv` 用作查詢發布資訊的導航入口，不作為影片列表入口。

## 維護檢查

- 更新 hosts 前，先重新讀取 `https://cz01.vip`，確認推薦入口是否改變。
- 若導航頁不可直接讀取，可以使用 ARC CDP 端點檢查實際渲染內容。
- 2026-08-30 實際頁面搜索表單已改為 `GET /nimasile?q=...`；舊的 `/boss1O1` 會被 SafeLine 當作攻擊請求直接阻擋，不能再用作搜索入口。
- 更新後至少驗證 `config.json` JSON 格式、`app.js` 語法，以及廠長定向 list/search/player smoke。
