# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-23T04:40:50.001Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | Empty | OK 2/2 | 2/5 | connectivity_failed:1, search_empty:1, unknown:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Partial 1/2 | 3/5 | callback_timeout:1, plugin_empty_view:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `4`
- `plugin_olevod` 新歐樂影院: unknown:1
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: callback_timeout:1, plugin_empty_view:1

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
- Keyword: `天才瑞普利2`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A4%A9%E6%89%8D%E7%91%9E%E6%99%AE%E5%88%A92/vod/0/1/4
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 尖帽子的魔法工坊 | 第01集 | https://europe.olemovienews.com/ts4/20260407/3tmyuahz/mp4/3tmyuahz.mp4/master.m3u8 |
| OK | 异世界悠闲农家 第二季 | 第01集 | https://europe.olemovienews.com/ts4/20260406/iy9618lf/mp4/iy9618lf.mp4/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401
- keyword:天才瑞普利2 | stage=`search` | reason=`search_empty`
  - detailURL: https://api.olelive.com/v1/pub/index/search/%E5%A4%A9%E6%89%8D%E7%91%9E%E6%99%AE%E5%88%A92/vod/0/1/4
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/index/search/%E5%A4%A9%E6%89%8D%E7%91%9E%E6%99%AE%E5%88%A92/vod/0/1/4?_vv=3910982cbf21079cbfa1438608e32df0
- 天才瑞普利2 | stage=`episodes` | reason=`unknown`
  - detailURL: https://api.olelive.com/v1/pub/vod/detail/82688/true
  - detail: no episodes
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/vod/detail/82688/true?_vv=90e0991ffaf106840031423054432cdf

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
- Keyword: `日本三国`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%97%A5%E6%9C%AC%E4%B8%89%E5%9B%BD

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 日本三国 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_3ec3wWbZpdEqdRkoMaa4pNgTr9Pky3V2e9ukN3qykGb%2Fl%2BrHLGCZexEz8vvcMnPOaW2ThysPXTR4YKU4whLagGdl67MCfQSyZ5jdnjQSvJtwytYzio06gocK |
| OK | 尖帽子的魔法工坊 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_fe14hYz%2FzXz%2FgRgPdGJkgAMYdU76Mj5WqZTFBLVIqyIm7cVxDFSsxdV%2Fry9OMNbTvJMY4Cu9WPU9rsUuWzNZHVpakb11zelywiJuGhTQfZyk1X7iHrWEgf4L |
| OK | 木头风纪委员和迷你裙JK的故事 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_38abS2NAr3xzEb8%2FaLsC1%2FlxTJNGOCtnoxM1QVXXz6mGmbwyqyHzZ0AIxTgEtgNS%2BR7TLgrLUMGuk5vZbbgJzOJPQBwfHmwyMdfJsBVTkYbRINZDC5F9fck4 |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Partial 1/2 · reasons=callback_timeout:1, plugin_empty_view:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `3/5`
- Reasons: `callback_timeout:1, plugin_empty_view:1`
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
| FAIL | 欺诈游戏 | HD7播放 第01话 | callback_timeout |
| OK | 尖帽子的魔法工坊 | HD7播放 第01话 | https://v16-aiop.bytepluscdn.com/02dfca09d3f08515668f209e0ade2689/6a3e07bd/video/tos/alisg/tos-alisg-ve-0051c001-sg/o4YaweatBEv33T1AAdiUQCNTRBfFp2BIi5gsD0/?filename=BBA@ckfiv.mp4 |

Failed Case Diagnostics
- 欺诈游戏 | HD7播放 第01话 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5812943.html
  - episodeURL: https://www.libvio.cam/play/5812943-4-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5812943-4-1.html
  - `GET 200` https://www.libvio.cam/static/player/BBA.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=5a614d573035683671514d427666614858436639717062517a56564d384b727969633577367561636e737330436869507966666d7661666a68444374316c50684f4a433155707a44504c36576f5948367a435952454c76374b713159316779364b34415843324249345a33356235653934705131375835586d517574707a41366e69315348704c56615769764b7156584b4649467233504d58487a5356364b693747714959706c305852326c34385166335a4d4e566f392f423336303759504f2f2f366d4a73734d4b4a54774258732f634b4e4d782b31315638673447516c7142594b58436646766b595370443054534974694e70714e54345169516e42323858344f6e43393170504141674b62536444695a4b625850716635496a6f6b505236616850534f464c37364c644337466571745531516349436848625135746670725649363231366d666849774779785176353642765879336f75692b4f50496d51666c6652333465356d66764969754359363767503150636c77746a686c71774b5376586159346d6f374544377863753175714c777333315842503265326b6f2f5844314878442f31364c2b4f39614d6a4d5176786d38497573433264546e346e6773774f5a316674722b493745386d51632f6d4d6e6f4c774965386f4139645735516a4a386f684447427072495049617374704c6b775037323074305658754c31536e416a4d43636e6e317a374b444b6d706379564b33443433494662524562396c425578394541533569382b73793369575a617741706d6f43796449596d&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F2943-4-2.html
  - `POST 200` https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php
- 医到孤岛爱上你 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813068.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813068.html

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
- Keyword: `明天也要上班！`
- URL: https://www.thanju.com/search/%E6%98%8E%E5%A4%A9%E4%B9%9F%E8%A6%81%E4%B8%8A%E7%8F%AD%EF%BC%81.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 明天也要上班！ | 01 | https://cdn.yzzy28-play.com/20260622/31686_1f034ade/index.m3u8 |
| OK | 医到孤岛爱上你 | 01 | https://cdn.yzzy31-play.com/20260601/21399_07e6663e/index.m3u8 |
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |

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
- Keyword: `白夜暗影`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%99%BD%E5%A4%9C%E6%9A%97%E5%BD%B1&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 白夜暗影 | 第1集 | https://vid.dbokutv.com/20260620/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtXsRsGlQ79nBM9vONajC34jC354HJWuCp4vBcrmD0/chunklist.m3u8 |
| OK | 妻本善良 | 第1集 | https://vid.dbokutv.com/20260618/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHcTcyo5xGvE9QuiJcs5fWObfWP6QCY8HoOcfSsk1K/chunklist.m3u8 |
| OK | 一念初见锦衣谣 | 第1集 | https://vid.dbokutv.com/20260620/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsvsRsGlQ79nBNbkOsfgUNajC34jC316Gp4qHZ11BcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
