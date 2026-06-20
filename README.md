# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-20T04:44:22.865Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | Empty | OK 3/3 | 3/5 | connectivity_failed:1, search_empty:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 1/2 | Empty | Not Reached | 1/5 | search_empty:1, plugin_empty_view:3 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:3

### Plugin Details

<details>
<summary>新歐樂影院 · Partial · conn=Fail 0/3 · search=Empty · playback=OK 3/3 · reasons=connectivity_failed:1, search_empty:1</summary>

- Folder: `plugin_olevod`
- Entry: `新歐樂影院`
- Overall: `Partial`
- Cases: `3/5`
- Reasons: `connectivity_failed:1, search_empty:1`
- Note: 海外 IP 無廣告

Connectivity
- [FAIL] `GET 404` https://api.olelive.com/ | status 404
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401

Search
- Status: `Empty`
- Keyword: `真爱留声`
- URL: https://api.olelive.com/v1/pub/index/search/%E7%9C%9F%E7%88%B1%E7%95%99%E5%A3%B0/vod/0/1/4
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 真爱留声 | 立即播放 | https://europe.olemovienews.com/ts4/20260619/aid7acel/mp4/aid7acel.mp4/master.m3u8 |
| OK | 凡人修仙传 | 第01集 | https://europe.olemovienews.com/ts1/20200726/bewBHFlz/mp4/bewBHFlz.mp4/master.m3u8 |
| OK | 莫离 | 第01集 | https://europe.olemovienews.com/ts4/20260609/ngnmcv2o/mp4/ngnmcv2o.mp4/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401
- keyword:真爱留声 | stage=`search` | reason=`search_empty`
  - detailURL: https://api.olelive.com/v1/pub/index/search/%E7%9C%9F%E7%88%B1%E7%95%99%E5%A3%B0/vod/0/1/4
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/index/search/%E7%9C%9F%E7%88%B1%E7%95%99%E5%A3%B0/vod/0/1/4?_vv=3050a0a592310404aa21170be0937233

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
| OK | 上伊那牡丹，酒醉身姿似百合花般 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_f0b20Lo%2B6OffVGsKZ3rHjygP%2F8Z4lDxqqLE1Lrn%2Fyz4Ris43uso9BXaKNXC2XjI6S1Kwh%2FDbktk7QPE9POeDie2BtOQD3nNBCKXEMhV2vBCDF7BySu5PKkgH |
| OK | 冻结地球 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_d411YquOzvDGcxTluoB3HSg4ivDxZb790mlKJcABSgd4pksA5g9ck7CxT%2Fp4Ho4kmQ49dmXFSHzDPfPoATM18PmOCHbRTcOYgKgm36tB9hkFvn7KV7KYGQZB |
| OK | 神之水滴 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_af8awC24QLT7zfHpi9MrC1OHKJdb8o7AESsH962iGxJM%2F76L5OPtY3rgj%2FRs9IGY7akW4Gk2pErHrTHuQYQeGBopGErzt%2FiorBlG6PRYohSV0YtojmHVwOHQ |

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
<summary>libvio · Partial · conn=OK 1/2 · search=Empty · playback=Not Reached · reasons=search_empty:1, plugin_empty_view:3</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `1/5`
- Reasons: `search_empty:1, plugin_empty_view:3`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [FAIL] `GET 520` https://www.libvio.cam/search/-------------.html?wd=test | status 520

Search
- Status: `Empty`
- Keyword: `豆豆农场`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E8%B1%86%E8%B1%86%E5%86%9C%E5%9C%BA
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- keyword:豆豆农场 | stage=`search` | reason=`search_empty`
  - detailURL: https://www.libvio.cam/search/-------------.html?wd=%E8%B1%86%E8%B1%86%E5%86%9C%E5%9C%BA
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=%E8%B1%86%E8%B1%86%E5%86%9C%E5%9C%BA
- 豆豆农场 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813146.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/detail/5813146.html
- 孤独的美食家第十一季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812896.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/detail/5812896.html
- 田锁兄弟 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812921.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/detail/5812921.html

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
- Keyword: `人夫总动员`
- URL: https://www.thanju.com/search/%E4%BA%BA%E5%A4%AB%E6%80%BB%E5%8A%A8%E5%91%98.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 人夫总动员 | HD | https://cdn.yzzyvip-29.com/20260619/24972_2145031a/index.m3u8 |
| OK | 我们愉快的好日子 | 01 | https://player.yzzyvip-35.com/20260331/3348_333cb763/index.m3u8 |
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |

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
- Keyword: `白夜暗影`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%99%BD%E5%A4%9C%E6%9A%97%E5%BD%B1&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 白夜暗影 | 第1集 | https://vid.dbokutv.com/20260620/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtXsRsGlQ79nBM9vONajC34jC354HJWuCp4vBcrmD0/chunklist.m3u8 |
| OK | 似火年华 | 第1集 | https://vid.dbokutv.com/20260615/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBt5sRsGlQ79nBNDeRcWjC34jC34uDJ54HJD6BcrmD0/chunklist.m3u8 |
| OK | 妻本善良 | 第1集 | https://vid.dbokutv.com/20260618/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHcTcyo5xGvE9QuiJcs5fWObfWP6QCY8HoOcfSsk1K/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
