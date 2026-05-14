# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-14T04:32:57.198Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | OK | OK 2/2 | OK | OK 3/3 | 5/5 | - |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `2`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1

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
- Keyword: `山村乡野神医`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%B1%B1%E6%9D%91%E4%B9%A1%E9%87%8E%E7%A5%9E%E5%8C%BB/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 山村乡野神医 | 第1集 | https://europe.olemovienews.com/ts4/20260514/iDBCcmcj/mp4/iDBCcmcj.mp4/clipTo/141360/master.m3u8 |
| OK | 缅北求生，从上飞机开始 | 第1集 | https://europe.olemovienews.com/ts4/20260514/stiGzDgj/mp4/stiGzDgj.mp4/clipTo/170366/master.m3u8 |
| OK | 读心太准，被特殊部门收编了 | 第1集 | https://europe.olemovienews.com/ts4/20260514/IAujEaHv/mp4/IAujEaHv.mp4/clipTo/145733/master.m3u8 |

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
- Keyword: `加油吧！中村君!!`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B!!
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 加油吧！中村君!! | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_4e81vRFI1v1rrbcSLupl7%2BjvzZ%2B1eGQ3FbgGeJv6VuarvVsbc8ugOuML93nsiW4BVkSX%2FFS%2B7%2BqBFmtqSQlbGKT9tsN4E9QKJV%2FlKJV1shW2cYudSlGEDXMg |
| OK | 最强王者的第二人生 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_3634XPapgbw%2Bw96%2B9hAa%2BhNM9XR%2Fz%2Fm0cfbljfZEOwN3vfmOpobQd1UuS5XQeIB1nDuCV%2BElPIRae%2BKT6mN1xROY0sTOlOfUXdPYKvZY8CpwXVuzluCV3IUY |
| OK | Candy Caries 蛀在糖糖里 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_7025J4Z0aJDlsHDqdjUj9veEbxAghh%2Fc0T2EZKKLjtIk3agrwNnO3xb%2FtNi%2Fiti6fL1If0s1iKcWXJOZdLumJy2toRZihbYcby8V49H%2BhKxvQht3zUukQP3K |

Failed Case Diagnostics
- keyword:加油吧！中村君!! | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B!!
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B!!

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
- [FAIL] `GET 403` https://www.czzy89.com | status 403
- [FAIL] `GET 403` https://www.czzy89.com/movie_bt/page/1 | status 403
- [FAIL] `GET 403` https://www.czzy89.com/boss1O1?q=test | status 403

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.czzy89.com/boss1O1?q=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.czzy89.com
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 403` https://www.czzy89.com | status 403
  - `GET 403` https://www.czzy89.com/movie_bt/page/1 | status 403
  - `GET 403` https://www.czzy89.com/boss1O1?q=test | status 403
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.czzy89.com/boss1O1?q=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 403` https://www.czzy89.com/boss1O1?q=test | safeline

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
- [OK] `HEAD 200` https://libvio.run/
- [OK] `HEAD 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `加油吧！中村君！`
- URL: https://libvio.run/search/-------------.html?wd=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B%EF%BC%81

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 加油吧！中村君！ | 第01集 | https://v3.vbing.me/2026/fun/4/Ganbare.Nakamura-kun.S01/Ganbare.Nakamura-kun.S01E01.mp4 |
| OK | 秒杀爱情 | 第01集 | https://v3.vbing.me/2026/rh/4/Sold.Out.on.You.S01/Sold.Out.on.You.S01E01.mp4 |
| OK | 好兆头 第三季 | 第01集 | https://v.vbing.me/2026/mj/5/Good.Omens.S03/Good.Omens.S03E01.mp4 |

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
| OK | 赌金 | 01 | https://player.yzzyvip-35.com/20260429/5623_44bf89b6/index.m3u8 |
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
- Keyword: `烬红妆`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%83%AC%E7%BA%A2%E5%A6%86&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 烬红妆 | 第1集 | https://vid.dbokutv.com/20260513/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsvsRsGlR7XgBMfeUYqmCIqmCq8vCaGnC3OkRN0q/chunklist.m3u8 |
| OK | 良陈美锦 | 第1集 | https://vid.dbokutv.com/20260503/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsfsRsGlR7XgBMnZRMejC34jC311HaCqCZX2BcrmD0/chunklist.m3u8 |
| OK | 云上天蓝 | 第1集 | https://vid.dbokutv.com/20260512/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBNbpT6mjC34jC38nHJ8sCZ4oBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
