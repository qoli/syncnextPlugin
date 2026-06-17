# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-17T04:53:48.451Z`
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
- Keyword: `女神“异世界转生想成为什`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A5%B3%E7%A5%9E%E2%80%9C%E5%BC%82%E4%B8%96%E7%95%8C%E8%BD%AC%E7%94%9F%E6%83%B3%E6%88%90%E4%B8%BA%E4%BB%80/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 女神“异世界转生想成为什么”我“勇者的肋骨” | 第01集 | https://europe.olemovienews.com/ts4/20260408/ek0bsgur/mp4/ek0bsgur.mp4/master.m3u8 |
| OK | 当前、正被打扰中！ | 第01集 | https://europe.olemovienews.com/ts4/20260408/bz5jtdzz/mp4/bz5jtdzz.mp4/master.m3u8 |
| OK | 炽夏 | 第01集 | https://europe.olemovienews.com/ts4/20260616/055nrckc/mp4/055nrckc.mp4/master.m3u8 |

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
| OK | 左撇子艾伦 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_f5b8jApyDR8SksEYgxB9dRKyVFlHVSGS8fjGqTFi%2Fyv89SXaKDomHhuD%2FBHsqGNwNnNx4ycqWyaJuykTSivkOGDa9ZiqMp3CK2ee3HywjjBwEppiuLNX4KyXmw |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_97e4RvLWenNT0MY8WxcksleD7wnX%2FEOi2Fh3lbyu2pjBQFdpgGGRqaCannRKi5xEfbAZGTrF0m8NAga91kUTjxvgZ7%2B%2B8BeUGY2NwZdfJBIi7yzJcNtXgJ64 |
| OK | 想结束这场“我爱你”的游戏 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_02c2kbd5awVTpdizO6gTY67CAeEUU13wgwAwYmgkiR4dZYjWgcPAtV0snGHJhc3lz6RyxctS80zU0sWnkanE8O4J52L7XZC1LB98mLZf6JltXhzXZ1gvmRhn |

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
- Keyword: `寡妇湾`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E5%AF%A1%E5%A6%87%E6%B9%BE

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 寡妇湾 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/oMIrIETOn4HfIFczGBIc85LP6e0CKAesIO1CtQ?a=1429&x-expires=1781927530&ch=0&x-tos-expires=1783186189&cr=3&dr=2&er=0&lr=test&x-tos-signature=tuDNpHIL2DuOf8EL7L5OY13SiOO6kZnE7W63JPF7&cd=5%7C4%7C0%7C5&br=1769&x-tos-authkey=cf1ad64ff5ad03b36b3f4ed51c156bf3&bt=1483&cs=4&ds=7&ft=Z1NeFbPbVRqj9HjaxhV2&x-signature=iv444uKoz8DSWq1w%2BPzqpBVX578%3D&mime_type=video_mp4&qs=13&rc=M0WZgP93htAJqx8OMrRsqeDR3ustPPMByh71MRt8RuL4WYrVaM%3D%3D&btag=a0000e194860000&dy_q=1778054696&l=20260521387a8836c018247123d846bcb&filename=BBA@ckfiv.mp4 |

Failed Case Diagnostics
- 克拉克森的农场第五季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813074.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813074.html
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
- Keyword: `医到孤岛爱上你`
- URL: https://www.thanju.com/search/%E5%8C%BB%E5%88%B0%E5%AD%A4%E5%B2%9B%E7%88%B1%E4%B8%8A%E4%BD%A0.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 医到孤岛爱上你 | 01 | https://cdn.yzzy31-play.com/20260601/21399_07e6663e/index.m3u8 |
| OK | 菜鸟炊事兵 | 01 | https://player.yzzyvip-35.com/20260511/6413_a543c921/index.m3u8 |
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
- Keyword: `女画师`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%A5%B3%E7%94%BB%E5%B8%88&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 女画师 | 第1集 | https://vid.dbokutv.com/20260616/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtPsRsGlQ79nBMveSoqmCIqmCaL3GpH2GZ0kRN0q/chunklist.m3u8 |
| OK | 安全距离 | 第1集 | https://vid.dbokutv.com/20260609/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsyxDx8Nj3aubh2ujJOMc1YMc1aPd9YX6faYbpQu64/chunklist.m3u8 |
| OK | 所爱之人 | 第1集 | https://vid.dbokutv.com/20260411/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejSs5wSYqmCIqmCZ4pE3GnHJGkRN0q/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
