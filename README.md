# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-13T04:48:39.776Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
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
- Keyword: `香港探秘地图【粤语】`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%A6%99%E6%B8%AF%E6%8E%A2%E7%A7%98%E5%9C%B0%E5%9B%BE%E3%80%90%E7%B2%A4%E8%AF%AD%E3%80%91/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 香港探秘地图【粤语】 | 第01集 | https://europe.olemovienews.com/ts4/20260518/y00skv3i/mp4/y00skv3i.mp4/master.m3u8 |
| OK | 香港探秘地图【国语】 | 第01集 | https://europe.olemovienews.com/ts4/20260518/m8r7r8cv/mp4/m8r7r8cv.mp4/master.m3u8 |
| OK | 镖人 第二季 | 第01集 | https://europe.olemovienews.com/ts4/20260611/tiw4y3r3/mp4/tiw4y3r3.mp4/master.m3u8 |

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
- Keyword: `上伊那牡丹，酒醉身姿似百`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%8A%E4%BC%8A%E9%82%A3%E7%89%A1%E4%B8%B9%EF%BC%8C%E9%85%92%E9%86%89%E8%BA%AB%E5%A7%BF%E4%BC%BC%E7%99%BE
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 上伊那牡丹，酒醉身姿似百合花般 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_02c2kbd5awVTpdizO6hENqrHXLZNBVT5gwE%2FbT4kiR4dZYjWgcPAtV0snGHJhc3lz6RyxctS80zU0sWnkanE9O4J52T8UZDiKB0vnbAO7pltXhzXZ1gvmRhn |
| OK | 冻结地球 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_d38cn9Va5WY23OqFbpwQkAlbwQCdggRu9fqZqXR3ipkmivcBd79FVyGuZhZUGkWAKhx82cOpScRj7mWXkeaVRMrczfa8wh1W4t%2FWQv%2BTUIXvKF36ACkyYHtX |
| OK | 神之水滴 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_e144ciQAHt7B75pens6V6bAspXVpuD6sSmqo9btaHGd4NqtLw2vzCBZ19PMEdjd%2FHd3GtxKhvgToJFZ5jV1JH7HTOR9b5pa2CNwTX93ivitYDXYm92SwB3os |

Failed Case Diagnostics
- keyword:上伊那牡丹，酒醉身姿似百 | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%8A%E4%BC%8A%E9%82%A3%E7%89%A1%E4%B8%B9%EF%BC%8C%E9%85%92%E9%86%89%E8%BA%AB%E5%A7%BF%E4%BC%BC%E7%99%BE
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%8A%E4%BC%8A%E9%82%A3%E7%89%A1%E4%B8%B9%EF%BC%8C%E9%85%92%E9%86%89%E8%BA%AB%E5%A7%BF%E4%BC%BC%E7%99%BE

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
- Keyword: `田锁兄弟`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E7%94%B0%E9%94%81%E5%85%84%E5%BC%9F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我的王室死对头 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/ogrereAf8dQWWwnteMWnQhEYlQCMXr65BSPRF4?x-tos-authkey=1de16a33e066bd390e4c5a17a98a22c2&a=1066&ch=0&cr=10&dr=5&er=0&x-expires=1781579135&lr=test&cd=2%7C8%7C0%7C6&br=1925&bt=1579&cs=5&x-tos-expires=1781942428&ds=8&ft=G6am78DN2dnncSYhvgx1&mime_type=video_mp4&x-signature=P4K%2BpTsw3RsIgCIc2y%2FqqlvtQYs%3D&qs=13&x-tos-signature=E2sUejzB9TQP0m5tGGXfPVDbpJVU9rF1ZIS5oeEc&rc=p63Bj2UnMvN0qVj47jzAVikOi7N1gp3FkJzNXvtn6O3VbKLuow%3D%3D&btag=a0000e865580000&dy_q=1778094942&l=202605219e1066faaa2bacbafc80ff820&filename=BBA@ckfiv.mp4 |
| OK | 大叔再出招 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/osCb6fH6DAoqFJXaqiEEQMIeEBDIGaFg7q1RnH?x-signature=KjATpr%2Bipks1rGSagK%2BttZP65bQ%3D&a=1701&ch=3&cr=4&x-expires=1781579677&dr=4&x-tos-expires=1782983309&er=0&x-tos-authkey=b6548327776ac6ade6647583d45aefe2&lr=test&cd=2%7C6%7C0%7C2&br=1508&bt=1593&cs=6&ds=4&ft=k21hDZ6OMJarHzD92yTv&mime_type=video_mp4&qs=13&x-tos-signature=6c62n7BOjpS2L9EVJeFAeXHpicykX8Iitvn5Qz8U&rc=Ty96yhLfDIKEkMziDsxePgzNUnhFM32T1X8Kr2OcyO5ZHLqPiT%3D%3D&btag=a0000e214660000&dy_q=1778070278&l=2026052118b743851502a951ff054e986&filename=BBA@ckfiv.mp4 |

Failed Case Diagnostics
- 田锁兄弟 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812921.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812921.html

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
- Keyword: `我的王室死对头`
- URL: https://www.thanju.com/search/%E6%88%91%E7%9A%84%E7%8E%8B%E5%AE%A4%E6%AD%BB%E5%AF%B9%E5%A4%B4.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我的王室死对头 | 01 | https://cdn.vvvip-plays33.cc/20260508/13433_c7876d6b/index.m3u8 |
| OK | 大叔再出招 | 01 | https://cdn.vvvip-plays33.cc/20260522/13861_320274ee/index.m3u8 |
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
- Keyword: `我们愉快的好日子`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E6%88%91%E4%BB%AC%E6%84%89%E5%BF%AB%E7%9A%84%E5%A5%BD%E6%97%A5%E5%AD%90&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我们愉快的好日子 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTjUMjaQ79wBJ0nBJ0mGaGoCpKpHYvjS34/chunklist.m3u8 |
| OK | 大叔再出招 | 第1集 | https://vid.dbokutv.com/20260524/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBMHpUcDwBJ0nBJ0nDqOuGKD3GovjS34/chunklist.m3u8 |
| OK | 我的王室死对头 | 第1集 | https://vid.dbokutv.com/20260509/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTaTtDpP7GjC34jC34oGJH3C3L2BcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
