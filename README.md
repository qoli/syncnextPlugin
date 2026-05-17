# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-17T04:39:37.501Z`
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
- Keyword: `老公突然有了读心术`
- URL: https://api.olelive.com/v1/pub/index/search/%E8%80%81%E5%85%AC%E7%AA%81%E7%84%B6%E6%9C%89%E4%BA%86%E8%AF%BB%E5%BF%83%E6%9C%AF/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 老公突然有了读心术 | 第1集 | https://europe.olemovienews.com/ts4/20260517/peICrBwt/mp4/peICrBwt.mp4/clipTo/200733/master.m3u8 |
| OK | 匠心暖人间 | 第1集 | https://europe.olemovienews.com/ts4/20260517/zIvbuogA/mp4/zIvbuogA.mp4/clipTo/180300/master.m3u8 |
| OK | 我在荒年顿顿肉 | 第01集 | https://europe.olemovienews.com/ts4/20260517/ebgsdFrg/mp4/ebgsdFrg.mp4/clipTo/275100/master.m3u8 |

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
- Keyword: `主播女孩重度依赖`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E4%B8%BB%E6%92%AD%E5%A5%B3%E5%AD%A9%E9%87%8D%E5%BA%A6%E4%BE%9D%E8%B5%96

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 主播女孩重度依赖 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_97f5mAokibQkRs4TQ7Rg1JXtD4ezWMhDO13af07Bgu5MdZMBb8CjGQ4k6aMa%2F7%2FG88UA8rPDEdJ%2Byk1gysJBqVIGH5euPMT8sK4o437V2N3metLebs%2BL2tU5 |
| OK | 一叠间漫画咖啡屋生活！ | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_723fD9TakHpvPfR6vNlJoyEewAyst7pkKwDegXGbWbUTiB03N57eYle%2BSqLV%2BvK8AD7sqKH2EgP76AwGsC69OEAMsjSGfNts0M7MWTucfvs9ffyF%2FaeAvCus |
| OK | 勇者之屑 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_c992kOkqy1tqXIeFlEZ7Yhtv0YHGTRjO2%2BrPjvLr0zBgzsvxXFN2wAdCOrq7qZhEgW%2FOcxu6jzH2G2XG1oL5rpw07LV%2FKDZHtpoRz%2Bsmm5mqKE%2F%2FRE3Hmk93 |

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
- Keyword: `春夏秋冬代行者`
- URL: https://libvio.run/search/-------------.html?wd=%E6%98%A5%E5%A4%8F%E7%A7%8B%E5%86%AC%E4%BB%A3%E8%A1%8C%E8%80%85

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 春夏秋冬代行者 春之舞 | 第01集 | https://v3.vbing.me/2026/fun/4/Shunkashuutou.Daikousha.Haru.no.Mai.S01/Shunkashuutou.Daikousha.Haru.no.Mai.S01E01.mp4 |
| OK | 隐秘的监察 | 第01集 | https://v.vbing.me/2026/rh/4/Filing.for.Love.S01/Filing.for.Love.S01E01.mp4 |
| OK | 努力克服自卑的我们 | 第01集 | https://v3.vbing.me/2026/rh/4/We.Are.All.Trying.Here.S01/We.Are.All.Trying.Here.S01E01.mp4 |

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
- Keyword: `给你爱情处方`
- URL: https://www.thanju.com/search/%E7%BB%99%E4%BD%A0%E7%88%B1%E6%83%85%E5%A4%84%E6%96%B9.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 给你爱情处方 | 01 | https://cdn.yzzyvip-29.com/20260201/16425_49d7d186/index.m3u8 |
| OK | 努力克服自卑的我们 | 01 | https://cdn.yzzy31-play.com/20260418/19681_becb8597/index.m3u8 |
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
- Keyword: `21世纪大君夫人`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=21%E4%B8%96%E7%BA%AA%E5%A4%A7%E5%90%9B%E5%A4%AB%E4%BA%BA&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 21世纪大君夫人 | 第1集 | https://vid.dbokutv.com/20260411/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsnsRsGlR7XgBJ8nSsfaQcPoBJ0nBJ0oCJaqD4CrCIvjS34/chunklist.m3u8 |
| OK | 主角 | 第1集 | https://vid.dbokutv.com/20260510/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtfsRsGlR7XgBNfgBJ0nBJ0nGZ8vDpaqCovjS34/chunklist.m3u8 |
| OK | 隐秘的监察 | 第1集 | https://vid.dbokutv.com/20260425/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHiTcyo5xOy6ejUMraQcCjC34jC311EJOtE495BMXaBcrmD0/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
