# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-11T04:42:50.837Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Partial 1/2 | 3/5 | callback_timeout:1, plugin_empty_view:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: callback_timeout:1, plugin_empty_view:1

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
- Keyword: `爱是最高机密`
- URL: https://api.olelive.com/v1/pub/index/search/%E7%88%B1%E6%98%AF%E6%9C%80%E9%AB%98%E6%9C%BA%E5%AF%86/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 爱是最高机密 | 第02集 | https://europe.olemovienews.com/ts4/20260511/vfxkglqz/mp4/vfxkglqz.mp4/clipTo/167180/master.m3u8 |
| OK | 重生九世：全家靠我心声逆天改命 | 第01集 | https://europe.olemovienews.com/ts4/20260511/oDuIExJk/mp4/oDuIExJk.mp4/clipTo/235666/master.m3u8 |
| OK | 被开除当天，我入职千亿集团 | 第1集 | https://europe.olemovienews.com/ts4/20260511/ihatembE/mp4/ihatembE.mp4/clipTo/77933/master.m3u8 |

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
- Keyword: `茉莉花酱的好感度正在崩坏`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E8%8C%89%E8%8E%89%E8%8A%B1%E9%85%B1%E7%9A%84%E5%A5%BD%E6%84%9F%E5%BA%A6%E6%AD%A3%E5%9C%A8%E5%B4%A9%E5%9D%8F
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 茉莉花酱的好感度正在崩坏 | 第01集 | https://hn.bfvvs.com/play/b2kvMJ1d/index.m3u8 |
| OK | 淫狱团地 | 第01集 | https://hn.bfvvs.com/play/eVOPRZva/index.m3u8 |
| OK | 幽灵音乐会 | 第01集 | https://hn.bfvvs.com/play/dwpm171e/index.m3u8 |

Failed Case Diagnostics
- keyword:茉莉花酱的好感度正在崩坏 | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E8%8C%89%E8%8E%89%E8%8A%B1%E9%85%B1%E7%9A%84%E5%A5%BD%E6%84%9F%E5%BA%A6%E6%AD%A3%E5%9C%A8%E5%B4%A9%E5%9D%8F
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E8%8C%89%E8%8E%89%E8%8A%B1%E9%85%B1%E7%9A%84%E5%A5%BD%E6%84%9F%E5%BA%A6%E6%AD%A3%E5%9C%A8%E5%B4%A9%E5%9D%8F

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Partial 1/2 · reasons=callback_timeout:1, plugin_empty_view:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `3/5`
- Reasons: `callback_timeout:1, plugin_empty_view:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://libvio.run/
- [OK] `HEAD 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `法警小队`
- URL: https://libvio.run/search/-------------.html?wd=%E6%B3%95%E8%AD%A6%E5%B0%8F%E9%98%9F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 法警小队 第一季 | 第01集 | https://v3.vbing.me/2026/mj/3/Marshals.S01/Marshals.S01E01.mp4 |
| FAIL | 爱情抓马 | 1080P | callback_timeout |

Failed Case Diagnostics
- 爱情抓马 | 1080P | stage=`player` | reason=`callback_timeout`
  - detailURL: https://libvio.run/detail/714893446.html
  - episodeURL: https://libvio.run/w/714893446-1-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://libvio.run/w/714893446-1-1.html
  - `GET 200` https://libvio.run/static/player/yd189.js
  - `GET 200` https://libvio.run/vid/yd.php?url=Ln2hF2wsazSx1Q2GMtiz90jrb82P11tYb92J4WvXMBTVga3HNODUgLxkOZTicv5iNTTcMj5aNujGkP4vOrDCkcyvORCO8D1WN0DXYs4fNLj8U2yeRBTPQD08NxzjIt2dMTZENjEyRTMyMzAzMjM2MkU2RDcwMzQO0O0O&next=&id=714893446&nid=1
- 亢奋 第三季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://libvio.run/detail/714893362.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://libvio.run/detail/714893362.html

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
- Keyword: `努力克服自卑的我们`
- URL: https://www.thanju.com/search/%E5%8A%AA%E5%8A%9B%E5%85%8B%E6%9C%8D%E8%87%AA%E5%8D%91%E7%9A%84%E6%88%91%E4%BB%AC.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 努力克服自卑的我们 | 01 | https://cdn.yzzy31-play.com/20260418/19681_becb8597/index.m3u8 |
| OK | 隐秘的监察 | 01 | https://cdn.vvvip-plays33.cc/20260425/12786_5dacab03/index.m3u8 |
| OK | 给你爱情处方 | 01 | https://cdn.yzzyvip-29.com/20260201/16425_49d7d186/index.m3u8 |

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
- Keyword: `隐秘的监察`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%9A%90%E7%A7%98%E7%9A%84%E7%9B%91%E5%AF%9F&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 隐秘的监察 | 第1集 | https://vid.dbokutv.com/20260425/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHiTcyo5xOy6ejUMraQcCjC34jC311EJOtE495BMXaBcrmD0/chunklist.m3u8 |
| OK | 爱情没有神话 | 第1集 | https://vid.dbokutv.com/20260428/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsrsRsGlR7XgBM5nRNbpQ2qmCIqmCK8uEJWoHJCkRN0q/chunklist.m3u8 |
| OK | 主角 | 第1集 | https://vid.dbokutv.com/20260510/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtfsRsGlR7XgBNfgBJ0nBJ0nGZ8vDpaqCovjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
