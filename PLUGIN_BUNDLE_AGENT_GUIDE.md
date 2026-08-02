# PluginBundle Hash 遷移與發佈指南（Agent 版）

本指南面向 Codex、Claude Code、Copilot Agent 及其他會直接修改插件倉庫的執行 Agent。目標是把既有 Syncnext 插件更新到 PluginBundle Hash 契約，並確保 `config` 宣告的內容與公開 URL 實際提供的 JavaScript bytes 一致。

本文是遷移與執行清單。插件欄位與 runtime 語意以 [doc.md](./doc.md) 為準；官方插件的測試與對外發佈順序分別以 [TESTING.md](./TESTING.md) 和 [MAINTENANCE.md](./MAINTENANCE.md) 為準。目標倉庫有 `AGENTS.md` 或其他本地指令時，先讀取並遵守較近的規則。

## 1. 必須理解的契約

`config.json.files`（或第三方倉庫中的等效插件 JSON）仍是唯一的腳本清單與載入順序。PluginBundle 只增加一個 advisory cache manifest：

```json
{
  "files": ["txml.js", "app.js"],
  "cache": {
    "schema": 1,
    "resources": {
      "txml.js": {
        "sha256": "<64 位小寫十六進制 SHA-256>",
        "bytes": 12345
      },
      "app.js": {
        "sha256": "<64 位小寫十六進制 SHA-256>",
        "bytes": 67890
      }
    }
  }
}
```

以下條件必須同時成立：

1. `cache.schema` 必須是整數 `1`。
2. `cache.resources` 的 key 集合必須與 `files` 的值完全相同，不可缺少、增加或改名。
3. 每個 `sha256` 必須是 64 個小寫十六進制字元。
4. `bytes` 必須是該 JavaScript 公開回應轉成 UTF-8 後的實際 byte 數。
5. Hash 與 byte 數必須對應同一份公開內容，而不是編輯器畫面、格式化前內容或另一個 branch 的內容。

這不是安全完整性 gate。App 的行為是：

- manifest 缺失、格式錯誤、不完整或 schema 不支援：本次從網絡載入全部 `files`。
- 本地已有符合 Hash 的物件：直接使用磁碟內容，不做 JavaScript freshness request。
- 網絡內容與宣告不符：本次仍可使用該網絡內容，但不得以錯誤 Hash 寫入快取。
- 網絡失敗：插件載入失敗；不允許退回舊腳本。
- 發佈者修改 JavaScript 卻沒有更新 Hash：App 離線時可能繼續使用舊內容。這是違反發佈約定的可接受後果，不是 App 應補救的情況。

不要加入 TTL probe、背景 freshness request、舊檔 fallback 或隱藏 retry。

## 2. 遷移前先界定真實發佈面

不要假設所有倉庫都使用 `plugin_<provider>/config.json`。常見形態包括：

```text
plugin_bdys/config.json
plugin_bdys/app.js
```

以及：

```text
alpha_v2/bdys.json
alpha_v2/bdys.js
alpha_v2/txml.js
```

對每個要遷移的插件：

1. 找到 App 或訂閱表真正引用的公開 config URL。
2. 讀取該 config 的 `files`，保持原有順序。
3. 以 config URL 為基準解析每個相對資源 URL，確認它們正是 App 會下載的內容。
4. 確認發佈者能同步更新 config 與全部資源。
5. 若 `files` 包含無法控制、會自行變動的外部絕對 URL，先不要發布 `cache`。部分 manifest 會令整個 manifest 無效，不能只為可控檔案建立 Hash。

開始修改前執行 `git status --short`，保存並避開其他人或其他 Agent 的未提交內容。不要把不同插件、不同倉庫或無關修改混入同一個 commit。

## 3. 建立或移植 Hash 工具

官方倉庫的 reference implementation 是 [tools/update-plugin-cache.js](./tools/update-plugin-cache.js)：

```bash
node tools/update-plugin-cache.js plugin_<provider>
node tools/update-plugin-cache.js --check plugin_<provider>
```

第三方倉庫可以複製並調整這個工具，但必須先適配自己的 config 位置與資源解析方式。例如 `alpha_v2/bdys.json` 不符合官方工具的 `plugin_*/config.json` 探索規則，不能未經修改直接執行。

移植後的生成器至少必須：

1. 從 config 的 `files` 讀取資源，不維護第二份檔案清單。
2. 拒絕空陣列、重複項目、越出插件目錄的相對路徑及非普通檔案。
3. 以 binary bytes 計算 SHA-256 和長度，不以字元數代替 byte 數。
4. 一次重建完整 `cache.resources`，不手工局部修改 Hash。
5. 提供不寫檔的 `--check` 模式，讓 CI 能檢查 missing 或 stale manifest。
6. 比較 Git clean filter 前後的內容；若 Git 會在提交時改變 bytes，輸出清楚警告。
7. 保持 config 其餘欄位與 `files` 順序不變。

Git clean-filter gate 可使用以下兩個結果判斷：

```bash
git hash-object --no-filters path/to/resource.js
git hash-object --path=path/to/resource.js path/to/resource.js
```

兩個 object ID 不同，代表 `.gitattributes`、換行正規化或其他 clean filter 會改變公開 bytes。不要忽略警告。先把檔案統一為 LF，或為該資源加入明確規則，例如：

```gitattributes
alpha_v2/*.js text eol=lf
```

然後重新生成 manifest。不要用手工覆寫 Hash 掩蓋問題，也不要在未評估既有 binary／vendor 檔案前對整個倉庫盲目執行 `git add --renormalize .`。

## 4. 標準遷移順序

每個插件按以下順序處理：

1. 讀取 config 與所有 `files`。
2. 完成 JavaScript 修改；若只是遷移 cache，不改變插件邏輯。
3. 明確設定會影響 Hash 的換行規則。
4. 執行生成器，建立完整 `cache`。
5. 執行生成器的 `--check`；結果必須沒有 error，也沒有 Git clean-filter warning。
6. 執行 JavaScript 語法檢查和 JSON parse。
7. 比對 staged diff，確認 JavaScript、config 與 `.gitattributes` 的範圍符合本次任務。
8. 將 JavaScript 變更與更新後的 manifest 放在同一個 commit。
9. 取得發佈／push 權限後推送。
10. 驗證公開 config 與公開 JavaScript，而不是只驗證本地 checkout。
11. 在 App 進行一次冷載入和一次暖載入，核對 disposition。

官方插件的最低本機驗證為：

```bash
node --check plugin_<provider>/app.js
python3 -m json.tool plugin_<provider>/config.json >/dev/null
node tools/update-plugin-cache.js --check plugin_<provider>
git diff --check
```

第三方倉庫應把路徑替換成真實 config 與入口檔，並使用倉庫自己的 fixture／smoke runner。綠色語法檢查不代表公開內容、網站流程或 App runtime 已通過。

## 5. 公開 URL 驗證

push 後必須重新下載公開內容。至少確認：

1. 公開 config 已包含預期 `cache`。
2. `resources` keys 與公開 config 的 `files` 集合完全一致。
3. 每個公開 JavaScript 的 SHA-256 與 byte 數都符合 manifest。
4. config 與 JavaScript 來自同一個已發布版本。

單一資源可用以下方式抽查：

```bash
curl --fail --silent --show-error \
  "https://raw.githubusercontent.com/<owner>/<repo>/main/<path>/app.js" \
  --output /tmp/plugin-app.js
wc -c /tmp/plugin-app.js
shasum -a 256 /tmp/plugin-app.js
```

把結果與公開 config 比對。臨時檔只用於驗證，不要加入倉庫。

若 App 啟用了 GitHub 鏡像，還要驗證 App 實際請求的鏡像 URL。`@main` CDN 可能仍提供舊 config；這時測試只會得到 `network-bypass`，不能證明 cache 失效。可用不可變 commit URL 區分「發布內容正確」與「branch CDN 尚未更新」，但正式入口最終仍必須提供同步的 config 與資源。

## 6. App 驗收與日誌判讀

使用正常 App UI 對同一個插件連續載入兩次。當前 Plugin automation request 會刻意停用 PluginBundle cache，因此自動化載入出現 network path 不能作為 cache 驗收結果。需要真正冷載入時，使用沒有該 Hash 本地物件的測試環境或全新的資源 Hash；清理 Simulator／App 資料前仍要遵守目標專案的操作授權。

| disposition | 意義 | Agent 處置 |
| --- | --- | --- |
| `network-stored` | 冷載入下載成功，內容符合 manifest 並寫入磁碟 | 首次載入的預期結果 |
| `disk-hit` | 本地物件符合 Hash，沒有請求該 JavaScript | 暖載入的預期結果 |
| `network-bypass` | 沒有可用的完整 manifest | 檢查公開 config、schema、keys 與鏡像版本 |
| `network-hash-mismatch` | 公開 JavaScript bytes 與宣告不同 | 比對遠端 byte 數、SHA-256、branch／CDN 與換行 |
| `network-write-failed` | 內容正確，但本地檔案寫入失敗 | 檢查 App container／Caches 寫入環境 |

完整遷移的最低 runtime 證據是：冷載入時每個 `files` 項目均為 `network-stored`，第二次載入時均為 `disk-hit`。config 本身仍可有網絡請求；PluginBundle cache 的目標是消除暖載入的 JavaScript 請求。

## 7. 更新插件時的持續規則

遷移完成後，每次修改 `files` 中任何檔案，或修改 `files` 清單，都必須：

1. 在 JavaScript 完成後重新生成 `cache`。
2. 執行 `--check` 並處理全部 warning。
3. 把資源與 manifest 放在同一個 commit。
4. push 後驗證公開 bytes。

只修改 `config` 中與 JavaScript 內容無關的欄位時，可以不改 Hash；但仍應執行 `--check`，證明 manifest 沒有被其他變更弄舊。

## 8. Agent 完成交接格式

完成後向人類報告：

- 遷移的倉庫、插件與公開 config URL。
- `files` 數量及 manifest resource 數量。
- Hash 工具 update／check 結果，以及 warning 是否為零。
- JavaScript、JSON、fixture／smoke 的驗證面。
- 公開 URL Hash 驗證結果。
- App 冷載入與暖載入 disposition；未執行時明確寫「未驗證」。
- commit、push 狀態及任何 CDN 傳播限制。

不要把「本地工具通過」、「已 push」或「App 可打開頁面」互相當作替代證據。
