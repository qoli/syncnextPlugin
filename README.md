# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-24T04:45:11.341Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Partial 2/3 | 4/5 | callback_timeout:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: callback_timeout:1

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
- Keyword: `嫡姐抢嫁穷书生，我嫁战神`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%AB%A1%E5%A7%90%E6%8A%A2%E5%AB%81%E7%A9%B7%E4%B9%A6%E7%94%9F%EF%BC%8C%E6%88%91%E5%AB%81%E6%88%98%E7%A5%9E/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 嫡姐抢嫁穷书生，我嫁战神耀京华 | 第1集 | https://europe.olemovienews.com/ts4/20260524/IwuBdbBf/mp4/IwuBdbBf.mp4/clipTo/87166/master.m3u8 |
| OK | 爹，别卷了！我只想败坏宗门名声 | 第1集 | https://europe.olemovienews.com/ts4/20260524/kFHtdAwx/mp4/kFHtdAwx.mp4/clipTo/81958/master.m3u8 |
| OK | 反派世家偷听我心声，我成团宠了 | 第1集 | https://europe.olemovienews.com/ts4/20260524/scExalnG/mp4/scExalnG.mp4/clipTo/205800/master.m3u8 |

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
- Keyword: `主播女孩重度依赖`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%BB%E6%92%AD%E5%A5%B3%E5%AD%A9%E9%87%8D%E5%BA%A6%E4%BE%9D%E8%B5%96

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 主播女孩重度依赖 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_50c1GAtQpAaBf%2BudC7YowkaY5NKsfK0AAwRlFfBos9xazT9%2FSpZ87aQqNlbdskFNifAM3Fu1ZZOK%2FhdZAaQ8Qikk7wgXNY1hB1p4xJKBdt6wUvoLxOCFLDcw |
| OK | 一叠间漫画咖啡屋生活！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_58b2OwydkvnHnbC98wSXity6%2Fcn9TIyZKTtY2u1S44PnAOFLesbDKMi1riJbq1eAKndHzaRu05l1aBrAO905%2FYHQRlr1vG73z8eownEjweF2TuPmNMGdr8wr |
| OK | 楠木邸的神明庭院 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_06899i%2B0XMVYo5eTr86apG9D2yC5MdM4c2ed3irsP5QVsIXspFLQV6zJSOd2UDoL%2BFzwBvvC6oK7UoB90CLpG4oLbolIDRZjiMCmaUv%2BUyJhga1gGBFyySC0 |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Partial 2/3 · reasons=callback_timeout:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `4/5`
- Reasons: `callback_timeout:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `努力克服自卑的我们`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E5%8A%AA%E5%8A%9B%E5%85%8B%E6%9C%8D%E8%87%AA%E5%8D%91%E7%9A%84%E6%88%91%E4%BB%AC

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| FAIL | 努力克服自卑的我们 | 蓝光C 第01集 | callback_timeout |
| OK | 我的王室死对头 | 蓝光G 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/ogrereAf8dQWWwnteMWnQhEYlQCMXr65BSPRF4?a=1559&x-tos-authkey=df275fb0a832551f108cddca4a07b3a3&ch=2&cr=2&x-tos-signature=wFUA7sOB7zOR5DXHrJg5nXulYC00Qqk3O9OI6fUZ&dr=4&er=0&lr=test&cd=5%7C2%7C0%7C3&x-signature=Jc2EhmJbBaiuzqFp8ZMZqCDzvO8%3D&br=1789&bt=1504&cs=7&ds=6&ft=jUaX348fHmzy5CXb5gSc&mime_type=video_mp4&x-tos-expires=1780718321&qs=13&x-expires=1787373820&rc=YpNJwD2txTpECaaTVwU99iigmsNOwwcu1p5jlEaOwd3KTQx754%3D%3D&btag=a0000e900430000&dy_q=1778081787&l=202605215e629f88a99aa30f1937608e8&filename=bba.mp4 |
| OK | 大叔再出招 | 蓝光G 第01集 | https://video-cn.jinritemai.com/storage/v1/tos-cn-v-0051/975ef320fc604c4891d64181719c9876?x-tos-authkey=5bf25627da095a5cba28ace592de46cc&x-tos-expires=1780811617&x-tos-signature=OWhWBqSZUZegxF8qpUBvCBz2ZYg&filename=bba.mp4 |

Failed Case Diagnostics
- 努力克服自卑的我们 | 蓝光C 第01集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5812923.html
  - episodeURL: https://www.libvio.cam/play/5812923-5-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5812923-5-1.html
  - `GET 200` https://www.libvio.cam/static/player/lbyy.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=2f6a4a32747a7274493444644c65475a77314975513938474e654e6f326347335373574b3762552f4376453d&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F2923-5-2.html
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
- Keyword: `给你爱情处方`
- URL: https://www.thanju.com/search/%E7%BB%99%E4%BD%A0%E7%88%B1%E6%83%85%E5%A4%84%E6%96%B9.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 给你爱情处方 | 01 | https://cdn.yzzyvip-29.com/20260201/16425_49d7d186/index.m3u8 |
| OK | 努力克服自卑的我们 | 01 | https://cdn.yzzy31-play.com/20260418/19681_becb8597/index.m3u8 |
| OK | 我的王室死对头 | 01 | https://cdn.vvvip-plays33.cc/20260508/13433_c7876d6b/index.m3u8 |

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
- Keyword: `给你爱情处方`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%BB%99%E4%BD%A0%E7%88%B1%E6%83%85%E5%A4%84%E6%96%B9&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 给你爱情处方 | 第1集 | https://vid.dbokutv.com/20260202/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMfkON5ZPYqmCIqmCZKtEJX4CaCkRN0q/chunklist.m3u8 |
| OK | 努力克服自卑的我们 | 第1集 | https://vid.dbokutv.com/20260419/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsfsRsGlR7XgBMviQsPwOcHtRIqmCIqmCpSpCqGsGZOkRN0q/chunklist.m3u8 |
| OK | 隐秘的监察 | 第1集 | https://vid.dbokutv.com/20260425/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHiTcyo5xOy6ejUMraQcCjC34jC311EJOtE495BMXaBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
