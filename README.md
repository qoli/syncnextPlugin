# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-07-01T04:50:32.948Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | Empty | OK 2/2 | 2/5 | connectivity_failed:1, search_empty:1, unknown:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 2/2 | OK | OK 2/2 | 4/5 | plugin_empty_view:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `4`
- `plugin_olevod` 新歐樂影院: unknown:1
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:1

### Plugin Details

<details>
<summary>新歐樂影院 · Partial · conn=Fail 0/3 · search=Empty · playback=OK 2/2 · reasons=connectivity_failed:1, search_empty:1, unknown:1</summary>

- Folder: `plugin_olevod`
- Entry: `新歐樂影院`
- Overall: `Partial`
- Cases: `2/5`
- Reasons: `connectivity_failed:1, search_empty:1, unknown:1`
- Note: 海外 IP 無廣告

Connectivity
- [FAIL] `GET 404` https://api.olelive.com/ | status 404
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
- [FAIL] `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401

Search
- Status: `Empty`
- Keyword: `黄飞鸿4：王者之风`
- URL: https://api.olelive.com/v1/pub/index/search/%E9%BB%84%E9%A3%9E%E9%B8%BF4%EF%BC%9A%E7%8E%8B%E8%80%85%E4%B9%8B%E9%A3%8E/vod/0/1/4
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 女孩不平凡 | 立即播放 | https://europe.olemovienews.com/ts4/20260630/j3gjof5m/mp4/j3gjof5m.mp4/master.m3u8 |
| OK | 穿普拉达的女王2 | 立即播放 | https://europe.olemovienews.com/ts4/20260630/651dhjwa/mp4/651dhjwa.mp4/master.m3u8 |

Failed Case Diagnostics
- connectivity | stage=`connectivity` | reason=`connectivity_failed`
  - detailURL: https://api.olelive.com/
  - detail: 插件站點連通性檢查失敗
  - http diagnostics:
  - `GET 404` https://api.olelive.com/ | status 404
  - `GET 401` https://api.olelive.com/v1/pub/vod/newest/1/12 | status 401
  - `GET 401` https://api.olelive.com/v1/pub/index/search/test/vod/0/1/4 | status 401
- keyword:黄飞鸿4：王者之风 | stage=`search` | reason=`search_empty`
  - detailURL: https://api.olelive.com/v1/pub/index/search/%E9%BB%84%E9%A3%9E%E9%B8%BF4%EF%BC%9A%E7%8E%8B%E8%80%85%E4%B9%8B%E9%A3%8E/vod/0/1/4
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/index/search/%E9%BB%84%E9%A3%9E%E9%B8%BF4%EF%BC%9A%E7%8E%8B%E8%80%85%E4%B9%8B%E9%A3%8E/vod/0/1/4?_vv=38f0b24054310019a591444763a30d10
- 黄飞鸿4：王者之风 | stage=`episodes` | reason=`unknown`
  - detailURL: https://api.olelive.com/v1/pub/vod/detail/82739/true
  - detail: no episodes
  - http diagnostics:
  - `GET 200` https://api.olelive.com/v1/pub/vod/detail/82739/true?_vv=1d40b2c35731002264414513e0530cc4

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
- Keyword: `剧场版`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E5%89%A7%E5%9C%BA%E7%89%88

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 剧场版 关于我转生变成史莱姆这档事 苍海之泪篇 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6205plEDDpwsy6%2F5mK7VUUFheITAMKQ%2FvMvnBlhQGoruGOf8DzN79f55wTJ7BPbPvVY4mB3JzzihnRktus%2BBec8iz47jD8HhGno6b0Ufjj7f7Imy6L32rGg%2FjDVjJBhmLA |
| OK | 左撇子艾伦 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_6b4avsXiI1sekKu2Q5By7%2B2JfJM7XCSxnOTeCmqJaaE274r%2F%2FE5Gsi%2F45YYbrOV8yqUG9AKXBLECOQ14YEqDOk00ThhgXwloQvGKSo5Ydy%2BLjSIvi6F5%2FbwKmQ |
| OK | 想结束这场“我爱你”的游戏 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_b2baiwXbg8V4YFUSit7oMqz5OUZqGn5WfWmBLWUzBuuafb5XK%2FFIGwQHNkIQRNIk8kRU%2BForbgkjPk0ZGFTHsUGFopiibeC7TASa6HAdVaKWD2sCc4N1zE19 |

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
- [OK] `HEAD 200` https://www.libvio.cam/
- [OK] `HEAD 200` https://www.libvio.cam/search/-------------.html?wd=test

Search
- Status: `OK`
- Keyword: `极致欢愉保障`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E6%9E%81%E8%87%B4%E6%AC%A2%E6%84%89%E4%BF%9D%E9%9A%9C

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 极致欢愉保障 | HD7播放 第01集 | https://lf3-csp-sign.bytetos.com/tos-cn-v-5f73e7/osgiQK8o1Z2EgB6ZiatJJaNXE0EIFKtv6B2yW?x-expires=1782882002&x-signature=o%2BNsZIEYis1SaEbTbcfxtv3KhtI%3D&filename=BBA.mp4 |
| OK | 医到孤岛爱上你 | HD3播放 第01集 | https://ykj-eos-wx2-01.eos-wuxi-3.cmecloud.cn/cdc9681c389448c8975eabebcce0f5e3086?response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27Doctor.on.the.Edge.2026.S01E01.mp4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260701T045009Z&X-Amz-SignedHeaders=host&X-Amz-Expires=900&X-Amz-Credential=Y60FITYLOX7N6UJWBOEE%2F20260701%2Fdefault%2Fs3%2Faws4_request&t=2&u=1190291049089620211&ot=personal&oi=1190291049089620211&f=Fn_zgCmXlUyCstctubjBAj4ntzGE8ZUYg&ext=eyJ1dCI6MX0%3D&X-Amz-Signature=5ae96bda6d0c9e08f7a85fb681ad4b1af1cf8f453a5675464cf640d37a628805 |

Failed Case Diagnostics
- 旧基洞朋友们 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813229.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5813229.html

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
- Keyword: `红色珍珠`
- URL: https://www.thanju.com/search/%E7%BA%A2%E8%89%B2%E7%8F%8D%E7%8F%A0.html

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 红色珍珠 | 01 | https://cdn.vvvip-plays33.cc/20260224/8726_d6f84c02/index.m3u8 |
| OK | 我们愉快的好日子 | 01 | https://player.yzzyvip-35.com/20260331/3348_333cb763/index.m3u8 |
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
- Keyword: `医到孤岛爱上你`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E5%8C%BB%E5%88%B0%E5%AD%A4%E5%B2%9B%E7%88%B1%E4%B8%8A%E4%BD%A0&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 医到孤岛爱上你 | 第1集 | https://vid.dbokutv.com/20260602/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHdTcyo5xOy6ejUMHdP65pRYqmCIqmCZ56CaL3C4GkRN0q/chunklist.m3u8 |
| OK | 明天也要上班！ | 第1集 | https://vid.dbokutv.com/20260623/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsHhTcyo5xOy6ejRNHvUNDYBJ0nBJ0oH3P6CaCuHYvjS34/chunklist.m3u8 |
| OK | 种墨园 | 第1集 | https://vid.dbokutv.com/20260624/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtTsRsGlR7XgBNfjUIqmCIqmCJ8rEJ0nD4OkRN0q/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
