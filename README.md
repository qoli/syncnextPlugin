# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-14T04:54:26.014Z`
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
- Keyword: `迷墙`
- URL: https://api.olelive.com/v1/pub/index/search/%E8%BF%B7%E5%A2%99/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 迷墙 | 第01集 | https://europe.olemovienews.com/ts4/20260607/41katr06/mp4/41katr06.mp4/master.m3u8 |
| OK | 迦楠大人的白给是恶魔级 | 第01集 | https://europe.olemovienews.com/ts4/20260404/cy7kychz/mp4/cy7kychz.mp4/master.m3u8 |
| OK | 朱音落语 | 第01集 | https://europe.olemovienews.com/ts4/20260404/sv3k052t/mp4/sv3k052t.mp4/master.m3u8 |

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
- Keyword: `一叠间漫画咖啡屋生活！`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%80%E5%8F%A0%E9%97%B4%E6%BC%AB%E7%94%BB%E5%92%96%E5%95%A1%E5%B1%8B%E7%94%9F%E6%B4%BB%EF%BC%81
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 一叠间漫画咖啡屋生活！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_06dboJ9r%2B8jDdWivfwgZRiV0%2B9xmD%2FgvdQQSCs31emSyiSW8sKO7UVADRos8KFGk6b6HBQPGCwsEpkNkbnad7ZIHEVhPX8EBzkR%2Bczl6q3eDb%2FfQJ7ny2js4 |
| OK | 主播女孩重度依赖 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_10acGb6A9m3sJBVkHNyGp7IxywwFhlVSgBMALdPl7wM6krYKuBRS4vqGx1IhiG3lrHIPmjl90Gjn4TK9X1rus8frtICPgyk8psyhLHyq%2Fsazf3uOYmtA7GIe |
| OK | 楠木邸的神明庭院 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_aa14cBoXNrCH3qxp%2BOBj%2BpUxBDhEXlUjHqp2UO4rKWGy%2B%2F3yqXRfe4OssnSKRpxARuct8ro%2F7AljrbdtUYS6LlYC%2F6yoc4s707YS5DPazelnlnDK0IIKL6kG |

Failed Case Diagnostics
- keyword:一叠间漫画咖啡屋生活！ | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%80%E5%8F%A0%E9%97%B4%E6%BC%AB%E7%94%BB%E5%92%96%E5%95%A1%E5%B1%8B%E7%94%9F%E6%B4%BB%EF%BC%81
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%80%E5%8F%A0%E9%97%B4%E6%BC%AB%E7%94%BB%E5%92%96%E5%95%A1%E5%B1%8B%E7%94%9F%E6%B4%BB%EF%BC%81

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
| OK | 我的王室死对头 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/ogrereAf8dQWWwnteMWnQhEYlQCMXr65BSPRF4?a=1335&x-tos-expires=1783941444&ch=3&cr=3&dr=6&x-tos-authkey=d4061f4299f2fac46e6988e41d4b2878&er=0&lr=test&x-expires=1789185872&cd=3%7C6%7C0%7C8&br=1709&x-tos-signature=7OP56g3VTj6MqkGUFmSJAtXbWwY8Fpzu3J3ezp55&bt=1503&cs=5&ds=3&ft=K0qkJZkg5pTblNrxoCd5&mime_type=video_mp4&x-signature=%2FwXEqHZAx3v9IY6TYyUDIXRgMAM%3D&qs=13&rc=g7AnEwr60rU0NzOcLDlf2BOM1M8dVTUeJw776Mq6XxPBvLlyIG%3D%3D&btag=a0000e679200000&dy_q=1778090211&l=20260521cca7646732007009d19cd6487&filename=BBA@ckfiv.mp4 |
| OK | 大叔再出招 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/osCb6fH6DAoqFJXaqiEEQMIeEBDIGaFg7q1RnH?x-tos-authkey=5371f6a4e9058d5ed3b6f2b4aefe7ea8&a=1646&ch=0&cr=7&dr=7&er=0&x-signature=wk2A1B6MA16WgkNApF1O3N%2FYGeQ%3D&lr=test&cd=5%7C4%7C0%7C3&br=1890&bt=1585&cs=3&x-expires=1789188576&ds=4&x-tos-expires=1781648183&ft=LxpxojwctO9lWT27etUp&mime_type=video_mp4&qs=13&x-tos-signature=vgDGSnKedrznUHYwWR2PsvTlLA4tJqpgoDbFypY5&rc=ChDuwj637rap8DtI2QdfcEiVEKbmBuKRDWwxL3WVtjPDjyXV7K%3D%3D&btag=a0000e272090000&dy_q=1778014864&l=20260521e46d401eab93a0ecafc4840b2&filename=BBA@ckfiv.mp4 |

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
- Keyword: `白日飞升`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%99%BD%E6%97%A5%E9%A3%9E%E5%8D%87&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 白日飞升 | 第1集 | https://vid.dbokutv.com/20260608/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsvsRsGlR7XgBM9oPdCjC34jC352H391D34mBcrmD0/chunklist.m3u8 |
| OK | 红了樱桃绿了芭蕉 | 第1集 | https://vid.dbokutv.com/20260609/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtDsRsGlR7XgBMXiUNHiR69nBJ0nBJ0mDZb6CpL5DYvjS34/chunklist.m3u8 |
| OK | 安全距离 | 第1集 | https://vid.dbokutv.com/20260609/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsyxDx8Nj3aubh2ujJOMc1YMc1aPd9YX6faYbpQu64/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
