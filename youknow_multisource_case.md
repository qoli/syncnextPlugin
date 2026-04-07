# YouKnowTV 多來源對齊與後置選線案例

這份文檔總結 `plugin_youknow` 在 2026-04 的一次真實改造，用來規範未來 Syncnext 插件的多來源播放設計。

目標不是記錄「某次修了什麼」，而是把這次得到的開發規則固定下來，避免之後的新插件再次踩同一批坑。

## 問題背景

`youknow.tv` 的劇集頁存在多個播放來源：

- `线路1`
- `线路2`
- `MD`

但這些來源不是完全對齊的：

- 同一部作品的來源間，集數可能不同
- 某些來源只缺尾段集數
- 某些來源對應的最終 m3u8 會失效，而其他來源仍可播放

如果插件只輸出單一播放 URL，任何單點失效都會直接變成播放失敗。

## 最終方案

最終採用的是：

1. `Episodes()` 做「聯集對齊」
2. `Player()` 做「後置選線」
3. 由 tvOS App 的 `toPlayerCandidates` 智能選擇最佳來源

也就是：

- `Episodes()` 不直接輸出真實播放 URL
- `Episodes()` 只負責把「同一集可對應到哪些來源頁」整理好
- `Player()` 在使用者真正點擊某一集時，才去解析多個來源頁並回傳多個播放候選

這個方案適合：

- 來源之間集數不完全一致
- 劇集頁能穩定對齊「第幾集」
- 播放頁解析成本可以接受

## 為什麼不用 `toEpisodesCandidates`

這次明確沒有採用 `toEpisodesCandidates`，原因很簡單：

- `toEpisodesCandidates` 要求每組 `episodes[0].episodeDetailURL` 都已經是 App 可直接探測的真實地址
- `youknow.tv` 的劇集鏈路仍是站內 `/p/{vodId}-{sourceId}-{episodeIndex}/` 播放頁
- 這些 `/p/.../` 不是最終 m3u8，本質上仍屬於插件需要再解析的中間頁

因此這類站點若硬套 `toEpisodesCandidates`，App 端的前置可達性探測會失真，甚至直接失敗。

規則：

- 只要 `Episodes()` 輸出的地址還需要 `Player()` 再解一次，就不要用 `toEpisodesCandidates`
- 這種情況應走 `toPlayerCandidates`

## 劇集對齊規則

`youknow.tv` 的劇集 URL 形態為：

```text
/p/{vodId}-{sourceId}-{episodeIndex}/
```

這代表可以可靠提取三個鍵：

- `vodId`
- `sourceId`
- `episodeIndex`

本次最重要的決策是：

- 用 `episodeIndex` 做跨來源對齊
- 對齊策略採「聯集」，不是交集

聯集的含義：

- 只要任一來源存在某一集，這一集就應該出現在 Syncnext 的劇集列表中
- 某個來源缺少這一集，只代表該集少一條候選，不代表整集消失

例如：

- 來源 A 有 12 集
- 來源 B 有 7 集
- 來源 C 有 12 集

那最終劇集列表應為 12 集，而不是 7 集。

對齊後，每一集在插件內部都會攜帶一組來源頁：

- 第 1 集 -> A/B/C
- 第 8 集 -> A/C
- 第 12 集 -> A/C

## `Episodes()` 的責任邊界

這次改造後，`Episodes()` 的責任被固定為：

1. 解析 detail 頁中的所有來源組
2. 按 `episodeIndex` 做聯集對齊
3. 為每一集構建插件私有 payload

這個 payload 不是給 App 直接探測的，而是留給插件自己的 `Player()` 使用。

payload 內至少要包含：

- `vodId`
- `episodeIndex`
- `title`
- `candidates[]`

其中每個 `candidates[]` 項目包含：

- `source`
- `sourceId`
- `episodeURL`
- `title`

規則：

- `Episodes()` 可以輸出私有 payload
- 但這個 payload 只能用在後續仍由插件自己處理的 `Player()` 模式
- 不可以把這種 payload 直接當作 `toEpisodesCandidates` 的輸入

## `toPlayerCandidates` 的正確協議

這次另一個關鍵坑是：

- App 端真正接受的是 `StandardPlayerData[]`
- 也就是 plain array
- 不是 `{ candidates: [...] }`

正確格式：

```js
$next.toPlayerCandidates(JSON.stringify([
  { url: "https://a.m3u8", headers: {} },
  { url: "https://b.m3u8", headers: {} }
]));
```

不要寫成：

```js
$next.toPlayerCandidates(JSON.stringify({
  candidates: [...]
}));
```

Node smoke runner 也必須同步兼容 plain array，否則本地測試會和 App 實際行為脫節。

## `Player()` 的責任邊界

`Player()` 在這類站點裡應做的事是：

1. 解開 `Episodes()` 傳來的私有 payload
2. 依序請求每個來源的 `/p/.../` 播放頁
3. 從每個來源頁解析出最終播放 URL
4. 去重後構建 `StandardPlayerData[]`
5. 回傳給 `$next.toPlayerCandidates(...)`

這一層必須注意：

- 保留來源順序，不要在插件端先做武斷排序
- 若多個來源得到相同最終 URL，應去重
- 單一來源失敗，不應讓整個 `Player()` 失敗
- 所有來源都失敗時，再回空字串或錯誤提示

## JavaScriptCore 實際限制

這次在 tvOS App 內踩到的真實問題是：

- `Promise.all` 不存在

也就是說，不能把 Node / 瀏覽器裡可用的標準 Promise 靜態方法，直接當成 JavaScriptCore 必然支持。

這次的實務結論：

- 不要假設 `Promise.all`、`Promise.race`、`Promise.finally`、`Promise.resolve` 等靜態/附加能力一定存在
- 對插件關鍵鏈路，優先使用串行遞迴、顯式 callback、或最保守的 `then(...)` 鏈式寫法
- 若某段邏輯「必須在 App 內穩定運行」，不要為了表面簡潔引入高階 Promise 聚合

簡單說：

- Node 測試通過，不代表 JavaScriptCore 會通過
- 關鍵鏈路應優先保守，而不是優先炫技

## 測試行為規則

這次 session 也暴露了一個常見誤區：

- 開發者很容易不小心測到 online 舊版插件，誤以為本地改動已生效

未來應固定遵守：

1. 先確認插件來源地址
   - 本地驗證時應看到本地 HTTP URL
   - 遠端驗證時應看到 GitHub Raw URL
2. 觀察 `buildPlayURL(_:)`
   - 若仍是單一 `/p/.../`，代表還在舊版
   - 若是插件私有 payload，代表新版 `Episodes()` 已生效
3. 觀察 `JSNext`
   - 若出現「收到 X 可播放地址，正在智能分析...」，代表 `toPlayerCandidates` 已生效
4. 觀察最終選線
   - 若某來源 `502` / `403` / `404`，但 App 仍選出其他可播來源，才算真正驗證成功

## 未來插件開發規則

未來做多來源插件時，先回答以下問題，再開始寫代碼：

1. 劇集來源之間是否能可靠對齊？
2. 對齊鍵是 `episodeIndex`、標題、還是站方自己的集號？
3. `Episodes()` 輸出的是最終播放地址，還是中間頁？
4. 若是中間頁，是否應改走 `toPlayerCandidates` 而不是 `toEpisodesCandidates`？
5. App 真正接受的 callback payload 形狀是否已與協議一致？
6. Node runner 是否已同步支持同樣的 payload？
7. 這段邏輯是否依賴 JavaScriptCore 不一定支持的語法或 Promise 能力？

如果以上任何一項沒有先定清楚，後面幾乎一定會返工。

## 這次案例固化下來的準則

- 多來源但集數不一致時，優先考慮「聯集對齊 + `toPlayerCandidates` 後置選線」
- `toEpisodesCandidates` 只適合劇集列表本身已經是可直接探測的真實地址
- `toPlayerCandidates` 要回 plain array，不要回包一層 `candidates`
- Node smoke test 不是 App 真相，涉及播放選線時一定要看 tvOS/iOS 實機或模擬器日誌
- JavaScriptCore 以保守寫法為先，不要預設現代 JS 標準庫完整可用
- 驗證時先確認插件來源地址，避免把 online 舊版當成本地新版

這份文檔應被視為後續新插件與重構插件的行為準則，而不是僅供 `plugin_youknow` 使用的局部備忘錄。
