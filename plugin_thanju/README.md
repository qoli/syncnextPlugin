# plugin_thanju

初版插件骨架（基於 `plugin_blueprint` 建立）。

## 目前內容

- `config.json`：已配置韓劇網 `id=1/2/3` 三個分類頁面。
- `app.js`：包含 `buildMedias` / `buildSearchMedias` / `Episodes` / `Player` 初步解析流程。
- `txml.js`：沿用 blueprint 解析庫。

## 待完善

- 列表頁描述文案與封面提取細節可再微調。
- `Episodes`/`Player` 需依更多樣本頁做兼容性補強。
- 可再補充分頁、排序、地區/年份等進階分類入口。
