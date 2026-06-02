# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-02T04:55:21.936Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Not Reached | 2/5 | plugin_empty_view:3 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:3

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
- Keyword: `激荡年代1980`
- URL: https://api.olelive.com/v1/pub/index/search/%E6%BF%80%E8%8D%A1%E5%B9%B4%E4%BB%A31980/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 激荡年代1980 | 第1集 | https://europe.olemovienews.com/ts4/20260602/dnJzjeAk/mp4/dnJzjeAk.mp4/clipTo/154720/master.m3u8 |
| OK | 花钱只是工作，咋都被钓成翘嘴 | 第1集 | https://europe.olemovienews.com/ts4/20260602/hjuBjcvk/mp4/hjuBjcvk.mp4/clipTo/197280/master.m3u8 |
| OK | 麦熟见人心 | 第1集 | https://europe.olemovienews.com/ts4/20260602/bcGIyDoq/mp4/bcGIyDoq.mp4/clipTo/147666/master.m3u8 |

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
- Keyword: `日本三国`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%97%A5%E6%9C%AC%E4%B8%89%E5%9B%BD

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 日本三国 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6c2fXF0eUvRfmO6wow8O7uIyhPlQW0IX7EewpVu9BBU00kiRGHtAi4MZAYWjNc%2Bv0se7J%2BDphG%2FBX%2B6%2FODaN8UIY70HfuxNsXEHu%2FuSDiRH71CusbpfpWvL0 |
| OK | 尖帽子的魔法工坊 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_d20bkB0lWkz9O1EqVnbWNzJoZZPWY1VPvRPjcOmw6TMSxz3xq6W9nxViunTktLsl3i1rfV9rHrHkfNTT5YHfAIoRYzs0Nc1dtaQQvv681%2FFslgez0EpS4oCQ |
| OK | 木头风纪委员和迷你裙JK的故事 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_866dYFeRJGBgovfebap4LFbIh0XfcZerm3bi3kNJy9x%2BLc4zVZ%2FeaDCcW9ZID0DFamxuRUWU%2B6ET3ybNt8UlJU7NnF1ynfqw8cfdYHHf5P%2Be1o65hQORjE8s |

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
  - `no medias returned; no medias returned`

Connectivity
- [FAIL] `GET 0` https://www.czzymovie.com | The operation was aborted.
- [FAIL] `GET 0` https://www.czzymovie.com/movie_bt/page/1 | The operation was aborted.
- [FAIL] `GET 0` https://www.czzymovie.com/boss1O1?q=test | The operation was aborted.

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
  - `GET 0` https://www.czzymovie.com | The operation was aborted.
  - `GET 0` https://www.czzymovie.com/movie_bt/page/1 | The operation was aborted.
  - `GET 0` https://www.czzymovie.com/boss1O1?q=test | The operation was aborted.
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.czzymovie.com/boss1O1?q=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 0` https://www.czzymovie.com/boss1O1?q=test | The operation was aborted.

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Not Reached · reasons=plugin_empty_view:3</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `plugin_empty_view:3`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `银河的一票`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E9%93%B6%E6%B2%B3%E7%9A%84%E4%B8%80%E7%A5%A8

Playback Cases
- Not reached

Failed Case Diagnostics
- 银河的一票 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812939.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812939.html
- 黄泉的使者 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812956.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812956.html
- 致命之旅 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813070.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813070.html

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
- Keyword: `医到孤岛爱上你`
- URL: https://www.thanju.com/search/%E5%8C%BB%E5%88%B0%E5%AD%A4%E5%B2%9B%E7%88%B1%E4%B8%8A%E4%BD%A0.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 医到孤岛爱上你 | 01 | https://cdn.yzzy31-play.com/20260601/21399_07e6663e/index.m3u8 |
| OK | 菜鸟炊事兵 | 01 | https://player.yzzyvip-35.com/20260511/6413_a543c921/index.m3u8 |
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
- Keyword: `错付`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%94%99%E4%BB%98&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 错付 | 第1集 | https://vid.dbokutv.com/20260529/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsrsRsGlR7XgBMDcBJ0nBJ0nGpb2E30pE2vjS34/chunklist.m3u8 |
| OK | 银河的一票 | 第1集 | https://vid.dbokutv.com/20260421/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsLsRsGlR7XgBNbeP7bmBJ0nBJ0pC38rCZOrCYvjS34/chunklist.m3u8 |
| OK | 我们愉快的好日子 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTjUMjaQ79wBJ0nBJ0mGaGoCpKpHYvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
