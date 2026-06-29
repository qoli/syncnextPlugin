# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-29T04:53:29.913Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | Empty | OK 2/2 | 2/5 | connectivity_failed:1, search_empty:1, unknown:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | OK 2/2 | 4/5 | plugin_empty_view:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `4`
- `plugin_olevod` 新歐樂影院: unknown:1
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:1

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
- Keyword: `黄飞鸿3：狮王争霸`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%BB%84%E9%A3%9E%E9%B8%BF3%EF%BC%9A%E7%8B%AE%E7%8E%8B%E4%BA%89%E9%9C%B8/vod/0/1/4
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 莫离 | 第01集 | https://europe.olemovienews.com/ts4/20260609/ngnmcv2o/mp4/ngnmcv2o.mp4/master.m3u8 |
| OK | 黑猫和魔女的课堂 | 第01集 | https://europe.olemovienews.com/ts4/20260412/o379rjpz/mp4/o379rjpz.mp4/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401
- keyword:黄飞鸿3：狮王争霸 | stage=`search` | reason=`search_empty`
  - detailURL: https://api.olelive.com/v1/pub/index/search/%E9%BB%84%E9%A3%9E%E9%B8%BF3%EF%BC%9A%E7%8B%AE%E7%8E%8B%E4%BA%89%E9%9C%B8/vod/0/1/4
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/index/search/%E9%BB%84%E9%A3%9E%E9%B8%BF3%EF%BC%9A%E7%8B%AE%E7%8E%8B%E4%BA%89%E9%9C%B8/vod/0/1/4?_vv=fb708899ea61264d9721655358732667
- 黄飞鸿3：狮王争霸 | stage=`episodes` | reason=`unknown`
  - detailURL: https://api.olelive.com/v1/pub/vod/detail/7099/true
  - detail: no episodes
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/vod/detail/7099/true?_vv=cb2088edb1b126dab9e1653b4563273a

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
- Keyword: `黑猫与魔女的教室`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E9%BB%91%E7%8C%AB%E4%B8%8E%E9%AD%94%E5%A5%B3%E7%9A%84%E6%95%99%E5%AE%A4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 黑猫与魔女的教室 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_ea01dzswtID4Jk03TeloxR4lsaUnUJChgDQx2D3Xv3cQYZmbmB3Ur3EQXAc3Iy3QJkqLKqpKHawukLgn7bGMHsyW0qSKa0%2BzKDmMJtx0r6wKVDY5QBxcvKSV |
| OK | 名侦探光之美少女！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_a4af67LVykIiA2B0xGFDU9KAjahtHA88NisOk8x0wXepfbvzJvLDDR9vK%2Fk62N1A46CIgAYNr0I0FXDXl%2FDtxILEpQlwBXUGBQgKhquyhBIsVWwAXigt57Qs |
| OK | 钻石王牌 act2 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6575PKamshOAZCfLW%2B%2Bl24Ni%2Bm32Vf5SqrQuPcjG70gjtq8gwRA0H3Ywdjd96MeGztY24xMZ7imybLrTwE6FFNja9sXWvTq67z5NvJ0B1H%2FzgSHsUBFOTmHt |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=OK 2/2 · reasons=plugin_empty_view:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `4/5`
- Reasons: `plugin_empty_view:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `摩绪`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%91%A9%E7%BB%AA

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 梦魇绝镇第四季 | HD7播放 第01集 | https://lf26-csp-sign.bytetos.com/tos-cn-v-5f73e7/oMusR5t6IE50w3EAYhpalDGB5IdAD15fgHnFf1?x-expires=1782708686&x-signature=vdbomitsPDZ4aAK9vzEPwbAHnlE%3D&filename=BBA.mp4 |
| OK | 达顿牧场 | HD7播放 第01集 | https://lf26-csp-sign.bytetos.com/tos-cn-v-5f73e7/oIbBLPUIif6GDCcEAVEeheIJL1OrYwICrWuWwI?x-expires=1782709372&x-signature=EBbgz8Wb7LOIqf%2FVhQPu49hfmsE%3D&filename=BBA.mp4 |

Failed Case Diagnostics
- 摩绪 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813049.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813049.html

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
- Keyword: `长安女子鉴`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%95%BF%E5%AE%89%E5%A5%B3%E5%AD%90%E9%89%B4&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 长安女子鉴 | 第1集 | https://vid.dbokutv.com/20260625/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xGvE9QniBSycejC34jC3CrC4OmDZWqBcrmD0/chunklist.m3u8 |
| OK | 给你爱情处方 | 第1集 | https://vid.dbokutv.com/20260202/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMfkON5ZPYqmCIqmCZKtEJX4CaCkRN0q/chunklist.m3u8 |
| OK | 丰臣兄弟 | 第1集 | https://vid.dbokutv.com/20260105/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtDsRsGlR7XgBMPZU6GjC34jC311DqGoD3SmBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
