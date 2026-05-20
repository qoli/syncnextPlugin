# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-20T04:42:19.041Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | OK 2/2 | 4/5 | plugin_empty_view:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:1

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
- Keyword: `婚局游戏`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A9%9A%E5%B1%80%E6%B8%B8%E6%88%8F/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 婚局游戏 | 第1集 | https://europe.olemovienews.com/ts4/20260520/lxfmeFfx/mp4/lxfmeFfx.mp4/clipTo/78520/master.m3u8 |
| OK | 致富：失业钓鱼，救女宠妻两不误 | 第1集 | https://europe.olemovienews.com/ts4/20260520/fveDvbuF/mp4/fveDvbuF.mp4/clipTo/93280/master.m3u8 |
| OK | 睁眼即无敌：我是赌石之神 | 第1集 | https://europe.olemovienews.com/ts4/20260520/ihoalmbq/mp4/ihoalmbq.mp4/clipTo/248033/master.m3u8 |

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
- Keyword: `左撇子艾伦`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%B7%A6%E6%92%87%E5%AD%90%E8%89%BE%E4%BC%A6

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 左撇子艾伦 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_5c80PD4rBc4MjqKQYQ6enyDPCtAAicWNyTkoIwI2kTt5XeM3r9aS%2B6rHVc3AXOQMy0c4McAXSY%2BFXiH0jq8cXv%2B9dwJzK5d9U2HF6EXCVyHvYrRqtwBCrd9KuA |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_b027l9X2D55ySUhqzRrY0osB0LB%2BA7h2CNf2g6orRvkwW9g18p2oMvx6LzBOcIqGmd2Rctw%2B6N6PGllqHoWZ4Zu0%2B5oJJOdgsLszOcoerfeV8mPfHub2tal9 |
| OK | 婚姻剧毒 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_8180vsVcoFMhk0rJXmBtneeOAW8M%2FI1ESVgvgyTM7ISkg51B6hVF5dnkh8EuOEGu4DNOMfwvySrOTajSBC%2Bm6%2FcYuk0EE1b9NM%2FDSZln2YCkeJjK0fZAB9dx |

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
- [OK] `HEAD 200` https://libvio.run/
- [OK] `HEAD 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `圣母玛利亚`
- URL: https://libvio.run/search/-------------.html?wd=%E5%9C%A3%E6%AF%8D%E7%8E%9B%E5%88%A9%E4%BA%9A

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 乔治和曼迪的头婚生活 第二季 | 第01集 | https://v3.vbing.me/2025/oumei/10/Georgie.and.Mandys.First.Marriage.S02/Georgie.and.Mandys.First.Marriage.S02E01.mp4 |
| OK | 欺诈游戏 | 第01集 | https://v3.vbing.me/2026/fun/4/LIAR.GAME.S01/LIAR.GAME.S01E01.mp4 |

Failed Case Diagnostics
- 圣母玛利亚 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://libvio.run/detail/714893461.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://libvio.run/detail/714893461.html

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
- Keyword: `蔚蓝之春`
- URL: https://www.thanju.com/search/%E8%94%9A%E8%93%9D%E4%B9%8B%E6%98%A5.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 蔚蓝之春 | 01 | https://cdn.vvvip-plays33.cc/20260511/13520_2410f01c/index.m3u8 |
| OK | 稻草人 | 01 | https://cdn.vvvip-plays33.cc/20260420/12456_6a9edcb7/index.m3u8 |
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
- Keyword: `我们愉快的好日子`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E6%88%91%E4%BB%AC%E6%84%89%E5%BF%AB%E7%9A%84%E5%A5%BD%E6%97%A5%E5%AD%90&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我们愉快的好日子 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTjUMjaQ79wBJ0nBJ0mGaGoCpKpHYvjS34/chunklist.m3u8 |
| OK | 红色珍珠 | 第1集 | https://vid.dbokutv.com/20260226/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBt5sRsGlR7XgBMXpUdejC34jC312HZ4mCZ4pBcrmD0/chunklist.m3u8 |
| OK | 罪无可逃 | 第1集 | https://vid.dbokutv.com/20260508/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsXsRsGlR7XgBNftQtGjC34jC30tHJaoDa4qBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
