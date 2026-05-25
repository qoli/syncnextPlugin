# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-25T04:50:08.337Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | Partial 2/3 | 4/5 | callback_timeout:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: callback_timeout:1

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
- Keyword: `护女狂龙：龙头老爹出山了`
- URL: https://api.olelive.com/v1/pub/index/search/%E6%8A%A4%E5%A5%B3%E7%8B%82%E9%BE%99%EF%BC%9A%E9%BE%99%E5%A4%B4%E8%80%81%E7%88%B9%E5%87%BA%E5%B1%B1%E4%BA%86/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 护女狂龙：龙头老爹出山了 | 第01集 | https://europe.olemovienews.com/ts4/20260525/qljBbnao/mp4/qljBbnao.mp4/clipTo/340900/master.m3u8 |
| OK | 旺夫嫡女，太子独宠我一人 | 第1集 | https://europe.olemovienews.com/ts4/20260525/ikatBjzG/mp4/ikatBjzG.mp4/clipTo/161033/master.m3u8 |
| OK | 殿下负责到底 | 第1集 | https://europe.olemovienews.com/ts4/20260525/fCjsCntk/mp4/fCjsCntk.mp4/clipTo/136100/master.m3u8 |

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
- Keyword: `淫狱团地`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%B7%AB%E7%8B%B1%E5%9B%A2%E5%9C%B0

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 淫狱团地 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_05beDvaPBsPgEa5cbXRaQN%2Bkq1j2lg0pHd%2Fs%2B%2FMY34Bx1HW%2BMD7soBUVOiZW4V6wxnu9maLgzcOkbyDQCMWRm0%2F3FKlmKHGurS5r3icCyU3GQfuPL9HS3dnd |
| OK | 幽灵音乐会 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_aedeBBZ3WWvntkbOfXhn7tjPepKLPRY2otW6zzu7jtQP4ulyW4HT%2BsuiUZFE3cot6DcWBo4rylxq7bl4eJsvfn1Ro3wrqDw2YRe7gz1j%2Bnmp6xeGVayYKafH |
| OK | 黑猫与魔女的教室 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_c131C8Gq5aRDz27xEblUWH2oBiqr66USbcKiPZWKtlrhHdQZ%2FKNGHuDwXstrRImoBNtzWE6aOEm8a2xDImlkpgrLgq6I9rF8%2B2oeNZOG4M%2FYmJm9aQCr%2FsZM |

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
<summary>libvio · Partial · conn=OK 2/2 · search=OK · playback=Partial 2/3 · reasons=callback_timeout:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `4/5`
- Reasons: `callback_timeout:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `摩绪`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%91%A9%E7%BB%AA

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 摩绪 | 蓝光G 第01话 | https://v16s.hypstarcdn.com/4afe653f799c84d46fdcf3b49375c9e2/6a17c6b2/video/tos/alisg/tos-alisg-ve-0051c001-sg/ocQiIpB7NhG0AfDp5FG6fsWD688DwEMgQrTPB9/?name=BBA |
| FAIL | 亢奋第三季 | 蓝光C 第01集 | callback_timeout |
| OK | 努力克服自卑的我们 | 蓝光G 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/o46p5eDYIABEK3j5faHgIz4FlDkcayFWZBR1NN?a=1531&ch=0&cr=4&dr=6&er=0&x-tos-expires=1781004153&lr=test&x-tos-authkey=56618d9b45f8507d945abd31fe4b4f5a&cd=4%7C4%7C0%7C4&br=1869&bt=1478&x-expires=1787455564&cs=6&x-signature=D3HPmNxrkb%2F1pPlJCoDLi4vuKL0%3D&ds=8&x-tos-signature=4hyOMcgEkS7qWlLmWYhJGCFgSLpjl1HSYN9bBSRG&ft=mpP6eZkFLfDoImGAXpz5&mime_type=video_mp4&qs=13&rc=q4EZiIldvXI3vYVIr2fuDsyOQJeXDfxQHm7SopQbPOHNapKCbc%3D%3D&btag=a0000e978900000&dy_q=1778076380&l=2026052109563e351d0496ad01161fe63&filename=bba.mp4 |

Failed Case Diagnostics
- 亢奋第三季 | 蓝光C 第01集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5812917.html
  - episodeURL: https://www.libvio.cam/play/5812917-4-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/play/5812917-4-1.html
  - `GET 200` https://www.libvio.cam/static/player/lbyy.js
  - `GET 200` https://www.libvio.cam/static/player/artplayer/?url=2f6a4a32747a7274493444644c65475a7731497551354c5153656d496e3246397a6f617a55727275776b343d&next=https%3A%2F%2Fwww.libvio.cam%2Fplay%2F2917-4-2.html
  - `POST 200` https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php

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
- Keyword: `努力克服自卑的我们`
- URL: https://www.thanju.com/search/%E5%8A%AA%E5%8A%9B%E5%85%8B%E6%9C%8D%E8%87%AA%E5%8D%91%E7%9A%84%E6%88%91%E4%BB%AC.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 努力克服自卑的我们 | 01 | https://cdn.yzzy31-play.com/20260418/19681_becb8597/index.m3u8 |
| OK | 隐秘的监察 | 01 | https://cdn.vvvip-plays33.cc/20260425/12786_5dacab03/index.m3u8 |
| OK | 给你爱情处方 | 01 | https://cdn.yzzyvip-29.com/20260201/16425_49d7d186/index.m3u8 |

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
- Keyword: `绯色潮汐`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%BB%AF%E8%89%B2%E6%BD%AE%E6%B1%90&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 绯色潮汐 | 第1集 | https://vid.dbokutv.com/20260524/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMPpOtWjC34jC34tDJ93CpanBcrmD0/chunklist.m3u8 |
| OK | 给你爱情处方 | 第1集 | https://vid.dbokutv.com/20260202/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMfkON5ZPYqmCIqmCZKtEJX4CaCkRN0q/chunklist.m3u8 |
| OK | 大唐迷雾第1季 | 第1集 | https://vid.dbokutv.com/20260524/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejP7HjTsGnQYqmCIqmCZD6E3D6E3GkRN0q/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
