# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-07T04:51:52.701Z`
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
- Keyword: `穿书：反派总裁的逆袭之路`
- URL: https://api.olelive.com/v1/pub/index/search/%E7%A9%BF%E4%B9%A6%EF%BC%9A%E5%8F%8D%E6%B4%BE%E6%80%BB%E8%A3%81%E7%9A%84%E9%80%86%E8%A2%AD%E4%B9%8B%E8%B7%AF/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 穿书：反派总裁的逆袭之路，这次我当主角 | 第1集 | https://europe.olemovienews.com/ts4/20260607/hEADxcfy/mp4/hEADxcfy.mp4/clipTo/208833/master.m3u8 |
| OK | 透视后，我被女总裁缠上了 | 第1集 | https://europe.olemovienews.com/ts4/20260607/xFcHzymF/mp4/xFcHzymF.mp4/clipTo/159760/master.m3u8 |
| OK | 为给父母争口气，我以身入局 | 第1集 | https://europe.olemovienews.com/ts4/20260607/cvnprdun/mp4/cvnprdun.mp4/clipTo/123666/master.m3u8 |

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
- Keyword: `勇者之屑`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8B%87%E8%80%85%E4%B9%8B%E5%B1%91

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 勇者之屑 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_94787QDbWDeVdQ%2F6WCFgn4bV9dTQt6jV1M5iqn24nxgMnwPwmwvDnwvVpv1jhKyH%2BivsUlswfPbTpX%2F3cJM4gbZGAKrjvwrTr8Gl7inmqK3h9CoiXvm17pUh |
| OK | 主播女孩重度依赖 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_652aErhfhNCUqnCgUPF9YuVI4byjCXwh9DE9rtPbKNCvEqzTH6EVnYSHl5HFDTUH9L5NIlvI18UQbxhchTzwlSmvNx2XzsWNAAI5dA9Zk%2BgzN6%2BUwZuBogX%2F |
| OK | 一叠间漫画咖啡屋生活！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_9960PJXF1NA7JAj18b0MSmOsMiCEz%2FL6Pp5EqioqY0l63I%2FwZMzatHXjx4CXbYTKuokujrc3tPOBU%2F8vkV5SQbTymCRS7z1tOyV0i2nKCpx%2B2QM7ZdT6RUHs |

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
- Keyword: `新进职员姜会长`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%96%B0%E8%BF%9B%E8%81%8C%E5%91%98%E5%A7%9C%E4%BC%9A%E9%95%BF

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我的王室死对头 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/ogrereAf8dQWWwnteMWnQhEYlQCMXr65BSPRF4?a=1426&x-tos-expires=1781315704&ch=0&x-tos-signature=gMr4aDiazzQZ3klWN14z32ASYu0yXqL7BnPJdUaV&cr=8&dr=8&er=0&x-signature=VP5B5agTgC%2BLrAqVcafe8kB0vsQ%3D&lr=test&cd=4%7C3%7C0%7C9&br=1798&bt=1469&x-tos-authkey=d2fe1903e1a0af10956314ab507feb41&cs=5&x-expires=1781062680&ds=6&ft=QSwZE2py9i1vIrJhwYSg&mime_type=video_mp4&qs=13&rc=naF4CKDwXa0IkqBxo1E2ykEIN6DGzEYlMWfA7q7hR1umGSo1tg%3D%3D&btag=a0000e446600000&dy_q=1778073560&l=202605214ed31b8083a75bdc9b6f14a71&filename=BBA@ckfiv.mp4 |
| OK | 大叔再出招 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/osCb6fH6DAoqFJXaqiEEQMIeEBDIGaFg7q1RnH?a=1350&ch=1&cr=3&dr=8&x-signature=cJeg%2Blm9IRZoEWjJU0sWHb5E24A%3D&er=0&x-tos-signature=enNxYTOsL5hjy3Y2gJyWj0exvuGaD2JVxx4OovWz&lr=test&cd=2%7C5%7C0%7C3&br=1500&bt=1403&x-tos-expires=1782216177&cs=8&ds=5&x-tos-authkey=3e67cc953efd31cc52ef2fb5b3ea5c33&ft=jc3RnsTaRFQHAUgEvdWd&x-expires=1781060882&mime_type=video_mp4&qs=13&rc=JlJAEkFmR3oVv0hmNUQNf5sLuVXGj02MhktbtNlIghykGLXmzZ%3D%3D&btag=a0000e227110000&dy_q=1778023070&l=2026052167aeb7f84fbfc227eb4392aae&filename=BBA@ckfiv.mp4 |

Failed Case Diagnostics
- 新进职员姜会长 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813067.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813067.html

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
| OK | 新进职员姜会长 | 01 | https://cdn.vvvip-plays33.cc/20260531/14095_1f3f1ae7/index.m3u8 |
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
| OK | 新进职员姜会长 | 第1集 | https://vid.dbokutv.com/20260531/lxj-xjzyjhc-01-0129E2084.mp4/chunklist.m3u8 |
| OK | 我的王室死对头 | 第1集 | https://vid.dbokutv.com/20260509/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTaTtDpP7GjC34jC34oGJH3C3L2BcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
