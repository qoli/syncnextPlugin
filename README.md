# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-01T04:53:50.839Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | OK 1/1 | 3/5 | plugin_empty_view:2 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:2

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
- Keyword: `韵晚腹黑`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%9F%B5%E6%99%9A%E8%85%B9%E9%BB%91/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 韵晚腹黑 | 第1集 | https://europe.olemovienews.com/ts4/20260601/rxwBJkHE/mp4/rxwBJkHE.mp4/clipTo/174133/master.m3u8 |
| OK | 锦墨风华：重生后我踹了太子第三季 | 第1集 | https://europe.olemovienews.com/ts4/20260601/qAwdEBsk/mp4/qAwdEBsk.mp4/clipTo/152666/master.m3u8 |
| OK | 百年一念 | 第1集 | https://europe.olemovienews.com/ts4/20260601/tDchqjCt/mp4/tDchqjCt.mp4/clipTo/102800/master.m3u8 |

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
- Keyword: `淫狱团地`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%B7%AB%E7%8B%B1%E5%9B%A2%E5%9C%B0

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 淫狱团地 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_5afeRWX41KjATv4i59YNXuHHQ6J4d8sTbBLah3LDb%2FlYFhk4Ah0MvtfHiTxN8y0p%2FL0b3l5hmxLw7Ikzn6bBthCwzwSYB2QCGJ3PbdcYHH4XYPo%2Fp9JnmYYS |
| OK | 鲁邦三世：不死身的血族 | HD中字 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_3a15gXd9BTYI8XmZcd0TOePunAqHi4B9JhW4%2BIeuMe4SkqkjF4K8sxj2wYQF4eVJnAQQBM2JKKnCdiU3r0Tn0VWd5Q76ASbbexJqjidrfBp8sqFNfDq1HHhz |
| OK | 幽灵音乐会 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_2a0ckOEVZDX%2BD%2FcS9bSuj4qA4QE13xLreXT30XlQfVTbB5Rjcqyrn3LmLrsPpnirI9kBHUFjkUem2WlidwR7QVWNZ0pkqpsWhsw46KLthuKeD8oZBALhgq4V |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=OK 1/1 · reasons=plugin_empty_view:2</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `3/5`
- Reasons: `plugin_empty_view:2`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `瑞克和莫蒂第九季`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E7%91%9E%E5%85%8B%E5%92%8C%E8%8E%AB%E8%92%82%E7%AC%AC%E4%B9%9D%E5%AD%A3

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 隐秘的监察 | HD3播放 第01集 | https://cloudcube.wuxi.cn/cloudcube-jswx-person/PERSONCLOUD/ef4c4157-54a2-4c37-b246-7c3e6736606c.mp4?x-obs-traffic-limit=819200&X-Amz-Date=20260601T034943Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&x-amz-CLIENTTYPEIN=UNKNOWN&X-Amz-Credential=SZshenghuo/20260601/us-east-1/s3/aws4_request&x-amz-UID=10000004749791&response-content-disposition=attachment%3Bfilename%3DFiling.for.Love.S01E01.mp4&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=CORP&X-Amz-SignedHeaders=host&X-Amz-Expires=10800&x-amz-FSIZE=1069913536&x-amz-UFID=21466317118946879&X-Amz-Signature=5408b68eb62209f10664e3fdc0b1b13f0ad4a63602bebda1dc5586052fa4cfeb |

Failed Case Diagnostics
- 瑞克和莫蒂第九季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813057.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813057.html
- 丰臣兄弟！ | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812578.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812578.html

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
- Keyword: `新进职员姜会长`
- URL: https://www.thanju.com/search/%E6%96%B0%E8%BF%9B%E8%81%8C%E5%91%98%E5%A7%9C%E4%BC%9A%E9%95%BF.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 新进职员姜会长 | 01 | https://cdn.vvvip-plays33.cc/20260531/14095_1f3f1ae7/index.m3u8 |
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
- Keyword: `错付`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%94%99%E4%BB%98&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 错付 | 第1集 | https://vid.dbokutv.com/20260529/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsrsRsGlR7XgBMDcBJ0nBJ0nGpb2E30pE2vjS34/chunklist.m3u8 |
| OK | 给你爱情处方 | 第1集 | https://vid.dbokutv.com/20260202/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMfkON5ZPYqmCIqmCZKtEJX4CaCkRN0q/chunklist.m3u8 |
| OK | 监狱星级餐厅 | 第1集 | https://vid.dbokutv.com/20260525/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJWlQ7PlP2ysF3KMjJoy6fZT2qmCYqmCaKmEK8sD4GkRN0q/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
