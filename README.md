# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-05T06:49:39.396Z`
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
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:2

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
- Keyword: `牧神记`
- URL: https://api.olelive.com/v1/pub/index/search/%E7%89%A7%E7%A5%9E%E8%AE%B0/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 牧神记 | 第01集 | https://europe.olemovienews.com/ts3/20241027/GIopvtlE/mp4/GIopvtlE.mp4/master.m3u8 |
| OK | 成长秀～向日葵马戏团～ | 第01集 | https://europe.olemovienews.com/ts4/20260705/hoq742uf/mp4/hoq742uf.mp4/master.m3u8 |
| OK | 摩绪 MAO | 第01集 | https://europe.olemovienews.com/ts4/20260406/td0pskuq/mp4/td0pskuq.mp4/master.m3u8 |

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
- Keyword: `名侦探光之美少女！`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%90%8D%E4%BE%A6%E6%8E%A2%E5%85%89%E4%B9%8B%E7%BE%8E%E5%B0%91%E5%A5%B3%EF%BC%81
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 名侦探光之美少女！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_4821qapMr45KILUF8EPTeUqa9xWFMUKFXUxvBcln%2FAxd%2Bo0%2FkuwKGZJKbsOfcYDdiZ%2Fw%2B2Sn7w8JudcU3DIL%2BffKQQyMQQP0CfxfzyfQfx1EeIKvdJBjOiMM |
| OK | 才女的侍从 在满是高岭之花的贵族学校暗中照顾（毫无生活自理能力的）学院第一大小姐 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_5b39uvct7qoXZrNCEqJQy1sHeOU6Wwp3QVUIJ7RHuAbH1UPROlWku2nyuZSei797mUKfvQhGIeeVraMhaWRqGbSxyPunoTxCXc5PTReZk%2BDDrlkgaWywwXjK |
| OK | 鬼之花嫁 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_91463QAE%2BdIwOAwogoP%2BZXgRvnF96We6Mct4YqtSua7iycl89zpfGGOXLmPOybYATuwggHz6bSJSIYUkUNAhCiDeJvcqaAhvXx5Sm1FYKjnsUiSvd9zQhBoD |

Failed Case Diagnostics
- keyword:名侦探光之美少女！ | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%90%8D%E4%BE%A6%E6%8E%A2%E5%85%89%E4%B9%8B%E7%BE%8E%E5%B0%91%E5%A5%B3%EF%BC%81
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%90%8D%E4%BE%A6%E6%8E%A2%E5%85%89%E4%B9%8B%E7%BE%8E%E5%B0%91%E5%A5%B3%EF%BC%81

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
- Keyword: `晚酌的流派5：夏篇`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%99%9A%E9%85%8C%E7%9A%84%E6%B5%81%E6%B4%BE5%EF%BC%9A%E5%A4%8F%E7%AF%87

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 新进职员姜会长 | HD7播放 第01集 | https://lf9-csp-sign.bytetos.com/tos-cn-v-5f73e7/oIIUQBaHbhWMuVMaLBETqBiluPQtEKRyWigQ2?x-expires=1783234249&x-signature=MmiLMFSHXgFJHwCD8SJsoQPtgvY%3D&filename=BBA.mp4 |

Failed Case Diagnostics
- 晚酌的流派5：夏篇 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813349.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813349.html
- 黄泉的使者 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812956.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812956.html

</details>

<details>
<summary>韩剧网 · OK · conn=OK 3/3 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_thanju`
- Entry: `韩剧网`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: 需要海外 IP

Connectivity
- [OK] `HEAD 200` https://www.thanju.com
- [OK] `HEAD 200` https://www.thanju.com/list-select-id-1-type--area--year--star--state--order-addtime-p-1.html
- [OK] `HEAD 200` https://www.thanju.com/search/test.html

Search
- Status: `OK`
- Keyword: `给你爱情处方`
- URL: https://www.thanju.com/search/%E7%BB%99%E4%BD%A0%E7%88%B1%E6%83%85%E5%A4%84%E6%96%B9.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 给你爱情处方 | 01 | https://cdn.yzzyvip-29.com/20260201/16425_49d7d186/index.m3u8 |
| OK | 婚姻之后 | 01 | https://cdn.yzzyvip-29.com/20260704/25457_2ff71cb9/index.m3u8 |
| OK | 共感细胞 | 01 | https://cdn.yzzy28-play.com/20260704/32161_f76864d0/index.m3u8 |

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
- Keyword: `逆时追捕`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%80%86%E6%97%B6%E8%BF%BD%E6%8D%95&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 逆时追捕 | 第1集 | https://vid.dbokutv.com/20260704/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlQ79nBMvpUc8jC34jC38oH4CtC4P1BcrmD0/chunklist.m3u8 |
| OK | 悬案 | 第1集 | https://vid.dbokutv.com/20260703/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejU64jC34jC30tGK8vDpWuBcrmD0/chunklist.m3u8 |
| OK | 千香 | 第1集 | https://vid.dbokutv.com/20260627/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBN5uBJ0nBJ0pCJKqHJCqH2vjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
