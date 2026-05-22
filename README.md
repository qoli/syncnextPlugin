# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-22T04:42:10.725Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | Empty | OK 2/2 | 2/5 | connectivity_failed:1, search_empty:1, unknown:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | OK | OK 2/2 | OK | OK 3/3 | 5/5 | - |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_olevod` 新歐樂影院: unknown:1
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1

### Plugin Details

<details>
<summary>新歐樂影院 · Partial · conn=Fail 0/3 · search=Empty · playback=OK 2/2 · reasons=connectivity_failed:1, search_empty:1, unknown:1</summary>

- Folder: `plugin_olevod`
- Entry: `新歐樂影院`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `connectivity_failed:1, search_empty:1, unknown:1`
- Note: 海外 IP 無廣告

Connectivity
- [FAIL] `GET 404` https://api.olelive.com/ | status 404
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401

Search
- Status: `Empty`
- Keyword: `铁面无私`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%93%81%E9%9D%A2%E6%97%A0%E7%A7%81/vod/0/1/4
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 恶人当道 | 国语播放 | https://europe.olemovienews.com/ts4/20260521/brgkdrkb/mp4/brgkdrkb.mp4/master.m3u8 |
| OK | 淡岛百景 | 第01集 | https://europe.olemovienews.com/ts4/20260410/eefa6870/mp4/eefa6870.mp4/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401
- keyword:铁面无私 | stage=`search` | reason=`search_empty`
  - detailURL: https://api.olelive.com/v1/pub/index/search/%E9%93%81%E9%9D%A2%E6%97%A0%E7%A7%81/vod/0/1/4
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/index/search/%E9%93%81%E9%9D%A2%E6%97%A0%E7%A7%81/vod/0/1/4?_vv=b79046162601a9bb534190c35933c3ab
- 铁面无私 | stage=`episodes` | reason=`unknown`
  - detailURL: https://api.olelive.com/v1/pub/vod/detail/82040/true
  - detail: no episodes
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/vod/detail/82040/true?_vv=b79046162601a9bb534190c35933c3ab

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
- Keyword: `冰之城墙`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%86%B0%E4%B9%8B%E5%9F%8E%E5%A2%99

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 冰之城墙 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_074aCEnQcZBRuQLmz1bMT%2Bi6swVfkXI%2BdZrdJUxfX2qe9IOzE7QAVdkG6sVji0%2FE2xsApbpV6iyCkrWlejUZCq0pbvu1NE7hJcux%2Fe4Iwjii2FTs6WFqh9hm |
| OK | 雾尾粉丝后援会 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_32192lVgUGZnEAQsrDu8nuh%2BZ2T4haBVpWFkBB9cDIq1%2F9FkeGudrAvkRsf%2FlhcoK00xXCX8vTulOr7MUJ7FwRGmBoiE7pBMJ2DUfsUi6RuCaiUemDogRo7a |
| OK | 最强的职业不是勇者也不是贤者好像是鉴定士(伪)的样子? | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_79a1lZHr6MeW0V%2BtGcWZ0FRU1Dfsiiyhu82BeSmiLwQyWcMyl8gn5q%2FuMGnXr%2BA95%2BN8oWo%2B9KwVzBT4MhWaT1jpTDwP246gAzdAc%2BFegwM1LoJ%2FGvalR9dmpA |

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
<summary>libvio · OK · conn=OK 2/2 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: libvio

Connectivity
- [OK] `GET 200` https://libvio.run/
- [OK] `GET 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `秒杀爱情`
- URL: https://libvio.run/search/-------------.html?wd=%E7%A7%92%E6%9D%80%E7%88%B1%E6%83%85

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 秒杀爱情 | 第01集 | https://v3.vbing.me/2026/rh/4/Sold.Out.on.You.S01/Sold.Out.on.You.S01E01.mp4 |
| OK | 石纪元 第四季 Part 3 | 第01集 | https://v3.vbing.me/2026/fun/4/Dr.STONE.S04Part/Dr.STONE.S04E25.mp4 |
| OK | 月夜行路：答案在名作中 | 第01集 | https://v3.vbing.me/2026/rh/4/A.Moonlight.Nights.Passing.S01/A.Moonlight.Nights.Passing.S01E01.mp4 |

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
- Keyword: `秒杀爱情`
- URL: https://www.thanju.com/search/%E7%A7%92%E6%9D%80%E7%88%B1%E6%83%85.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 秒杀爱情 | 01 | https://cdn.yzzy31-play.com/20260422/19875_bcc04bea/index.m3u8 |
| OK | 红色珍珠 | 01 | https://cdn.vvvip-plays33.cc/20260224/8726_d6f84c02/index.m3u8 |
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
- Keyword: `秒杀爱情`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%A7%92%E6%9D%80%E7%88%B1%E6%83%85&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 秒杀爱情 | 第1集 | https://vid.dbokutv.com/20260423/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejRNDXSIqmCIqmCJT5GJKvC3OkRN0q/chunklist.m3u8 |
| OK | 向流星许愿的我们 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtTsRsGlR7XgBNXiU7XvP7TjBJ0nBJ0oE4GoDZX1CovjS34/chunklist.m3u8 |
| OK | 主角 | 第1集 | https://vid.dbokutv.com/20260510/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtfsRsGlR7XgBNfgBJ0nBJ0nGZ8vDpaqCovjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
