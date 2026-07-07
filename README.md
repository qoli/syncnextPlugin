# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-07T06:56:01.303Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Fail 0/2 | 2/5 | plugin_empty_view:1, callback_timeout:2 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:1, callback_timeout:2

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
- Keyword: `野狗骨头`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%87%8E%E7%8B%97%E9%AA%A8%E5%A4%B4/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 野狗骨头 | 第01集 | https://europe.olemovienews.com/ts4/20260705/j0zawap2/mp4/j0zawap2.mp4/master.m3u8 |
| OK | 悬案 | 第01集 | https://europe.olemovienews.com/ts4/20260703/01ov5ort/mp4/01ov5ort.mp4/master.m3u8 |
| OK | 京城奇探 | 第01集 | https://europe.olemovienews.com/ts4/20260705/y9i0s8u3/mp4/y9i0s8u3.mp4/master.m3u8 |

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
- Keyword: `碧蓝之海`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E7%A2%A7%E8%93%9D%E4%B9%8B%E6%B5%B7

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 碧蓝之海 第三季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_a257xCZ7%2Bj4Ml0QdvynufYE75iTcUsqHjqY5bvirSv8xpDJrSgl64chua508OhDUIKh%2Fj25oVkw%2BIkAcB5l%2FfWWwEk579xsuHDpNB2G3KYiAvx7zvEfh63Xs |
| OK | 斗球儿弹子 | 第1集 | https://jx.wuzhoupai.com:8443/vip/?url=age_0ab8%2BTBl7%2F%2FmxxtvXPO0eQOPOr8%2Fyl9L0GBx2Qq%2Fn6CmQa3w3PQwvZJ8RypZT%2BSxL2QlFky%2FbULusgTPBGFfkvUK |
| OK | 被遗弃圣女的异世界美食之旅 用隐藏技能召唤了露营车 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_27e1MokQ%2F4wyT19F7ChUsvhS9jz2v%2BkCgyRtXR2quEZI70O%2Fg6eyWUFyxJ8GI5PeVAnxuvCiKBEUvMP1pKNRCxgBOe%2BDaXdPvUpwX9z016BD%2F9ZSas0TcmfL |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Fail 0/2 · reasons=plugin_empty_view:1, callback_timeout:2</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `plugin_empty_view:1, callback_timeout:2`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `蒙上你的眼`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E8%92%99%E4%B8%8A%E4%BD%A0%E7%9A%84%E7%9C%BC

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| FAIL | 奇探佩辛丝第二季 | 4K蓝光 第1集 | callback_timeout |
| FAIL | 奇探佩辛丝第一季 | 4K蓝光 第1集 | callback_timeout |

Failed Case Diagnostics
- 蒙上你的眼 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813458.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813458.html
- 奇探佩辛丝第二季 | 4K蓝光 第1集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5813456.html
  - episodeURL: https://www.libvio.cam/play/5813456-4-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5813456-4-1.html
  - `GET 200` https://www.libvio.cam/static/player/jdyx.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=4e734d374c54754f76356873756975515169594d476d6853774344454274736b332b394b43505057734268335579304d4b626e446c6659484a3865666f4d724e&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F3456-4-2.html
  - `POST 200` https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php
- 奇探佩辛丝第一季 | 4K蓝光 第1集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5813457.html
  - episodeURL: https://www.libvio.cam/play/5813457-4-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5813457-4-1.html
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=47354f455875307a4a477a4b594e344b3773304e7443525a615756384b64785645324e79345750436a6f5774766232436a663852754d436d37565a6e757a4259&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F3457-4-2.html
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
- Keyword: `家庭关系证明书`
- URL: https://www.thanju.com/search/%E5%AE%B6%E5%BA%AD%E5%85%B3%E7%B3%BB%E8%AF%81%E6%98%8E%E4%B9%A6.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 家庭关系证明书 | 01 | https://cdn.yzzyvip-29.com/20260707/25534_f5011865/index.m3u8 |
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
- Keyword: `千香`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%8D%83%E9%A6%99&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 千香 | 第1集 | https://vid.dbokutv.com/20260627/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBN5uBJ0nBJ0pCJKqHJCqH2vjS34/chunklist.m3u8 |
| OK | 悬案 | 第1集 | https://vid.dbokutv.com/20260703/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejU64jC34jC30tGK8vDpWuBcrmD0/chunklist.m3u8 |
| OK | 春花宴 | 第1集 | https://vid.dbokutv.com/20260705/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHfTcyo5xGvE9Qnj3oMc1YMc1WY6neY6PiSbpQu64/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
