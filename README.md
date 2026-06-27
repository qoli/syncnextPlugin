# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-27T04:37:50.027Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | OK 1/1 | 3/5 | plugin_empty_view:2 |
| 韩剧网 | plugin_thanju | Fatal | OK 1/3 | Empty | Not Reached | 1/2 | search_empty:1 |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `4`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:2
- `plugin_thanju` 韩剧网: fatal_error:1

### Plugin Details

<details>
<summary>新歐樂影院 · Partial · conn=Fail 0/3 · search=OK · playback=OK 3/3 · reasons=connectivity_failed:1</summary>

- Folder: `plugin_olevod`
- Entry: `新歐樂影院`
- Overall: `Partial`
- Cases: `4/5`
- Reasons: `connectivity_failed:1`
- Note: 海外 IP 無廣告

Connectivity
- [FAIL] `GET 404` https://api.olelive.com/ | status 404
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401

Search
- Status: `OK`
- Keyword: `184漠北嫁衣`
- URL: https://api.olelive.com/v1/pub/index/search/184%E6%BC%A0%E5%8C%97%E5%AB%81%E8%A1%A3/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 184漠北嫁衣 | 第1集 | https://europe.olemovienews.com/ts4/20260627/IIcrBqEc/mp4/IIcrBqEc.mp4/clipTo/101266/master.m3u8 |
| OK | 183簪月谋 | 第1集 | https://europe.olemovienews.com/ts4/20260627/icdyjcre/mp4/icdyjcre.mp4/clipTo/158933/master.m3u8 |
| OK | 180皇后她总打直球 | 第1集 | https://europe.olemovienews.com/ts4/20260627/jwhguEbv/mp4/jwhguEbv.mp4/clipTo/252800/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401

</details>

<details>
<summary>新 AGE 動漫 · Partial · conn=OK 2/3 · search=Empty · playback=OK 3/3 · reasons=search_empty:1</summary>

- Folder: `plugin_age`
- Entry: `新 AGE`
- Overall: `Partial`
- Cases: `4/5`
- Reasons: `search_empty:1`
- Note: AGE 動漫

Connectivity
- [FAIL] `GET 403` https://ageapi.omwjhz.com:18888 | status 403
- [OK] `HEAD 200` https://ageapi.omwjhz.com:18888/v2/catalog?genre=all&label=all&letter=all&order=time&region=all&resource=all&season=all&status=all&year=all&page=1&size=32
- [OK] `HEAD 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=test

Search
- Status: `Empty`
- Keyword: `上伊那牡丹，酒醉身姿似百`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%8A%E4%BC%8A%E9%82%A3%E7%89%A1%E4%B8%B9%EF%BC%8C%E9%85%92%E9%86%89%E8%BA%AB%E5%A7%BF%E4%BC%BC%E7%99%BE
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 上伊那牡丹，酒醉身姿似百合花般 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_e015TcYj7IySxpajTp2FpsanjXbJe%2BGrYcpKuf0T1ilb%2BUYmLUt%2FuS7LAvtgZPv%2Fw5tFTLMh7Il0TTGa%2FZTJKxpeBCocQqJD4%2BW%2FeOSXuuepSwyx63lNG8%2B4 |
| OK | 冻结地球 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_b3c4j6mNKo1M5OAzOdMYVVdImfU1nM2UDIcvmFTzm7FPOYUvFkdveXuUxseSE0BQBJMPzaimaP0IcCI4BRoIiEmwmZQJ2TmBs8lOXQTUAzZIcMkehzkU8VL6 |
| OK | 神之水滴 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_632aKfjDTbR8nqJFExjgtkwoi08T31Wcu1YrupuFqWSZULCkFaqKF5s7ZjRa%2BlTgG98UHpobBgYf9k%2ByL2XGgKrbIzU%2BRyXehsGXyrlbCVZ4sZZq9bebnyY0 |

Failed Case Diagnostics
- keyword:上伊那牡丹，酒醉身姿似百 | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%8A%E4%BC%8A%E9%82%A3%E7%89%A1%E4%B8%B9%EF%BC%8C%E9%85%92%E9%86%89%E8%BA%AB%E5%A7%BF%E4%BC%BC%E7%99%BE
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%8A%E4%BC%8A%E9%82%A3%E7%89%A1%E4%B8%B9%EF%BC%8C%E9%85%92%E9%86%89%E8%BA%AB%E5%A7%BF%E4%BC%BC%E7%99%BE

</details>

<details>
<summary>廠長資源 · Fatal · conn=Fail 0/3 · search=Empty · playback=Not Reached · reasons=connectivity_failed:1, search_empty:1</summary>

- Folder: `plugin_czzy`
- Entry: `新廠長`
- Overall: `Fatal`
- Cases: `0/2`
- Reasons: `connectivity_failed:1, search_empty:1`
- Note: 要求大陸 IP
- Fatal Errors:
  - `no medias returned; 偵測到 SafeLine 挑戰頁，導致播放器頁未返回原始 HTML`

Connectivity
- [FAIL] `GET 403` https://www.czzymovie.com | status 403
- [FAIL] `GET 403` https://www.czzymovie.com/movie_bt/page/1 | status 403
- [FAIL] `GET 403` https://www.czzymovie.com/boss1O1?q=test | status 403

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.czzymovie.com/boss1O1?q=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.czzymovie.com
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 403` https://www.czzymovie.com | status 403
  - `GET 403` https://www.czzymovie.com/movie_bt/page/1 | status 403
  - `GET 403` https://www.czzymovie.com/boss1O1?q=test | status 403
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.czzymovie.com/boss1O1?q=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 403` https://www.czzymovie.com/boss1O1?q=test | safeline

</details>

<details>
<summary>YouKnowTV · Fatal · conn=Fail 0/3 · search=Empty · playback=Not Reached · reasons=connectivity_failed:1, search_empty:1</summary>

- Folder: `plugin_youknow`
- Entry: `YouKnowTV`
- Overall: `Fatal`
- Cases: `0/2`
- Reasons: `connectivity_failed:1, search_empty:1`
- Note: 领略更广阔的视界，尽享海量高清视频
- Fatal Errors:
  - `no medias returned; no medias returned`

Connectivity
- [FAIL] `GET 403` https://www.youknow.tv | status 403
- [FAIL] `GET 403` https://www.youknow.tv/label/new/ | status 403
- [FAIL] `GET 403` https://www.youknow.tv/search/-------------.html?wd=test | status 403

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.youknow.tv/search/-------------.html?wd=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.youknow.tv
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 403` https://www.youknow.tv | status 403
  - `GET 403` https://www.youknow.tv/label/new/ | status 403
  - `GET 403` https://www.youknow.tv/search/-------------.html?wd=test | status 403
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.youknow.tv/search/-------------.html?wd=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 403` https://www.youknow.tv/search/-------------.html?wd=test

</details>

<details>
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=OK 1/1 · reasons=plugin_empty_view:2</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `3/5`
- Reasons: `plugin_empty_view:2`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `绘梦婚礼`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E7%BB%98%E6%A2%A6%E5%A9%9A%E7%A4%BC

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 大叔再出招 | HD7播放 第01集 | https://lf9-csp-sign.bytetos.com/tos-cn-v-5f73e7/osCb6fH6DAoqFJXaqiEEQMIeEBDIGaFg7q1RnH?x-expires=1782535428&x-signature=O58vS7Lyz2gqHypnEts41S5swYU%3D&filename=BBA.mp4 |

Failed Case Diagnostics
- 绘梦婚礼 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813145.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813145.html
- 金特务：本色回归 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813184.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813184.html

</details>

<details>
<summary>韩剧网 · Fatal · conn=OK 1/3 · search=Empty · playback=Not Reached · reasons=search_empty:1</summary>

- Folder: `plugin_thanju`
- Entry: `韩剧网`
- Overall: `Fatal`
- Cases: `1/2`
- Reasons: `search_empty:1`
- Note: 需要海外 IP
- Fatal Errors:
  - `no medias returned; no medias returned`

Connectivity
- [OK] `HEAD 200` https://www.thanju.com
- [FAIL] `GET 523` https://www.thanju.com/list-select-id-1-type--area--year--star--state--order-addtime-p-1.html | status 523
- [FAIL] `GET 523` https://www.thanju.com/search/test.html | status 523

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.thanju.com/search/test.html
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.thanju.com/search/test.html
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 523` https://www.thanju.com/search/test.html

</details>

<details>
<summary>独播库 · OK · conn=OK 3/3 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_dbku`
- Entry: `独播库`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: dbku.tv 线上看

Connectivity
- [OK] `HEAD 200` https://www.dbku.tv
- [OK] `HEAD 200` https://www.dbku.tv/vodtype/2--------1---.html
- [OK] `HEAD 200` https://www.dbku.tv/vodsearch/-------------.html?wd=test&submit=

Search
- Status: `OK`
- Keyword: `长安女子鉴`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%95%BF%E5%AE%89%E5%A5%B3%E5%AD%90%E9%89%B4&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 长安女子鉴 | 第1集 | https://vid.dbokutv.com/20260625/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xGvE9QniBSycejC34jC3CrC4OmDZWqBcrmD0/chunklist.m3u8 |
| OK | 艾米丽与玛丽亚 | 第1集 | https://vid.dbokutv.com/20260622/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHbTcyo5xOy6ejOMriUMriUIqmCIqmCZOtDa8nDp0kRN0q/chunklist.m3u8 |
| OK | 我们愉快的好日子 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTjUMjaQ79wBJ0nBJ0mGaGoCpKpHYvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
