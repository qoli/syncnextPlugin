# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-21T04:46:37.767Z`
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
- Keyword: `兰嫔秘事`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%85%B0%E5%AB%94%E7%A7%98%E4%BA%8B/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 兰嫔秘事 | 第1集 | https://europe.olemovienews.com/ts4/20260521/GCAIttma/mp4/GCAIttma.mp4/clipTo/179200/master.m3u8 |
| OK | 被读心后，暴躁王爷每天求我亲亲！ | 第1集 | https://europe.olemovienews.com/ts4/20260521/raAngdCd/mp4/raAngdCd.mp4/clipTo/283700/master.m3u8 |
| OK | 魔尊的药引跑路了 | 第1集 | https://europe.olemovienews.com/ts4/20260521/bIdncaey/mp4/bIdncaey.mp4/clipTo/150366/master.m3u8 |

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
| OK | 加油吧！中村君!! | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_4226hRwcCK%2B2YP4go3GOM%2BW%2FxxbmEJvE7r3Vwh4P23q5%2FQR06EYR3Mfavi6qtGxDFuUO0cFRUgnN%2BTA8YGoa65PhozDAKOchZmVhs%2B4nVnvW0Zi2aqW7dXgE |
| OK | 最强王者的第二人生 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_b5acAKFFyePnO6%2BaWRDU2xyI%2FfuIqvGFvrRyFYRx1AVClJ3CxerkudMmKO4p4nC0iSwzK9uiTRZz%2BQQ039Ferh3hI8Sh6Vzekx2JqOtvjrYhH4SkfNbaPImW |
| OK | 关于虽然逃走的鱼很大、但钓上来的鱼却太大了这件事 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_52c36iV8j3v2vdMiw9tgnUtmOpUFWbB8Rt6j7FwgGlWR4OXA9QVs4VCKs%2FQo8Db7XJ75tmubsi8tvn0DZsrvR6MX425UaIXg3SEa7iGioRSZQJfGCwNVvNpg |

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
- Keyword: `杰克·莱恩：幽灵之战`
- URL: https://libvio.run/search/-------------.html?wd=%E6%9D%B0%E5%85%8B%C2%B7%E8%8E%B1%E6%81%A9%EF%BC%9A%E5%B9%BD%E7%81%B5%E4%B9%8B%E6%88%98

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 杰克·莱恩：幽灵之战 | 1080P双语 | https://v.vbing.me/2026/dy/5/Tom.Clancys.Jack.Ryan.Ghost.War.2026.1080p.mp4 |
| OK | 梦魇绝镇 第四季 | 第01集 | https://v3.vbing.me/2026/mj/4/From.S04/From.S04E01.mp4 |
| OK | 秒杀爱情 | 第01集 | https://v3.vbing.me/2026/rh/4/Sold.Out.on.You.S01/Sold.Out.on.You.S01E01.mp4 |

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
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |
| OK | 赌金 | 01 | https://player.yzzyvip-35.com/20260429/5623_44bf89b6/index.m3u8 |

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
- Keyword: `失恋歌牌`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%A4%B1%E6%81%8B%E6%AD%8C%E7%89%8C&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 失恋歌牌 | 第1集 | https://vid.dbokutv.com/20260508/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHkTcyo5xOy6ejSsndS2qmCIqmCJb6GpaqHJKkRN0q/chunklist.m3u8 |
| OK | 犬饲先生是隐秘溺爱上司 | 第1集 | https://vid.dbokutv.com/20260508/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHeTcyo5xOy6ejSNDuStDvRMvXStCjC34jC353H38nDZb1BcrmD0/chunklist.m3u8 |
| OK | 红色珍珠 | 第1集 | https://vid.dbokutv.com/20260226/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBt5sRsGlR7XgBMXpUdejC34jC312HZ4mCZ4pBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
