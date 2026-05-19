# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-19T04:40:43.095Z`
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
- Keyword: `娘亲桂芳`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A8%98%E4%BA%B2%E6%A1%82%E8%8A%B3/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 娘亲桂芳 | 第1集 | https://europe.olemovienews.com/ts4/20260519/raBqvhmE/mp4/raBqvhmE.mp4/clipTo/134566/master.m3u8 |
| OK | 你陪竹马复读，我继承千亿家产 | 第1集 | https://europe.olemovienews.com/ts4/20260519/rwyGdkAf/mp4/rwyGdkAf.mp4/clipTo/122833/master.m3u8 |
| OK | 灶火生香 | 第1集 | https://europe.olemovienews.com/ts4/20260519/IpckcaiB/mp4/IpckcaiB.mp4/clipTo/70400/master.m3u8 |

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
- Keyword: `尖帽子的魔法工坊`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%B0%96%E5%B8%BD%E5%AD%90%E7%9A%84%E9%AD%94%E6%B3%95%E5%B7%A5%E5%9D%8A

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 尖帽子的魔法工坊 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_cacdlM8g6CAYDjYMe3WP%2BU%2FhUbN9ZQqshVe4reIQQLH6zmagtdcxK1AEVVME2LW3XvuMQeKh9DimdBjv0DflbQw3X29%2BLNJ3aE89kWDGX8XpeT32hYas5SBK |
| OK | 日本三国 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_46881Y9FuCzlnhby0u0WlzzlOinDjfEstvxkGhehjC15CSw1i03G4wztXHU3LfARYfB73QMXRA%2FGhQ3NrjjnOs%2F5mWEL6Nx8TkPKyjwQ3FdcPMpzr0v1yxfi |
| OK | 木头风纪委员和迷你裙JK的故事 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_8fcdJxnWTUBKZ9g6S4lmIT4Loz3sEqYI%2BGwZFsJoeWIAeMGsa5VSwffy0CaoDEAHN8FheOsm3AG0zyBZha%2BXDSBGS7uFWbneK4TF7X3pTxzLoWDyps2F%2BEZO |

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
- Keyword: `尖帽子的魔法工坊`
- URL: https://libvio.run/search/-------------.html?wd=%E5%B0%96%E5%B8%BD%E5%AD%90%E7%9A%84%E9%AD%94%E6%B3%95%E5%B7%A5%E5%9D%8A

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 尖帽子的魔法工坊 | 第01集 | https://v3.vbing.me/2026/fun/4/Tongari.Boushi.no.Atelier.S01/Tongari.Boushi.no.Atelier.S01E01.mp4 |
| OK | 蔚蓝之春 | 第01集 | https://v.vbing.me/2026/rh/5/Azure.Spring.2026.S01/Azure.Spring.2026.S01E01.mp4 |
| OK | 达顿牧场 | 第01集 | https://v.vbing.me/2026/mj/5/Dutton.Ranch.S01/Dutton.Ranch.S01E01v2.mp4 |

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
- Keyword: `蔚蓝之春`
- URL: https://www.thanju.com/search/%E8%94%9A%E8%93%9D%E4%B9%8B%E6%98%A5.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 蔚蓝之春 | 01 | https://cdn.vvvip-plays33.cc/20260511/13520_2410f01c/index.m3u8 |
| OK | 稻草人 | 01 | https://cdn.vvvip-plays33.cc/20260420/12456_6a9edcb7/index.m3u8 |
| OK | 菜鸟炊事兵 | 01 | https://player.yzzyvip-35.com/20260511/6413_a543c921/index.m3u8 |

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
| OK | 没有砍十次还不倒的树 | 第1集 | https://vid.dbokutv.com/20260509/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsfsRsGlR7XgBMrvQtDZQ69aP7CjC34jC3CrCZCtHKCpBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
