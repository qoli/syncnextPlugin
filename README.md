# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-21T04:53:36.281Z`
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
- Keyword: `楠木邸的神明庭院`
- URL: https://api.olelive.com/v1/pub/index/search/%E6%A5%A0%E6%9C%A8%E9%82%B8%E7%9A%84%E7%A5%9E%E6%98%8E%E5%BA%AD%E9%99%A2/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 楠木邸的神明庭院 | 第01集 | https://europe.olemovienews.com/ts4/20260404/u2qgd2s7/mp4/u2qgd2s7.mp4/master.m3u8 |
| OK | 春夏秋冬代行者 春之舞 | 第01集 | https://europe.olemovienews.com/ts4/20260328/ujll5z16/mp4/ujll5z16.mp4/master.m3u8 |
| OK | 云秀行 | 第01集 | https://europe.olemovienews.com/ts4/20260620/sweuhwom/mp4/sweuhwom.mp4/master.m3u8 |

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
| OK | 一叠间漫画咖啡屋生活！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_8ecezHlkoRAMxyrk62zqA3Qw9VVuGT%2FqzaIFL%2BdI3HIASG%2BSE%2FB4dBRjLSQnvgbSDNSfJeQ47KRXQylsjxNuoysxNioENVoIXGFnCFBm5Z6SIoHmiKrK2778 |
| OK | 主播女孩重度依赖 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_d369T9F5UyM7%2F9J4KEzH4zzv0fpuQbO42SecfwMBn%2F76lR2KAC6VOQb326O2QXFqffA7NP3i4sr0faQnrJLkNCKhUNnMiuXkGuRkuZ7tpNHWh8u2%2BWSkVDsM |
| OK | 楠木邸的神明庭院 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_83c55MYbn3umD9w5w%2BycQc7SFSri4anvX20EeVoGHU4wxC3ywkYEIxXUBuzHXWtKzpvqWnYl%2F0ZsO1FNIN8cnV0K%2ByTdF3IGtSlhPd4lUvc%2FnN4PjTzXy69B |

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
- Keyword: `黄泉的使者`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E9%BB%84%E6%B3%89%E7%9A%84%E4%BD%BF%E8%80%85

Playback Cases
- Not reached

Failed Case Diagnostics
- 黄泉的使者 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812956.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812956.html
- 新进职员姜会长 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813067.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813067.html
- 欠你的那场婚礼 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813147.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813147.html

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
| OK | 大叔再出招 | 01 | https://cdn.vvvip-plays33.cc/20260522/13861_320274ee/index.m3u8 |
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
- Keyword: `大叔再出招`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%A4%A7%E5%8F%94%E5%86%8D%E5%87%BA%E6%8B%9B&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 大叔再出招 | 第1集 | https://vid.dbokutv.com/20260524/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBMHpUcDwBJ0nBJ0nDqOuGKD3GovjS34/chunklist.m3u8 |
| OK | 我的王室死对头 | 第1集 | https://vid.dbokutv.com/20260509/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTaTtDpP7GjC34jC34oGJH3C3L2BcrmD0/chunklist.m3u8 |
| OK | 爱情有烟火 | 第1集 | https://vid.dbokutv.com/20260616/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsLsRsGlR7XgBM5nUNbeBJ0nBJ0nHJ4sE3P2HIvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
