# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-22T04:54:03.260Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | Empty | OK 2/2 | 2/5 | connectivity_failed:1, search_empty:1, unknown:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 1/2 | Empty | Not Reached | 1/5 | search_empty:1, plugin_empty_view:3 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `4`
- `plugin_olevod` 新歐樂影院: unknown:1
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:3

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
- Keyword: `困在心绪里的儿子`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%9B%B0%E5%9C%A8%E5%BF%83%E7%BB%AA%E9%87%8C%E7%9A%84%E5%84%BF%E5%AD%90/vod/0/1/4
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 传奇办公室：中央情报 第二季 | 第01集 | https://europe.olemovienews.com/ts4/20260621/d0b4if6q/mp4/d0b4if6q.mp4/master.m3u8 |
| OK | 渎神者的灵扉 | 立即播放 | https://europe.olemovienews.com/ts4/20260621/6128mvvt/mp4/6128mvvt.mp4/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401
- keyword:困在心绪里的儿子 | stage=`search` | reason=`search_empty`
  - detailURL: https://api.olelive.com/v1/pub/index/search/%E5%9B%B0%E5%9C%A8%E5%BF%83%E7%BB%AA%E9%87%8C%E7%9A%84%E5%84%BF%E5%AD%90/vod/0/1/4
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/index/search/%E5%9B%B0%E5%9C%A8%E5%BF%83%E7%BB%AA%E9%87%8C%E7%9A%84%E5%84%BF%E5%AD%90/vod/0/1/4?_vv=ad908039a101091eecd1414b884321ae
- 困在心绪里的儿子 | stage=`episodes` | reason=`unknown`
  - detailURL: https://api.olelive.com/v1/pub/vod/detail/43792/true
  - detail: no episodes
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/vod/detail/43792/true?_vv=ad908039a101091eecd1414b884321ae

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
- Keyword: `魔法的姐妹露露和莉莉`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E9%AD%94%E6%B3%95%E7%9A%84%E5%A7%90%E5%A6%B9%E9%9C%B2%E9%9C%B2%E5%92%8C%E8%8E%89%E8%8E%89
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 魔法的姐妹露露和莉莉 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_17a9gcIQS6cQdUePXHZB69BnvIbYkMLkh%2Fv%2BlF%2BTtGqSH0cfdRp5kMxz4ifnv1nRAQm01fQUZOvBQ7U%2BYW6w6ECln2Qp%2BExzY7eAS0PWv3f5L6CnzOehqCMw |
| OK | 淫狱团地 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_0f3dD7RxMiOSCJSn3aQ%2FrmtxlooYTjN%2F671pq4LmJbqbht%2BWzXNFhvz7kuN1gv6ar8AVS7U5EV07su0x88X4Ao549Se175eRqsdV6YwkKUcqthvHt6fU0qtz |
| OK | 幽灵音乐会 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_7150ni2WVzeCLQixX%2FUUoCeuYJm0PFvufKr4Rp9tMw9zWNHAXPgPGD90ulKTOBuq%2B5IOuGbKycS0xzFbkL2MgE1RzftIABHf%2BM50RYvG%2F%2BCMoYz%2FWRCxIwCn |

Failed Case Diagnostics
- keyword:魔法的姐妹露露和莉莉 | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E9%AD%94%E6%B3%95%E7%9A%84%E5%A7%90%E5%A6%B9%E9%9C%B2%E9%9C%B2%E5%92%8C%E8%8E%89%E8%8E%89
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E9%AD%94%E6%B3%95%E7%9A%84%E5%A7%90%E5%A6%B9%E9%9C%B2%E9%9C%B2%E5%92%8C%E8%8E%89%E8%8E%89

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
- Keyword: `龙之家族第三季`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E9%BE%99%E4%B9%8B%E5%AE%B6%E6%97%8F%E7%AC%AC%E4%B8%89%E5%AD%A3
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- keyword:龙之家族第三季 | stage=`search` | reason=`search_empty`
  - detailURL: https://www.libvio.cam/search/-------------.html?wd=%E9%BE%99%E4%B9%8B%E5%AE%B6%E6%97%8F%E7%AC%AC%E4%B8%89%E5%AD%A3
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=%E9%BE%99%E4%B9%8B%E5%AE%B6%E6%97%8F%E7%AC%AC%E4%B8%89%E5%AD%A3
- 龙之家族第三季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813148.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813148.html
- 新进职员姜会长 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813067.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/detail/5813067.html
- 星城第一季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813073.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/detail/5813073.html

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
- Keyword: `新进职员姜会长`
- URL: https://www.thanju.com/search/%E6%96%B0%E8%BF%9B%E8%81%8C%E5%91%98%E5%A7%9C%E4%BC%9A%E9%95%BF.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 新进职员姜会长 | 01 | https://cdn.vvvip-plays33.cc/20260531/14095_1f3f1ae7/index.m3u8 |
| OK | 给你爱情处方 | 01 | https://cdn.yzzyvip-29.com/20260201/16425_49d7d186/index.m3u8 |
| OK | 大叔再出招 | 01 | https://cdn.vvvip-plays33.cc/20260522/13861_320274ee/index.m3u8 |

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
- Keyword: `监狱星级餐厅`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%9B%91%E7%8B%B1%E6%98%9F%E7%BA%A7%E9%A4%90%E5%8E%85&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 监狱星级餐厅 | 第1集 | https://vid.dbokutv.com/20260525/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJWlQ7PlP2ysF3KMjJoy6fZT2qmCYqmCaKmEK8sD4GkRN0q/chunklist.m3u8 |
| OK | 顾问：书写死亡的男人 | 第1集 | https://vid.dbokutv.com/20260622/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBMTtStXpTsHkSYqmCIqmCJGuCa8nCJ4kRN0q/chunklist.m3u8 |
| OK | 东京P.D.警视厅公关二课第2季 | 第1集 | https://vid.dbokutv.com/20260622/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtfsRsGlR7XgBMHgS2vaBcfpT6TdPMjaCcejC34jC316EK56DpauBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
