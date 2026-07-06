# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-06T07:22:50.386Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Fail 0/1 | 2/5 | plugin_empty_view:2, callback_timeout:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:2, callback_timeout:1

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
- Keyword: `大道独行之蝶龙变`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A4%A7%E9%81%93%E7%8B%AC%E8%A1%8C%E4%B9%8B%E8%9D%B6%E9%BE%99%E5%8F%98/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 大道独行之蝶龙变 | 第01集 | https://europe.olemovienews.com/ts4/20260420/4r08w569/mp4/4r08w569.mp4/master.m3u8 |
| OK | 瑞克和莫蒂 第九季 | 第01集 | https://europe.olemovienews.com/ts4/20260525/wveeivkw/mp4/wveeivkw.mp4/master.m3u8 |
| OK | 龙之家族 第三季 | 第01集 | https://europe.olemovienews.com/ts4/20260622/tozgzc7h/mp4/tozgzc7h.mp4/master.m3u8 |

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
- Keyword: `碧蓝航线`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E7%A2%A7%E8%93%9D%E8%88%AA%E7%BA%BF

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 碧蓝航线 微速前行 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_67e3A3DWlhC7rlHImcMxW9bjiJmli2i6SRx5JJJINGre9vaWxMKuJ862Ix25zKzIeT7mJ5Yj6D0w6n30a76reRK7ZzDJxjW0xXK%2BC9HBbd7mTxcMKRvawi8H |
| OK | 再见，拉拉 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_fefclCPgJx0LVOdWkA2nlF7CSxDSWpwLcodwgLSlbEdIj%2Fx0qwmYFI%2BlrbLA%2BTLz5N7kcH4UcGJfqi99kc9rz62nfBI566jFXou%2FHKEQzpa8XqVIzTp5%2FWv9 |
| OK | 二十世纪电气目录 | 第1集 | https://jx.wuzhoupai.com:8443/vip/?url=age_23d4vzF0ka9fE9cNfB98F5GOTwYriVltsphy38zN1EnZKywgrDQTXiWcjzJuT6plmE8lUwazu64YFwZWwPXVP6ax |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Fail 0/1 · reasons=plugin_empty_view:2, callback_timeout:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `plugin_empty_view:2, callback_timeout:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `鬼上车`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E9%AC%BC%E4%B8%8A%E8%BD%A6

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| FAIL | 龙之家族第三季 | BD1播放 1 | callback_timeout |

Failed Case Diagnostics
- 鬼上车 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813424.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813424.html
- 瑞克和莫蒂第九季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813057.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813057.html
- 龙之家族第三季 | BD1播放 1 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5813148.html
  - episodeURL: https://www.libvio.cam/play/5813148-8-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5813148-8-1.html
  - `GET 200` https://www.libvio.cam/static/player/4kvm.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=383953486d41764a2b384b48527279666a375734312f6a4a337267685639634630686d44695946304638484c324861344a6a7a2b6c3164676b327554554b7635&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F3148-8-2.html

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
| OK | 共感细胞 | 01 | https://cdn.yzzy28-play.com/20260704/32161_f76864d0/index.m3u8 |
| OK | 新进职员姜会长 | 01 | https://cdn.vvvip-plays33.cc/20260531/14095_1f3f1ae7/index.m3u8 |

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
- Keyword: `谜案拼图`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E8%B0%9C%E6%A1%88%E6%8B%BC%E5%9B%BE&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 谜案拼图 | 第1集 | https://vid.dbokutv.com/20260630/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtDsRsGlQ79nBMrXS7GjC34jC315CqOoGaH3BcrmD0/chunklist.m3u8 |
| OK | 野狗骨头 | 第1集 | https://vid.dbokutv.com/20260705/lxj-yggt-01-007FE7C41.mp4/chunklist.m3u8 |
| OK | 春花宴 | 第1集 | https://vid.dbokutv.com/20260705/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHfTcyo5xGvE9Qnj3oMc1YMc1WY6neY6PiSbpQu64/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
