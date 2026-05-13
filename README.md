# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-13T04:34:07.169Z`
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
- Keyword: `最弱法师：偷偷挂机成神`
- URL: https://api.olelive.com/v1/pub/index/search/%E6%9C%80%E5%BC%B1%E6%B3%95%E5%B8%88%EF%BC%9A%E5%81%B7%E5%81%B7%E6%8C%82%E6%9C%BA%E6%88%90%E7%A5%9E/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 最弱法师：偷偷挂机成神 | 第1集 | https://europe.olemovienews.com/ts4/20260513/HiwuagBw/mp4/HiwuagBw.mp4/clipTo/287066/master.m3u8 |
| OK | 七十二时辰亡国，我是临时皇帝 | 第七十二时辰亡国，我是临时皇帝-第1集集 | https://europe.olemovienews.com/ts4/20260513/cIvoxnAu/mp4/cIvoxnAu.mp4/clipTo/108066/master.m3u8 |
| OK | 仙门别等了，小师妹去魔族当团宠了 | 第第1集集 | https://europe.olemovienews.com/ts4/20260513/yeuwhFgd/mp4/yeuwhFgd.mp4/clipTo/300300/master.m3u8 |

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
| OK | 左撇子艾伦 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_92c4VdhSt2S%2Fk3CQ35czfGRLdyZ8Iq%2FH%2FhrwEpm6dmmlrS3Q%2FKmOhEifc3o0tZX19zIm3q32MSK1eRdy4uvgJYvtlpGLfzDSxD1RsTNJ8NPQfelCSE07JPEHQA |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6e26toqLjf59bBezW%2BhdpaQJ2GhaKwis4BAcvjAI8vj0ZzThbN9NUxef%2B1Qoa6ZVQm3KoEETDq9O16nItNNHNZDGvZ%2BwQ0w%2FFDi4Fgj5t7BPYfPSIcdj2sHE |
| OK | 婚姻剧毒 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_3244gHx3Dpvy%2BSVXwS9RBYWd7GeoKlS8gJrSJo0e8uxxXQvJat%2FbBTm4%2B8Q%2FsEEVvKk895ldOp37T70pGgRZqcaM5hZ7cmpf2meJVRkbeoIZMUvGDguaKMgE |

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
- [FAIL] `GET 403` https://www.czzy89.com | status 403
- [FAIL] `GET 403` https://www.czzy89.com/movie_bt/page/1 | status 403
- [FAIL] `GET 403` https://www.czzy89.com/boss1O1?q=test | status 403

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.czzy89.com/boss1O1?q=test
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.czzy89.com
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 403` https://www.czzy89.com | status 403
  - `GET 403` https://www.czzy89.com/movie_bt/page/1 | status 403
  - `GET 403` https://www.czzy89.com/boss1O1?q=test | status 403
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.czzy89.com/boss1O1?q=test
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 403` https://www.czzy89.com/boss1O1?q=test | safeline

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
- [OK] `HEAD 200` https://libvio.run/
- [OK] `HEAD 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `低智商犯罪`
- URL: https://libvio.run/search/-------------.html?wd=%E4%BD%8E%E6%99%BA%E5%95%86%E7%8A%AF%E7%BD%AA

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 乔治和曼迪的头婚生活 第二季 | 第01集 | https://v3.vbing.me/2025/oumei/10/Georgie.and.Mandys.First.Marriage.S02/Georgie.and.Mandys.First.Marriage.S02E01.mp4 |
| OK | 银河的一票 | 第01集 | https://v.vbing.me/2026/rh/4/The.Light.We.Cast.S01/The.Light.We.Cast.S01E01.mp4 |

Failed Case Diagnostics
- 低智商犯罪 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://libvio.run/detail/714893443.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://libvio.run/detail/714893443.html

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
- Keyword: `菜鸟炊事兵`
- URL: https://www.thanju.com/search/%E8%8F%9C%E9%B8%9F%E7%82%8A%E4%BA%8B%E5%85%B5.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 菜鸟炊事兵 | 01 | https://player.yzzyvip-35.com/20260511/6413_a543c921/index.m3u8 |
| OK | 蔚蓝之春 | 01 | https://cdn.vvvip-plays33.cc/20260511/13520_2410f01c/index.m3u8 |
| OK | 稻草人 | 01 | https://cdn.vvvip-plays33.cc/20260420/12456_6a9edcb7/index.m3u8 |

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
- Keyword: `稻草人`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%A8%BB%E8%8D%89%E4%BA%BA&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 稻草人 | 第1集 | https://vid.dbokutv.com/20260421/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHbTcyo5xOy6ejP6DoBJ0nBJ0oCJT1D491HIvjS34/chunklist.m3u8 |
| OK | 蔚蓝之春 | 第1集 | https://vid.dbokutv.com/20260512/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBNTiUcCjC34jC3CmGZCtDZT1BcrmD0/chunklist.m3u8 |
| OK | 菜鸟炊事兵 | 第1集 | https://vid.dbokutv.com/20260512/lxj-cncsb-01-014513E65.mp4/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
