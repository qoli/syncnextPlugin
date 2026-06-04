# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-04T04:54:11.719Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Fail 0/1 | 2/5 | callback_timeout:1, plugin_empty_view:2 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: callback_timeout:1, plugin_empty_view:2

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
- Keyword: `错嫁将军府，食色皆偏爱`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%94%99%E5%AB%81%E5%B0%86%E5%86%9B%E5%BA%9C%EF%BC%8C%E9%A3%9F%E8%89%B2%E7%9A%86%E5%81%8F%E7%88%B1/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 错嫁将军府，食色皆偏爱 | 第1集 | https://europe.olemovienews.com/ts4/20260604/EscjBECi/mp4/EscjBECi.mp4/clipTo/88000/master.m3u8 |
| OK | 暖暖入怀，福满京华 | 第1集 | https://europe.olemovienews.com/ts4/20260604/qDtjlwuA/mp4/qDtjlwuA.mp4/clipTo/112640/master.m3u8 |
| OK | 报告魔尊：帝君他对你动了凡心 | 第1集 | https://europe.olemovienews.com/ts4/20260604/ufsiCFfg/mp4/ufsiCFfg.mp4/clipTo/180000/master.m3u8 |

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
| OK | 加油吧！中村君!! | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_1e23ZpsPCKB0NJfEWRNKzC6i44VRqV2R9HqhJx5baKfOJ00HZr2TmUa9uD%2BMO5khi7w5TVXU%2BpfO5pQrhXCT4aW%2BVXA8TnW%2Bj5cMaslVfhTOnY3pUlRV3GA6 |
| OK | Candy Caries 蛀在糖糖里 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_999aFUnL68x21IIDzXBeWDb8VwJy5XlF%2Fn7rR3P41Jih7gcc%2BwYYESjRgGEfYhIY2pC3DKZn%2F4gjtrGwvKVC3OfLuCKZunYMdrjS%2BYwVJb5V%2FD6%2BBdHsPtRn |
| OK | 最强王者的第二人生 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_229fcXn4xI7659EXhKUuGpOBe%2B46PGbaoEzr8pZklGviKMyMZOGJzJPNUsbG9BFgE1zizKHaYMqiiAevzU%2BNjvbJq5e%2BU%2F03AbBCd146F80lWahbKErd4T8I |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Fail 0/1 · reasons=callback_timeout:1, plugin_empty_view:2</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `callback_timeout:1, plugin_empty_view:2`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `寡妇湾`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E5%AF%A1%E5%A6%87%E6%B9%BE

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| FAIL | 寡妇湾 | HD3播放 第01集 | callback_timeout |

Failed Case Diagnostics
- 寡妇湾 | HD3播放 第01集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5812946.html
  - episodeURL: https://www.libvio.cam/play/5812946-6-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5812946-6-1.html
  - `GET 200` https://www.libvio.cam/static/player/lbyy.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=2f6a4a32747a7274493444644c65475a773149755135656e7854764233302f6d4b3563636643757a4e45773d&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F2946-6-2.html
  - `POST 504` https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php
- 犯罪记录第二季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813035.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813035.html
- 克拉克森的农场第五季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813074.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813074.html

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
- Keyword: `第一个男人`
- URL: https://www.thanju.com/search/%E7%AC%AC%E4%B8%80%E4%B8%AA%E7%94%B7%E4%BA%BA.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |
| OK | 我们愉快的好日子 | 01 | https://player.yzzyvip-35.com/20260331/3348_333cb763/index.m3u8 |
| OK | 红色珍珠 | 01 | https://cdn.vvvip-plays33.cc/20260224/8726_d6f84c02/index.m3u8 |

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
- Keyword: `山神的新郎`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%B1%B1%E7%A5%9E%E7%9A%84%E6%96%B0%E9%83%8E&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 山神的新郎 | 第1集 | https://vid.dbokutv.com/20260601/lxj-ssdxl-01-03B3A3866.mp4/chunklist.m3u8 |
| OK | 逍遥四公子 | 第1集 | https://vid.dbokutv.com/20260601/lxj-xysgz-01-02ED99B18.mp4/chunklist.m3u8 |
| OK | 耀眼 | 第1集 | https://vid.dbokutv.com/20260528/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHeTcyo5xOy6ejUNajC34jC38mGJauDK8tBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
