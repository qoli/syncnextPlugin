# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-24T04:43:11.598Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Not Reached | 2/5 | plugin_empty_view:3 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:3

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
- Keyword: `身为悲剧始作俑者的最强邪`
- URL: https://api.olelive.com/v1/pub/index/search/%E8%BA%AB%E4%B8%BA%E6%82%B2%E5%89%A7%E5%A7%8B%E4%BD%9C%E4%BF%91%E8%80%85%E7%9A%84%E6%9C%80%E5%BC%BA%E9%82%AA/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 身为悲剧始作俑者的最强邪恶BOSS女王为民竭心尽力。 第二季  | 第01集 | https://europe.olemovienews.com/ts4/20260407/qyzffytq/mp4/qyzffytq.mp4/master.m3u8 |
| OK | 婚姻剧毒 | 第01集 | https://europe.olemovienews.com/ts4/20260407/qn32ezk5/mp4/qn32ezk5.mp4/master.m3u8 |
| OK | 复制品的我也会谈恋爱 | 第01集 | https://europe.olemovienews.com/ts4/20260407/raj7vr58/mp4/raj7vr58.mp4/master.m3u8 |

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
| OK | 左撇子艾伦 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_bf2cVWWEp5PvusOF8Looic%2BS0EzYLb4NmP3qn5GbuANcVcV8P%2BR2lnylHrV43gqhJQL2f8eSVIBMJkPtAecmESc1F%2BkcDFx4She8oFDzyMt%2F%2FPo7K5vsh%2FOfwQ |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_db8cfjEFXtvz8zA%2FZWRLMngpJSwEfMWte%2FByggC%2FNTpyGiFfDghKFWqN1CeZMwZKzUh9Ag%2F4qwtsuzFE3Ev5Hn%2FY7oBMAXTwq9dq%2F9UgXZ3r6Hi3tZexudHQ |
| OK | 欺诈游戏 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_d269nD0WUAloIAfJF3Zz8QyurquS64oEZMKNAgCxGEZ8%2FLQzZ65HRk91wGsaoRDIrPn0bowhXJ%2FytK3EDZJ9w70WsslQ9nboDdBCc5UDMYHq82iTWCcaqXGG |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Not Reached · reasons=plugin_empty_view:3</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `plugin_empty_view:3`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `明天也要上班！`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%98%8E%E5%A4%A9%E4%B9%9F%E8%A6%81%E4%B8%8A%E7%8F%AD%EF%BC%81

Playback Cases
- Not reached

Failed Case Diagnostics
- 明天也要上班！ | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813171.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813171.html
- 曼哈顿打拼日记第一季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813071.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813071.html
- 河狸变身计划 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813172.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813172.html

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
| OK | 明天也要上班！ | 01 | https://cdn.yzzy28-play.com/20260622/31686_1f034ade/index.m3u8 |
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
| OK | 红色珍珠 | 第1集 | https://vid.dbokutv.com/20260226/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBt5sRsGlR7XgBMXpUdejC34jC312HZ4mCZ4pBcrmD0/chunklist.m3u8 |
| OK | 100天后分手的我和他 | 第1集 | https://vid.dbokutv.com/20260527/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHfTcyo5xOy6ejCJ0mT6XcSsHtQ7GjC34jC393D44oD3aqBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
