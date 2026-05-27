# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-27T04:48:24.785Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Partial 1/2 | 3/5 | plugin_empty_view:1, callback_timeout:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:1, callback_timeout:1

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
- Keyword: `她靠马甲称霸贵族学院`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A5%B9%E9%9D%A0%E9%A9%AC%E7%94%B2%E7%A7%B0%E9%9C%B8%E8%B4%B5%E6%97%8F%E5%AD%A6%E9%99%A2/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 她靠马甲称霸贵族学院 | 第1集 | https://europe.olemovienews.com/ts4/20260527/whFJtwps/mp4/whFJtwps.mp4/clipTo/115600/master.m3u8 |
| OK | 小师妹踏红尘，引来全城偏爱 | 第1集 | https://europe.olemovienews.com/ts4/20260527/ylfsdAhf/mp4/ylfsdAhf.mp4/clipTo/126291/master.m3u8 |
| OK | 大哥的新娘 | 第1集 | https://europe.olemovienews.com/ts4/20260527/iftesdpk/mp4/iftesdpk.mp4/clipTo/65733/master.m3u8 |

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
- Keyword: `欺诈游戏`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%AC%BA%E8%AF%88%E6%B8%B8%E6%88%8F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 欺诈游戏 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_188eQUWgTCuheZkoYXxGyZeE9kYJfQ8u1CxEsPd24RPPndHEVjS76K%2BRRfyVvDWRUIkRq9UZuZGWpm2acdYxSurezDtTG30iNal5ZEL%2B053hudVinCPokMGu |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_01ed333zXCOHQzrAjdNQu42IImYdlyTjvfY6I1NuXHLH27zHKrVztpyKxwNaDmcOBKfTLLxW%2FTp99BQ%2FU4PQUEh%2F82hI%2FqKtZrIt879%2FWb8Mc%2BakqurHLvW%2F |
| OK | 婚姻剧毒 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_802fvNeFjl%2Bf79VK4gWSABtNEtjC6hlPQrhg6xcRrYIqSwu3VhjRq3upBj1sQQtSB9VU79eP6%2BzuJXHxvXt9eqEiqXepnqToA9AdXqX6GmTOSeuPvS7PxGVn |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Partial 1/2 · reasons=plugin_empty_view:1, callback_timeout:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `3/5`
- Reasons: `plugin_empty_view:1, callback_timeout:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `大濛`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E5%A4%A7%E6%BF%9B

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| FAIL | 稻草人 | HD3播放 第01集 | callback_timeout |
| OK | 蔚蓝之春 | 4K蓝光 第1集 | https://media-bjcy-fy-person01.bjoss.ctyunxs.cn/PERSONCLOUD/bd1def88-cc10-4381-a743-188e9a180c87.m3u8?x-amz-CLIENTTYPEIN=UNKNOWN&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-userLevel=0&x-amz-limitrate=51200&x-amz-UID=269636103&x-amz-APPID=828221&response-content-disposition=attachment%3Bfilename%3D%2201.m3u8%22%3Bfilename*%3DUTF-8%27%2701.m3u8&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=PERSON&Signature=CzVsPmzT3olmcyq2hFRum0LTR40%3D&Expires=1779857589&x-amz-FSIZE=21431&x-amz-UFID=924291253717509876 |

Failed Case Diagnostics
- 大濛 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813059.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813059.html
- 稻草人 | HD3播放 第01集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5812927.html
  - episodeURL: https://www.libvio.cam/play/5812927-3-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5812927-3-1.html
  - `GET 200` https://www.libvio.cam/static/player/lbyy.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=2f6a4a32747a7274493444644c65475a7731497551363730354747484e61486d2b674d42716743486e70733d&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F2927-3-2.html
  - `POST 200` https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php

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
- Keyword: `稻草人`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%A8%BB%E8%8D%89%E4%BA%BA&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 稻草人 | 第1集 | https://vid.dbokutv.com/20260421/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHbTcyo5xOy6ejP6DoBJ0nBJ0oCJT1D491HIvjS34/chunklist.m3u8 |
| OK | 蔚蓝之春 | 第1集 | https://vid.dbokutv.com/20260512/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBNTiUcCjC34jC3CmGZCtDZT1BcrmD0/chunklist.m3u8 |
| OK | 菜鸟炊事兵 | 第1集 | https://vid.dbokutv.com/20260512/lxj-cncsb-01-014513E65.mp4/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
