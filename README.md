# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-05-31T04:49:44.099Z`
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
- Keyword: `生财记之八零：天降福宝竟`
- URL: https://api.olelive.com/v1/pub/index/search/%E7%94%9F%E8%B4%A2%E8%AE%B0%E4%B9%8B%E5%85%AB%E9%9B%B6%EF%BC%9A%E5%A4%A9%E9%99%8D%E7%A6%8F%E5%AE%9D%E7%AB%9F/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 生财记之八零：天降福宝竟是天道亲闺女 | 第第1集集 | https://europe.olemovienews.com/ts4/20260531/mEyACjpm/mp4/mEyACjpm.mp4/clipTo/101066/master.m3u8 |
| OK | 完了，这破农场来的全是祖宗 | 第第1集集 | https://europe.olemovienews.com/ts4/20260531/zJweAnDf/mp4/zJweAnDf.mp4/clipTo/324900/master.m3u8 |
| OK | 善养三只小崽 | 第第1集集 | https://europe.olemovienews.com/ts4/20260531/bmiBabkJ/mp4/bmiBabkJ.mp4/clipTo/609266/master.m3u8 |

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
- Keyword: `楠木邸的神明庭院`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%A5%A0%E6%9C%A8%E9%82%B8%E7%9A%84%E7%A5%9E%E6%98%8E%E5%BA%AD%E9%99%A2

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 楠木邸的神明庭院 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_9339bQYiS3STy3A%2BQlh4CtaZ%2F5TGkTx3BJ8u6ZJlE%2BGcbpdw5rvHX8AT1YHHQzkVC9BASE2TeEbeLF8os7IF1W7DNmxhZKwG9jEccueS%2Fqfw7eClgGe%2Bwhuh |
| OK | 勇者之屑 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_18dbnXR3A6Bh90s5RvSLVW6OZvcEc7Tte7GO%2BGgvkoHecNf3MbgeNcTXx7bLAt5mW0jBEYPW43%2FjbWRy19WT2fDo1PfsnnYaPCnP65Jn%2FfuZ3nsiF96YLOgo |
| OK | 春夏秋冬代行者 春之舞 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_f92ffXRyEd0KuHwb9lsI0VkYkfzAquJaMvWIMZlirtr8J7fhV129LnJIlGmTNQNLiSRSzJKDEmwkZVVaY4qkYBUJTYciir28Ey2Ogk0%2FxvYP0crsVOHqSiJN |

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
- Keyword: `我的王室死对头`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%88%91%E7%9A%84%E7%8E%8B%E5%AE%A4%E6%AD%BB%E5%AF%B9%E5%A4%B4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 我的王室死对头 | HD3播放 第01集 | https://cloudcube.wuxi.cn/cloudcube-jswx-person/PERSONCLOUD/11aff610-a54b-486d-8896-788b61477c04.mp4?x-obs-traffic-limit=819200&X-Amz-Date=20260531T035957Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&x-amz-CLIENTTYPEIN=UNKNOWN&X-Amz-Credential=SZshenghuo/20260531/us-east-1/s3/aws4_request&x-amz-UID=10000004749791&response-content-disposition=attachment%3Bfilename%3DMy.Royal.Nemesis.S01E01.mp4&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=CORP&X-Amz-SignedHeaders=host&X-Amz-Expires=10800&x-amz-FSIZE=1274552523&x-amz-UFID=71477317129974113&X-Amz-Signature=08c8bba68d4936eab8e698392b7bb97acdd5ce40894308e4e9708f908be549e6 |
| OK | 大叔再出招 | HD7播放 第01集 | https://video-cn.jinritemai.com/storage/v1/tos-cn-v-0051/975ef320fc604c4891d64181719c9876?x-tos-authkey=5bf25627da095a5cba28ace592de46cc&x-tos-expires=1781411320&x-tos-signature=MHlDbFdpFOKU04Vwblt_vWx39Ag&filename=bba.mp4 |
| OK | 隐秘的监察 | HD3播放 第01集 | https://cloudcube.wuxi.cn/cloudcube-jswx-person/PERSONCLOUD/ef4c4157-54a2-4c37-b246-7c3e6736606c.mp4?x-obs-traffic-limit=819200&X-Amz-Date=20260531T044916Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&x-amz-CLIENTTYPEIN=UNKNOWN&X-Amz-Credential=SZshenghuo/20260531/us-east-1/s3/aws4_request&x-amz-UID=10000004749791&response-content-disposition=attachment%3Bfilename%3DFiling.for.Love.S01E01.mp4&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=CORP&X-Amz-SignedHeaders=host&X-Amz-Expires=10800&x-amz-FSIZE=1069913536&x-amz-UFID=21466317118946879&X-Amz-Signature=077419503969cb48d5db22a20d9a22a666dacd8b9b98d1ce6b8d6a4a2ec6fa02 |

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
| OK | 新进职员姜会长 | 01 | https://cdn.vvvip-plays33.cc/20260531/14095_1f3f1ae7/index.m3u8 |
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
- Keyword: `给你爱情处方`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E7%BB%99%E4%BD%A0%E7%88%B1%E6%83%85%E5%A4%84%E6%96%B9&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 给你爱情处方 | 第1集 | https://vid.dbokutv.com/20260202/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsbsRsGlR7XgBMfkON5ZPYqmCIqmCZKtEJX4CaCkRN0q/chunklist.m3u8 |
| OK | 所爱之人 | 第1集 | https://vid.dbokutv.com/20260411/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejSs5wSYqmCIqmCZ4pE3GnHJGkRN0q/chunklist.m3u8 |
| OK | 刑警重回原点 | 第1集 | https://vid.dbokutv.com/20260425/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHfTcyo5xOy6ejU6fwQ7baBJ0nBJ0nC4D6DZH1HIvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
