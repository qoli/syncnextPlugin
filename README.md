# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-04-07T22:55:06.856Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | OK | OK 1/3 | OK | OK 3/3 | 5/5 | - |
| 新 AGE 動漫 | plugin_age | Partial | OK 2/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| 廠長資源 | plugin_czzy | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| YouKnowTV | plugin_youknow | Partial | OK 3/3 | Empty | OK 3/3 | 4/5 | search_empty:1 |
| libvio | plugin_libvio | OK | OK 2/2 | OK | OK 3/3 | 5/5 | - |
| 韩剧网 | plugin_thanju | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `1`
- `plugin_thanju` 韩剧网: fatal_error:1

### Plugin Details

<details>
<summary>新歐樂影院 · OK · conn=OK 1/3 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_olevod`
- Entry: `新歐樂影院`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: 海外 IP 無廣告

Connectivity
- [OK] `HEAD 200` https://www.olevod.tv/
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401

Search
- Status: `OK`
- Keyword: `女魃传奇`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A5%B3%E9%AD%83%E4%BC%A0%E5%A5%87/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 女魃传奇 | 第第1集集 | https://europe.olemovienews.com/ts4/20260407/wojefzBh/mp4/wojefzBh.mp4/clipTo/350033/master.m3u8 |
| OK | 真千金的豪门求生指南 | 第01集 | https://europe.olemovienews.com/ts4/20260407/kooxBGfa/mp4/kooxBGfa.mp4/clipTo/149766/master.m3u8 |
| OK | 再见裴医生你的替身游戏已结束 | 第01集 | https://europe.olemovienews.com/ts4/20260407/aijslhys/mp4/aijslhys.mp4/clipTo/223700/master.m3u8 |

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
- Keyword: `和班上第二可爱的女孩成为`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%92%8C%E7%8F%AD%E4%B8%8A%E7%AC%AC%E4%BA%8C%E5%8F%AF%E7%88%B1%E7%9A%84%E5%A5%B3%E5%AD%A9%E6%88%90%E4%B8%BA
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 和班上第二可爱的女孩成为朋友 | 第01集 | https://vip.ffzy-plays.com/20260407/52156_c10f93a3/index.m3u8 |
| OK | 婚姻剧毒 | 第01集 | https://vip.ffzy-plays.com/20260407/52155_b99c30c0/index.m3u8 |
| OK | 复制品的我也会谈恋爱。 | 第01集 | https://vip.ffzy-plays.com/20260407/52154_182970cd/index.m3u8 |

Failed Case Diagnostics
- keyword:和班上第二可爱的女孩成为 | stage=`search` | reason=`search_empty`
  - detailURL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%92%8C%E7%8F%AD%E4%B8%8A%E7%AC%AC%E4%BA%8C%E5%8F%AF%E7%88%B1%E7%9A%84%E5%A5%B3%E5%AD%A9%E6%88%90%E4%B8%BA
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%92%8C%E7%8F%AD%E4%B8%8A%E7%AC%AC%E4%BA%8C%E5%8F%AF%E7%88%B1%E7%9A%84%E5%A5%B3%E5%AD%A9%E6%88%90%E4%B8%BA

</details>

<details>
<summary>廠長資源 · OK · conn=OK 3/3 · search=OK · playback=OK 3/3 · reasons=-</summary>

- Folder: `plugin_czzy`
- Entry: `新廠長`
- Overall: `OK`
- Cases: `5/5`
- Reasons: `-`
- Note: 要求大陸 IP

Connectivity
- [OK] `HEAD 200` https://www.czzymovie.com
- [OK] `HEAD 200` https://www.czzymovie.com/movie_bt/page/1
- [OK] `HEAD 200` https://www.czzymovie.com/boss1O1?q=test

Search
- Status: `OK`
- Keyword: `八千里路云和月`
- URL: https://www.czzymovie.com/boss1O1?q=%E5%85%AB%E5%8D%83%E9%87%8C%E8%B7%AF%E4%BA%91%E5%92%8C%E6%9C%88

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 八千里路云和月 | 第1集 | https://fanfan.hbcn.fun:906/hls3/hls02/八千里路云和月/八千里路云和月01.m3u8 |
| OK | 遮天剧场版背棺战王腾 | 1080P-1 | https://fanfan.hbcn.fun:906/yun/zhetian.m3u8 |
| OK | 钢铁森林 | 第1集 | https://fanfan.hbcn.fun:906/hls3/hls02/钢铁森林/1.m3u8 |

</details>

<details>
<summary>YouKnowTV · Partial · conn=OK 3/3 · search=Empty · playback=OK 3/3 · reasons=search_empty:1</summary>

- Folder: `plugin_youknow`
- Entry: `YouKnowTV`
- Overall: `Partial`
- Cases: `4/5`
- Reasons: `search_empty:1`
- Note: 领略更广阔的视界，尽享海量高清视频

Connectivity
- [OK] `HEAD 200` https://www.youknow.tv
- [OK] `HEAD 200` https://www.youknow.tv/label/new/
- [OK] `HEAD 200` https://www.youknow.tv/search/-------------.html?wd=test

Search
- Status: `Empty`
- Keyword: `山海经密码`
- URL: https://www.youknow.tv/search/-------------.html?wd=%E5%B1%B1%E6%B5%B7%E7%BB%8F%E5%AF%86%E7%A0%81
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 山海经密码 | 播放山海经密码第01集 | https://vip.dytt-cine.com/20251227/65728_8259184b/index.m3u8 |
| OK | 一人之下第六季 | 播放一人之下第六季第01集 | https://vip.dytt-cinema.com/20260102/44604_eb6fcbbe/index.m3u8 |
| OK | 大主宰年番 | 播放大主宰年番第01集 | https://vip.dytt-cine.com/20250502/16260_314ae9d8/index.m3u8 |

Failed Case Diagnostics
- keyword:山海经密码 | stage=`search` | reason=`search_empty`
  - detailURL: https://www.youknow.tv/search/-------------.html?wd=%E5%B1%B1%E6%B5%B7%E7%BB%8F%E5%AF%86%E7%A0%81
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://www.youknow.tv/search/-------------.html?wd=%E5%B1%B1%E6%B5%B7%E7%BB%8F%E5%AF%86%E7%A0%81

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
- [OK] `HEAD 200` https://libvio.site/
- [OK] `HEAD 200` https://libvio.site/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `婚姻剧毒`
- URL: https://libvio.site/search/-------------.html?wd=%E5%A9%9A%E5%A7%BB%E5%89%A7%E6%AF%92

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 婚姻剧毒 | 第01集 | https://v.vbing.me/2026/rh/4/Marriagetoxin.S01/Marriagetoxin.S01E01.mp4 |
| OK | 权欲之巅 | 第01集 | https://v.vbing.me/2026/rh/3/Climax.S01/Climax.S01E01.mp4 |
| OK | 盐沼之下 | 第01集 | https://v.vbing.me/2026/mj/4/Under.Salt.MarshS01/Under.Salt.MarshS01E01.mp4 |

</details>

<details>
<summary>韩剧网 · Fatal · conn=Fail 0/3 · search=Empty · playback=Not Reached · reasons=connectivity_failed:1, search_empty:1</summary>

- Folder: `plugin_thanju`
- Entry: `韩剧网`
- Overall: `Fatal`
- Cases: `0/2`
- Reasons: `connectivity_failed:1, search_empty:1`
- Note: 韓劇/電影/綜藝
- Fatal Errors:
  - `no medias returned; no medias returned`

Connectivity
- [FAIL] `GET 0` https://www.thanju.com | unknown certificate verification error
- [FAIL] `GET 0` https://www.thanju.com/list-select-id-1-type--area--year--star--state--order-addtime-p-1.html | unknown certificate verification error
- [FAIL] `GET 0` https://www.thanju.com/search/test.html | unknown certificate verification error

Search
- Status: `Empty`
- Keyword: `test`
- URL: https://www.thanju.com/search/test.html
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
- Not reached

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://www.thanju.com
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 0` https://www.thanju.com | unknown certificate verification error
  - `GET 0` https://www.thanju.com/list-select-id-1-type--area--year--star--state--order-addtime-p-1.html | unknown certificate verification error
  - `GET 0` https://www.thanju.com/search/test.html | unknown certificate verification error
- keyword:test | stage=`search` | reason=`search_empty`
  - detailURL: https://www.thanju.com/search/test.html
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 0` https://www.thanju.com/search/test.html | unknown certificate verification error

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
- Keyword: `魔女之吻`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E9%AD%94%E5%A5%B3%E4%B9%8B%E5%90%BB&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 魔女之吻 | 第1集 | https://vid.dbokutv.com/20260303/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHgTcyo5xOy6ejRMvwToqmCIqmCpSuDZasE48kRN0q/chunklist.m3u8 |
| OK | 八千里路云和月 | 第1集 | https://vid.dbokutv.com/20260407/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsrsRsGlR7XgBM9nR6nvQ7ajC34jC34qGpP6C34sBcrmD0/chunklist.m3u8 |
| OK | 白日提灯 | 第1集 | https://vid.dbokutv.com/20260328/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBM9oT6GjC34jC34mHZP4DpX6BcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
