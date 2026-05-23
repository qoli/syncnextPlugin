# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-23T04:30:16.399Z`
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
- Keyword: `千禧歌后`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%8D%83%E7%A6%A7%E6%AD%8C%E5%90%8E/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 千禧歌后 | 第1集 | https://europe.olemovienews.com/ts4/20260523/sDEscGib/mp4/sDEscGib.mp4/clipTo/184366/master.m3u8 |
| OK | 丧尸之王2 | 第1集 | https://europe.olemovienews.com/ts4/20260523/icveEpkC/mp4/icveEpkC.mp4/clipTo/97800/master.m3u8 |
| OK | 丞相府今日开饭 | 第1集 | https://europe.olemovienews.com/ts4/20260523/huqiggez/mp4/huqiggez.mp4/clipTo/82666/master.m3u8 |

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
| OK | 上伊那牡丹，酒醉身姿似百合花般 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_054faje74L2MwlZ1%2B9e5I7iczUZx8uU2DFJ%2B3IyFVr4F%2B%2Bv5eXWWWwRQQSTkPtsH7jt9VBt513kjkwU6vL9nBcrxmy09xfeCBgCXmaQt6Uvb%2FZJtCYBDNkPB |
| OK | 冻结地球 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6f18UTINgb3%2Bkkufrjsy74QqcVnAFEr7aZQKOV82S8Z6JOAmuze%2FUfHaOK1wfJe2HU%2BQmrMi4qWQuwOpqXBHKaqONgjovWNWHS9u026g%2BzbvZa%2F5WoL6s8DA |
| OK | 神之水滴 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_37a6OfODcgrQIpuI7INFaVprmd1CuVIEIgqMS4C%2Ffuuqh8TgI%2FIkacpw%2BxcmALWHcrW4CszOPyHGM0N8bxr3FAsXcori%2BIuv%2Bno6fF6dTUGMwnwO0F06OD4y |

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
- [OK] `GET 200` https://libvio.run/
- [OK] `GET 200` https://libvio.run/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `黑袍纠察队`
- URL: https://libvio.run/search/-------------.html?wd=%E9%BB%91%E8%A2%8D%E7%BA%A0%E5%AF%9F%E9%98%9F

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 大叔再出招 | 第01集 | https://v.vbing.me/2026/rh/5/Fifties.Professionals.S01/Fifties.Professionals.S01E01.mp4 |
| OK | 我的王室死对头 | 第01集 | https://v.vbing.me/2026/rh/5/My.Royal.Nemesis.S01/My.Royal.Nemesis.S01E01.mp4 |

Failed Case Diagnostics
- 黑袍纠察队 第五季 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://libvio.run/detail/714893349.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://libvio.run/detail/714893349.html

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
- Keyword: `大叔再出招`
- URL: https://www.thanju.com/search/%E5%A4%A7%E5%8F%94%E5%86%8D%E5%87%BA%E6%8B%9B.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 大叔再出招 | 01 | https://cdn.vvvip-plays33.cc/20260522/13861_320274ee/index.m3u8 |
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |
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
- Keyword: `电台明星`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%94%B5%E5%8F%B0%E6%98%8E%E6%98%9F&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 电台明星 | 第1集 | https://vid.dbokutv.com/20260404/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtbsRsGlR7XgBMHqRNWjC34jC355GZSuDZGuBcrmD0/chunklist.m3u8 |
| OK | 极致复仇：舍弃面容的家政妇 | 第1集 | https://vid.dbokutv.com/20260421/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHfTcyo5xOy6ejQdfcOtDnRN9aQdfcBJ0nBJ0nHJP2GKP1CovjS34/chunklist.m3u8 |
| OK | 刑警重回原点 | 第1集 | https://vid.dbokutv.com/20260425/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHfTcyo5xOy6ejU6fwQ7baBJ0nBJ0nC4D6DZH1HIvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
