# 廠長資源維護筆記

## 域名來源

- 維護域名時先查看導航頁：`https://cz01.vip`
- 2026-05-19 讀取導航頁時，頁面標題為「厂长资源官网」。
- 導航頁說明 `cz01.vip` 是導航頁地址，`cz01.tv` 是易記域名。
- 導航頁推薦訪問入口為：
  - `https://czzyv.com`
  - `https://www.cz4k.com`
- 導航頁同時提示舊域名已失效；不要再把已確認失效的舊域名放回 `hosts`。

## 當前策略

- `config.json.host` 保持為目前已驗證可啟動的入口。
- `config.json.hosts` 保留站方推薦且可作為影片站入口的候選域名：
  - `https://www.czzymovie.com`
  - `https://czzyv.com`
  - `https://www.cz4k.com`
- `cz01.vip` 和 `cz01.tv` 用作查詢發布資訊的導航入口，不作為影片列表入口。

## 維護檢查

- 更新 hosts 前，先重新讀取 `https://cz01.vip`，確認推薦入口是否改變。
- 若導航頁不可直接讀取，可以使用 ARC CDP 端點檢查實際渲染內容。
- 更新後至少驗證 `config.json` JSON 格式、`app.js` 語法，以及廠長定向 list/search/player smoke。
