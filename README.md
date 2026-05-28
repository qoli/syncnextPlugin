# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-28T04:45:10.684Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
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
- Keyword: `重回八零，拆穿假死前夫`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%87%8D%E5%9B%9E%E5%85%AB%E9%9B%B6%EF%BC%8C%E6%8B%86%E7%A9%BF%E5%81%87%E6%AD%BB%E5%89%8D%E5%A4%AB/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 重回八零，拆穿假死前夫 | 第1集 | https://europe.olemovienews.com/ts4/20260528/dhEfkafw/mp4/dhEfkafw.mp4/clipTo/159600/master.m3u8 |
| OK | 我的猫不好惹 | 第1集 | https://europe.olemovienews.com/ts4/20260528/gsquewdb/mp4/gsquewdb.mp4/clipTo/143033/master.m3u8 |
| OK | 开局半瓶水，结局御苍龙 | 第1集 | https://europe.olemovienews.com/ts4/20260528/FzdcrgiF/mp4/FzdcrgiF.mp4/clipTo/138200/master.m3u8 |

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
- Keyword: `加油吧！中村君!!`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B!!
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 加油吧！中村君!! | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_700bX2PeY1NJ4LKqqB%2BAAkmF5%2FhoiJOE0dr0MlVWx4EbTzBHle3WE7ipAyM445wJjXrqnlBFrOBHCbIvigskXcrk%2FMDOfk5q9LuXcvhsWhumJ8YtqhFYhhIY |
| OK | 最强王者的第二人生 第二季 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_f61fWlHWMsglTqkjtYE7yfarR1bHd8XqxSl5T6JwGo50iews7tnS%2Bf7tFJr42MTvRDAwToZ2FieUv4cNFXN%2F9aLsHdZgTwW9RdYoa6UUhobdn8o7dEQFUkmo |
| OK | Candy Caries 蛀在糖糖里 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6169uMdjdrPj%2BbWDKS2eDk%2BX2DoRlkfcoI2dXu%2FBm%2BxOeZBx7tOOqPkSCgbLE1IIFEnAnltPwRshPvnMGz13N16mehdJLM8S0URH9n8ndLD65T04mr%2FUMTL1 |

Failed Case Diagnostics
- keyword:加油吧！中村君!! | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B!!
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%8A%A0%E6%B2%B9%E5%90%A7%EF%BC%81%E4%B8%AD%E6%9D%91%E5%90%9B!!

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
<summary>libvio · OK · conn=OK 2/2 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `租借女友第五季`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E7%A7%9F%E5%80%9F%E5%A5%B3%E5%8F%8B%E7%AC%AC%E4%BA%94%E5%AD%A3

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 租借女友第五季 | HD7播放 第01话 | https://v16-aiop.bytepluscdn.com/ecfaa9f415b4847447f44cf21108c1b1/6a1bb523/video/tos/alisg/tos-alisg-ve-0051c001-sg/o0VB9NpIWPrD5BaVg1QVlfEmFDANXn1q888MeQ/?name=BBA |
| OK | 异兽魔都第二季 | HD7播放 第01话 | https://v16-aiop.bytepluscdn.com/02ef3fec0a4744b31f4c16a86b37c5ed/6a1baebf/video/tos/alisg/tos-alisg-ve-0051c001-sg/o8e6QQyTqDAiYU0gsSFsBNpqWDYgkBizInfxaE/?name=BBA |
| OK | 秒杀爱情 | HD7播放 第01集 | https://lf26-imcloud-file-sign.bytetos.com/tos-cn-v-5f73e7/ogfaEtt2V6unTxIpcVA0E3ndQcitg0DL9CBm4i?a=1990&ch=1&cr=3&dr=9&x-tos-expires=1780132384&er=0&x-tos-signature=aYE4YC6L0pGwqqIcme8pJ63W28hvTzxL0ARUijlg&lr=test&cd=3%7C4%7C0%7C9&x-tos-authkey=7b4dd90329801ac5083a40ad0c9cf127&br=1515&bt=1482&cs=6&ds=4&x-expires=1787713785&ft=NNJiG1dPzPZ3N9HYPUpW&x-signature=gfHIrkzmRJcRfEV%2Fooyya0AwlcI%3D&mime_type=video_mp4&qs=13&rc=pAuKF7nORuRWJGW0ZCFIVp39dhRvbLbRlyUbl5yfdySv7JEAYy%3D%3D&btag=a0000e357930000&dy_q=1778099213&l=2026052164071709aadc831d0fb539c98&filename=bba.mp4 |

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
| OK | 赌金 | 01 | https://player.yzzyvip-35.com/20260429/5623_44bf89b6/index.m3u8 |
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
- Keyword: `月夜行路答案在名作中`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E6%9C%88%E5%A4%9C%E8%A1%8C%E8%B7%AF%E7%AD%94%E6%A1%88%E5%9C%A8%E5%90%8D%E4%BD%9C%E4%B8%AD&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 月夜行路答案在名作中 | 第1集 | https://vid.dbokutv.com/20260410/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtfsRsGlR7XgBNbvU6naONfjUdejC34jC3CnDJWqCJWrBcrmD0/chunklist.m3u8 |
| OK | 绯色潮汐 | 第1集 | https://vid.dbokutv.com/20260524/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMPpOtWjC34jC34tDJ93CpanBcrmD0/chunklist.m3u8 |
| OK | BORDERLESS广域移动搜查队 | 第1集 | https://vid.dbokutv.com/20260410/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHeTcyo5xOy6ejOcyvCZAvDZAvkREyNbaSsDaBJ0nBJ0oGZCvGJCsDYvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
