# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-15T04:37:26.904Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | OK | OK 2/2 | OK | OK 3/3 | 5/5 | - |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `2`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1

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
- Keyword: `和男闺蜜旅行，祝好不送`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%92%8C%E7%94%B7%E9%97%BA%E8%9C%9C%E6%97%85%E8%A1%8C%EF%BC%8C%E7%A5%9D%E5%A5%BD%E4%B8%8D%E9%80%81/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 和男闺蜜旅行，祝好不送 | 第1集 | https://europe.olemovienews.com/ts4/20260515/EyGsaHnD/mp4/EyGsaHnD.mp4/clipTo/200360/master.m3u8 |
| OK | 余生不见旧时人 | 第1集 | https://europe.olemovienews.com/ts4/20260515/aizoqjiC/mp4/aizoqjiC.mp4/clipTo/182800/master.m3u8 |
| OK | 夫人以身入局，踏平一切 | 第1集 | https://europe.olemovienews.com/ts4/20260514/ffHfthko/mp4/ffHfthko.mp4/clipTo/254840/master.m3u8 |

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
- Keyword: `轮回的花瓣`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E8%BD%AE%E5%9B%9E%E7%9A%84%E8%8A%B1%E7%93%A3

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 轮回的花瓣 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_0059zqYeXpnltFgpI%2B37RmmujxbU1jda1TAAQIcKhXZNqk%2F4jdLjRHapcCMgQKJa%2Fh0N9g2hbF8hcTICzA%2BE6eKhdk3NvKtPT0d9iWeoF5JNZ9HpIFjN9tiK |
| OK | 剧场版 歌之王子殿下 TABOO NIGHT XXXX | 全集 | https://jx.wuzhoupai.com:8443/vip/?url=age_bb0cRg0%2FpLB9l8sJ9QlFqX7dQbLddVYTyMaHMWt4hUM8TwKl1ve%2FqpiHNoCwNyWH8Xvh5eNzjawbuKV97rnZyeNk |
| OK | 冰之城墙 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_5e46OhlxCA5lTAcLeUHGJ3mxphy5cfP90GzUXarC9ITQEsJGmUL8Y8WnJT45dZBOgik0Dyvx%2BcQpGdb%2F%2FJD%2BHx6N28agC9rqBUOTFXBeKTPr3euTb9nAqqL0 |

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
<summary>libvio · OK · conn=OK 2/2 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://libvio.run/
- [OK] `HEAD 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `卡罗尔`
- URL: https://libvio.run/search/-------------.html?wd=%E5%8D%A1%E7%BD%97%E5%B0%94

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 卡罗尔 | 1080P | https://v.vbing.me/2026/dy/5/Carol2015.mp4 |
| OK | 冰之城墙 | 第01集 | https://v3.vbing.me/2026/fun/4/The.Ramparts.of.Ice.S01/The.Ramparts.of.Ice.S01E01.mp4 |
| OK | 淡岛百景 | 第01集 | https://v3.vbing.me/2026/fun/4/Awajima.Hyakkei.S01/Awajima.Hyakkei.S01E01.mp4 |

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
- Keyword: `秒杀爱情`
- URL: https://www.thanju.com/search/%E7%A7%92%E6%9D%80%E7%88%B1%E6%83%85.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 秒杀爱情 | 01 | https://cdn.yzzy31-play.com/20260422/19875_bcc04bea/index.m3u8 |
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |
| OK | 红色珍珠 | 01 | https://cdn.vvvip-plays33.cc/20260224/8726_d6f84c02/index.m3u8 |

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
- Keyword: `未解决之女警视厅文件搜查`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E6%9C%AA%E8%A7%A3%E5%86%B3%E4%B9%8B%E5%A5%B3%E8%AD%A6%E8%A7%86%E5%8E%85%E6%96%87%E4%BB%B6%E6%90%9C%E6%9F%A5&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 未解决之女警视厅文件搜查官第3季 | 第1集 | https://vid.dbokutv.com/20260417/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBNTgQdfkQdDqTsfpOsTaCsejC34jC38uGJ4nDZasBcrmD0/chunklist.m3u8 |
| OK | 爱在连理里 | 第1集 | https://vid.dbokutv.com/20260404/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBM5wR6niBJ0nBJ0mGZb1EKOsCYvjS34/chunklist.m3u8 |
| OK | 那一夜我怀了社长的孩子 | 第1集 | https://vid.dbokutv.com/20260417/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsjsRsGlR7XgBMvvUNTeR7DZP6XwBJ0nBJ0oCJKvCJX2EIvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
