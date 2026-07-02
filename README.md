# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-02T04:39:55.108Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
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
- Keyword: `半熟恋人`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%8D%8A%E7%86%9F%E6%81%8B%E4%BA%BA/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 半熟恋人 第五季 | 第20260601期上 | https://europe.olemovienews.com/ts4/20260601/srkzx1rk/mp4/srkzx1rk.mp4/master.m3u8 |
| OK | 花样少年少女 第2季 | 第01集 | https://europe.olemovienews.com/ts4/20260701/yrkf6d4h/mp4/yrkf6d4h.mp4/master.m3u8 |
| OK | 女主角？圣女？不，我是杂役女仆（自豪）！ | 第01集 | https://europe.olemovienews.com/ts4/20260701/lj1u7arn/mp4/lj1u7arn.mp4/master.m3u8 |

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
- Keyword: `女主角？圣女？不，我是杂`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%A5%B3%E4%B8%BB%E8%A7%92%EF%BC%9F%E5%9C%A3%E5%A5%B3%EF%BC%9F%E4%B8%8D%EF%BC%8C%E6%88%91%E6%98%AF%E6%9D%82
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 女主角？圣女？不，我是杂役女仆（自豪）！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_9905SD3kcU6QGfsj8MR0rORqjHFgSgmC5NjYfuApjVDNvYvHTd9QDfUWjsEA2AvIqJIgLlufyL3lNg7q6JLtUEYSMJxnJlA8us6GqM2yc7ZHA0%2B7XkTNvLJp45vs79YtvfTWz3aDyECY7pbGPld1ZNYVc5LdVGA |
| OK | Candy Caries 蛀在糖糖里 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_3cd9zOzNkY%2Fal9hkMrbTvV2Cywhw%2F%2BtFjwx%2BSn1rJ%2FrQEMq44NxMKHuTnJZ8YwPYgOdSfQ5CPXqMZrghx6kzrQZ5X8AuzMA4UTDRr2U7dotNr3VwBgarTq%2FT |
| OK | 欺诈游戏 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_01bd8Ps2H5oiUGVAceAALl%2F%2BZlzR6HfokQfNfhL5kP0PRMS4Mo6PVjDU4fI6UW%2Bc0rsT1PYDaiYlmVJH%2B6w1AtoKmOM39bPgHhxvPq0SsYR%2BXsQpcqZj4emp |

Failed Case Diagnostics
- keyword:女主角？圣女？不，我是杂 | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%A5%B3%E4%B8%BB%E8%A7%92%EF%BC%9F%E5%9C%A3%E5%A5%B3%EF%BC%9F%E4%B8%8D%EF%BC%8C%E6%88%91%E6%98%AF%E6%9D%82
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%A5%B3%E4%B8%BB%E8%A7%92%EF%BC%9F%E5%9C%A3%E5%A5%B3%EF%BC%9F%E4%B8%8D%EF%BC%8C%E6%88%91%E6%98%AF%E6%9D%82

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
- Keyword: `艾丽第一季`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E8%89%BE%E4%B8%BD%E7%AC%AC%E4%B8%80%E5%AD%A3

Playback Cases
- Not reached

Failed Case Diagnostics
- 艾丽第一季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813254.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813254.html
- X战警97第二季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813253.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813253.html
- 福尔摩斯小姐3 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813251.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813251.html

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
- Keyword: `第一个男人`
- URL: https://www.thanju.com/search/%E7%AC%AC%E4%B8%80%E4%B8%AA%E7%94%B7%E4%BA%BA.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |
| OK | 红色珍珠 | 01 | https://cdn.vvvip-plays33.cc/20260224/8726_d6f84c02/index.m3u8 |
| OK | 我们愉快的好日子 | 01 | https://player.yzzyvip-35.com/20260331/3348_333cb763/index.m3u8 |

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
- Keyword: `长安女子鉴`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%95%BF%E5%AE%89%E5%A5%B3%E5%AD%90%E9%89%B4&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 长安女子鉴 | 第1集 | https://vid.dbokutv.com/20260625/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xGvE9QniBSycejC34jC3CrC4OmDZWqBcrmD0/chunklist.m3u8 |
| OK | 红色珍珠 | 第1集 | https://vid.dbokutv.com/20260226/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBt5sRsGlR7XgBMXpUdejC34jC312HZ4mCZ4pBcrmD0/chunklist.m3u8 |
| OK | 我们愉快的好日子 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTjUMjaQ79wBJ0nBJ0mGaGoCpKpHYvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
