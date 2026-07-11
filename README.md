# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-11T05:48:11.159Z`
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
- Keyword: `非份之罪【粤语】`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%9D%9E%E4%BB%BD%E4%B9%8B%E7%BD%AA%E3%80%90%E7%B2%A4%E8%AF%AD%E3%80%91/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 非份之罪【粤语】 | 第01集 | https://europe.olemovienews.com/ts4/20260629/b4olib5y/mp4/b4olib5y.mp4/master.m3u8 |
| OK | 非份之罪【国语】 | 第01集 | https://europe.olemovienews.com/ts4/20260629/1qxpuyz9/mp4/1qxpuyz9.mp4/master.m3u8 |
| OK | 种墨园 | 第01集 | https://europe.olemovienews.com/ts4/20260623/pecs731v/mp4/pecs731v.mp4/master.m3u8 |

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
- Keyword: `地狱模式`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%9C%B0%E7%8B%B1%E6%A8%A1%E5%BC%8F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 地狱模式 ～喜欢速通游戏的玩家在废设定异世界无双～ 第2季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_cae9yk6iISaf0yR2cXd3SlFhpLS%2Bjn%2BJrv%2BgE6ZGdiLbKhv1uqbTzL5ajO3sm5gD9YPe%2BCbNb%2FRgjPXZWv0BPv9WsaNOMCsYNPDDF7zBUUDKiZdgE9wnFTpx |
| OK | 正后方的神威 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_b402p2qu3kgy%2FZ%2B%2B%2FgPaKobV52VBPQ%2FtXYZOorhrH2g2KwqnUM8%2FLY80qg8c5g2L5e2SJPJd9jmJhuJ9zkfpHfCsNlUs1NZ1k3jZSd6XY3L9gsizAV4xsVFY |
| OK | 我家的弟弟们真是让您费心了 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_e6c0rPNPcsn3R3F0888KEwVPBY8Jj%2BK7sN9hEZpKBiGu1xE0ZXFJm3kaIwKSkEh4iZFnMIv6%2BDJQhv0XkzVU855C1GapVPq1AeOLm4%2FmWgyI0GDWDcSh3qdj |

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
- [FAIL] `GET 403` https://www.libvios.com/ | status 403
- [FAIL] `GET 403` https://www.libvios.com/search/-------------.html?wd=test | status 403

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.libvios.com/search/-------------.html?wd=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.libvios.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 403` https://www.libvios.com/ | status 403
  - `GET 403` https://www.libvios.com/search/-------------.html?wd=test | status 403
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.libvios.com/search/-------------.html?wd=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 403` https://www.libvios.com/search/-------------.html?wd=test

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
- Keyword: `我们愉快的好日子`
- URL: https://www.thanju.com/search/%E6%88%91%E4%BB%AC%E6%84%89%E5%BF%AB%E7%9A%84%E5%A5%BD%E6%97%A5%E5%AD%90.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我们愉快的好日子 | 01 | https://player.yzzyvip-35.com/20260331/3348_333cb763/index.m3u8 |
| OK | 红色珍珠 | 01 | https://cdn.vvvip-plays33.cc/20260224/8726_d6f84c02/index.m3u8 |
| OK | 家庭关系证明书 | 01 | https://cdn.yzzyvip-29.com/20260707/25534_f5011865/index.m3u8 |

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
| OK | 谜案拼图 | 第1集 | https://vid.dbokutv.com/20260630/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtDsRsGlQ79nBMrXS7GjC34jC315CqOoGaH3BcrmD0/chunklist.m3u8 |
| OK | 艾米丽与玛丽亚 | 第1集 | https://vid.dbokutv.com/20260622/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHbTcyo5xOy6ejOMriUMriUIqmCIqmCZOtDa8nDp0kRN0q/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
