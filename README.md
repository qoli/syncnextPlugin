# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-28T04:48:25.323Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Fatal | Fail 0/2 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: fatal_error:1

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
- Keyword: `千香`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%8D%83%E9%A6%99/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 千香 | 第01集 | https://europe.olemovienews.com/ts4/20260627/iy548ymf/mp4/iy548ymf.mp4/master.m3u8 |
| OK | 杀戮屋 | 立即播放 | https://europe.olemovienews.com/ts4/20260627/t4yrfze5/mp4/t4yrfze5.mp4/master.m3u8 |
| OK | 主播女孩重度依赖 | 第01集 | https://europe.olemovienews.com/ts4/20260404/ys9t1ja6/mp4/ys9t1ja6.mp4/master.m3u8 |

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
<summary>新 AGE 動漫 · OK · conn=OK 2/3 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_age`
- Entry: `新 AGE`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: AGE 動漫

Connectivity
- [FAIL] `GET 403` https://ageapi.omwjhz.com:18888 | status 403
- [OK] `HEAD 200` https://ageapi.omwjhz.com:18888/v2/catalog?genre=all&label=all&letter=all&order=time&region=all&resource=all&season=all&status=all&year=all&page=1&size=32
- [OK] `HEAD 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=test

Search
- Status: `OK`
- Keyword: `勇者之屑`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8B%87%E8%80%85%E4%B9%8B%E5%B1%91

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 勇者之屑 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_9d62b1HXDidX0C0vqeiQy3pP%2BGqd%2FfsFumoSwgwdIoEFTVQ4n4VOwGKIEA2ngOc1MZ0owgEKHHIQTlYDV6YAMCEDMeQOPUjb6sxX%2BiHnsiGmPsTmvuivvJA4 |
| OK | 主播女孩重度依赖 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_4b3eQDzF8J2R8ePg%2FXNAj%2FQQktJJnw4H1f9QrDJ3WEpRo%2BP3HAbZEZr398aMy2s6btLQzSXMmbMTNW0Kj3ut049p9vUg2TaqfOqT29%2B%2F6rx4s%2B%2BYwZot6E3m |
| OK | 春夏秋冬代行者 春之舞 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_a9b9oAD4L1bMO0EViVkWzQXDEgl34Pk8tPoGULUkLRafptS%2FooOqouYb2alfIn75Yf4GQdZb3t7xczUOXwhM9R9CcJMx8c%2FW800x5ulCFMu5j9wC576mXGn2 |

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
<summary>libvio · Fatal · conn=Fail 0/2 · search=Empty · playback=Not Reached · reasons=connectivity_failed:1, search_empty:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Fatal`
- Cases: `0/2`
- Reasons: `connectivity_failed:1, search_empty:1`
- Note: libvio
- Fatal Errors:
  - `no medias returned; no medias returned`

Connectivity
- [FAIL] `GET 520` https://www.libvio.cam/ | status 520
- [FAIL] `GET 520` https://www.libvio.cam/search/-------------.html?wd=test | status 520

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.libvio.cam/search/-------------.html?wd=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.libvio.cam/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/ | status 520
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=test | status 520
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.libvio.cam/search/-------------.html?wd=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=test

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
| OK | 新进职员姜会长 | 01 | https://cdn.vvvip-plays33.cc/20260531/14095_1f3f1ae7/index.m3u8 |
| OK | 金特务：本色回归 | 01 | https://player.yzzyvip-35.com/20260626/9642_137ffea9/index.m3u8 |

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
- Keyword: `千香`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%8D%83%E9%A6%99&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 千香 | 第1集 | https://vid.dbokutv.com/20260627/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBN5uBJ0nBJ0pCJKqHJCqH2vjS34/chunklist.m3u8 |
| OK | 炽夏 | 第1集 | https://vid.dbokutv.com/20260616/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBMDuBJ0nBJ0nE3GmDJb3HIvjS34/chunklist.m3u8 |
| OK | 昨夜将至 | 第1集 | https://vid.dbokutv.com/20260625/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsjsRsGlR7XgBNfvQdejC34jC34mE4KnCpCqBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
