# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-26T04:41:20.505Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Fatal | Fail 0/3 | Not Run | Not Reached | 0/1 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | OK | OK 2/2 | OK | OK 3/3 | 5/5 | - |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_olevod` 新歐樂影院: fatal_error:1
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1

### Plugin Details

<details>
<summary>新歐樂影院 · Fatal · conn=Fail 0/3 · search=Not Run · playback=Not Reached · reasons=connectivity_failed:1</summary>

- Folder: `plugin_olevod`
- Entry: `新歐樂影院`
- Overall: `Fatal`
- Cases: `0/1`
- Reasons: `connectivity_failed:1`
- Note: 海外 IP 無廣告
- Fatal Errors:
  - `plugin unhandledRejection: JSON Parse error: Unrecognized token '<'`

Connectivity
- [FAIL] `GET 502` https://api.olelive.com/ | status 502
- [FAIL] `GET 502` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 502
- [FAIL] `GET 502` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 502

Search
- Not run

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 502` https://api.olelive.com/ | status 502
  - `GET 502` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 502
  - `GET 502` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 502

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
- Keyword: `尖帽子的魔法工坊`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%B0%96%E5%B8%BD%E5%AD%90%E7%9A%84%E9%AD%94%E6%B3%95%E5%B7%A5%E5%9D%8A

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 尖帽子的魔法工坊 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_07e9ZHtl%2B8qrNzV8jGqPFcE3NRKfsX23UqzamaanMxa1T7Y4gyI%2FQTGaLn6YB6J4lmNPHlFa6an2NgNrn5ceUlIqET7Mb5Goz7PDWY5K43zwqiHb96tYpE0P |
| OK | 异世界悠闲农家 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_64aaqBEYa24%2BsVBvLZnKcacLjoEcQz72cy23B%2B77wVofSKu6fo0J4HZBund6Jkqh1FarQHI9LBOu1Ut%2Fk1IM36sjQnYe1sR3vUnN%2FMsErPDimvfaZBj%2FR%2Bgs |
| OK | 木头风纪委员和迷你裙JK的故事 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_3e179PrpbptXZF0zc9tO5g2AMTz0Ps%2FTFPwCc%2BcQ%2BnsiSbH9Fz56o0VDGQoTYNEpAuQbZk%2BQ%2B%2B07WWuLW%2FjpIzcKlsJuP%2FabOL8T0g0j3GN0mvr6ExGXjkVQ |

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
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `欺诈游戏`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%AC%BA%E8%AF%88%E6%B8%B8%E6%88%8F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 欺诈游戏 | HD10播放 1 | https://play2.nbyjson.top:889/nby/m3u8/getM3u8?name=jx.91by.top&time=1779770445808&url=NBY-faddd33761aeac03ed43584e9a9105e1.m3u8 |
| OK | 尖帽子的魔法工坊 | HD3播放 第01集 | https://ykj-eos-wx2-01.eos-wuxi-3.cmecloud.cn/834f92fcb4d04010b16aa5c9383bbcdc086?response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27Tongari.Boushi.no.Atelier.S01E01.mp4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260526T043252Z&X-Amz-SignedHeaders=host&X-Amz-Expires=900&X-Amz-Credential=Y60FITYLOX7N6UJWBOEE%2F20260526%2Fdefault%2Fs3%2Faws4_request&t=2&u=1190291049089620211&ot=personal&oi=1190291049089620211&f=Fuo7wIz1O5p865Um1P9dK36yf3EhkzvOf&ext=eyJ1dCI6MX0%3D&X-Amz-Signature=e62e092c89a9cac386243fca65cecb799a2fca8a2392c008df7c16d551e384a1 |
| OK | 法警小队 | HD8播放 第1集 | https://media-gzga-fy-home01.gz9oss.ctyunxs.cn/FAMILYCLOUD/424ae7f0-3354-48e6-90d3-7eecbaab0c32.mp4?x-amz-CLIENTTYPEIN=PC&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-limitrate=51200&response-content-type=video/mp4&x-amz-UID=733468849&x-amz-APPID=93005&response-content-disposition=attachment%3Bfilename%3D%22s01E01.mp4%22%3Bfilename*%3DUTF-8%27%27s01E01.mp4&x-amz-OPERID=70112817&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=FAMILY&Signature=0hptBEdklrUJMLl3bQ9yl88vATc%3D&Expires=1779778483&x-amz-FSIZE=540010598&x-amz-UFID=123881236415242319 |

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
- Keyword: `稻草人`
- URL: https://www.thanju.com/search/%E7%A8%BB%E8%8D%89%E4%BA%BA.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 稻草人 | 01 | https://cdn.vvvip-plays33.cc/20260420/12456_6a9edcb7/index.m3u8 |
| OK | 蔚蓝之春 | 01 | https://cdn.vvvip-plays33.cc/20260511/13520_2410f01c/index.m3u8 |
| OK | 菜鸟炊事兵 | 01 | https://player.yzzyvip-35.com/20260511/6413_a543c921/index.m3u8 |

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
- Keyword: `风带有香气`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%A3%8E%E5%B8%A6%E6%9C%89%E9%A6%99%E6%B0%94&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 风带有香气 | 第1集 | https://vid.dbokutv.com/20260331/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBMPaUNXnBJ0nBJ0pCK95GJ0uH2vjS34/chunklist.m3u8 |
| OK | 游戏里的生死契 | 第1集 | https://vid.dbokutv.com/20260525/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsyxDx8NjZmr5hoy6naStDnBJ0nBJ0pCKL1C4CnGYvjS34/chunklist.m3u8 |
| OK | 盛唐奇案 | 第1集 | https://vid.dbokutv.com/20260524/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsrsRsGlR7XgBNDqSM4jC34jC3CqGa4tD3b3BcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
