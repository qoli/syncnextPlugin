# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-10T04:47:54.848Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Fatal | Fail 0/2 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: fatal_error:1

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
- Keyword: `规矩是你定的，破产是你选`
- URL: https://api.olelive.com/v1/pub/index/search/%E8%A7%84%E7%9F%A9%E6%98%AF%E4%BD%A0%E5%AE%9A%E7%9A%84%EF%BC%8C%E7%A0%B4%E4%BA%A7%E6%98%AF%E4%BD%A0%E9%80%89/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 规矩是你定的，破产是你选的 | 第01集 | https://europe.olemovienews.com/ts4/20260610/ojrwBydl/mp4/ojrwBydl.mp4/clipTo/146366/master.m3u8 |
| OK | 误入直播间，我清算一切 | 第01集 | https://europe.olemovienews.com/ts4/20260610/cludzauh/mp4/cludzauh.mp4/clipTo/178400/master.m3u8 |
| OK | 半生付出换心寒 | 第01集 | https://europe.olemovienews.com/ts4/20260610/cdjmhnzr/mp4/cdjmhnzr.mp4/clipTo/150920/master.m3u8 |

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
- Keyword: `欺诈游戏`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%AC%BA%E8%AF%88%E6%B8%B8%E6%88%8F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 欺诈游戏 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_f05bCBD4FiHbNms6cKA66c4G02i3QcytkUpNsom%2BZ8o8nQk%2FklqdHjISDDZVsZt4dLaYvYQRyboTNOF6z5rQdokLJM6CntnuKlo2wP7UKuXil%2B3az7tF4LAQ |
| OK | 左撇子艾伦 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_7ea94WXYV7Pm%2BM8VJ4ebgc7%2B7%2B97h8e03FnDu5CgFDmbF1B%2BLhA%2F9MXCFcURwRtOFGif2aJeNDl2I8VhWFDdSbb9l8LNkyHtUQcySpRpklplz9M7wWiXQtogyg |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_854eWsobtoMV0E2W9xYvO9NU%2BNZw%2F363pdCuUAFKqKpf6zdEQSBsZ8t9sjmmh%2FOKe6Z265sHwBXOPnywOYzJ%2BZ6vgLZM%2BAsvfvz5yqFd%2FtmrQaj1wrwH53Y0 |

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
<summary>libvio · Fatal · conn=Fail 0/2 · search=Empty · playback=Not Reached · reasons=connectivity_failed:1, search_empty:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Fatal`
- Cases: `0/2`
- Reasons: `connectivity_failed:1, search_empty:1`
- Note: libvio
- Fatal Errors:
  - `no medias returned; no medias returned`

Connectivity
- [FAIL] `GET 520` https://www.libvio.cam/ | status 520
- [FAIL] `GET 520` https://www.libvio.cam/search/-------------.html?wd=test | status 520

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.libvio.cam/search/-------------.html?wd=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.libvio.cam/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/ | status 520
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=test | status 520
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.libvio.cam/search/-------------.html?wd=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=test

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
- Keyword: `为时已是寿司`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E4%B8%BA%E6%97%B6%E5%B7%B2%E6%98%AF%E5%AF%BF%E5%8F%B8&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 为时已是寿司 | 第1集 | https://vid.dbokutv.com/20260409/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtXsRsGlR7XgBNTpUNDpSoqmCIqmC44nGq56EKOkRN0q/chunklist.m3u8 |
| OK | 安全距离 | 第1集 | https://vid.dbokutv.com/20260609/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsyxDx8Nj3aubh2ujJOMc1YMc1aPd9YX6faYbpQu64/chunklist.m3u8 |
| OK | 红了樱桃绿了芭蕉 | 第1集 | https://vid.dbokutv.com/20260609/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtDsRsGlR7XgBMXiUNHiR69nBJ0nBJ0mDZb6CpL5DYvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
