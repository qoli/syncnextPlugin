# syncnextPlugin

Syncnext 插件化頻道協議

## 文檔地址

https://qoli.notion.site/5f834305a2074bc383e1fa521ca93f63?pvs=4

補充案例：

- [插件維護 SOP](./MAINTENANCE.md)
- [YouKnowTV 多來源對齊與後置選線案例](./youknow_multisource_case.md)

## Automated Bun Smoke Status

<!-- AUTO-SMOKE-STATUS:START -->
Generated: `2026-06-05T04:48:02.077Z`
Enabled plugin source: [sourcesv3.json](https://raw.githubusercontent.com/qoli/syncnext-api/refs/heads/main/sourcesv3.json)

> Bun/Node smoke status only.
> It does not represent Syncnext tvOS/iOS JavaScriptCore + JSHttp real playback availability.

| Plugin | Folder | Overall | Connectivity | Search | Playback | Cases | Reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 新歐樂影院 | plugin_olevod | Partial | Fail 0/3 | OK | OK 3/3 | 4/5 | connectivity_failed:1 |
| 新 AGE 動漫 | plugin_age | OK | OK 2/3 | OK | OK 3/3 | 5/5 | - |
| 廠長資源 | plugin_czzy | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| YouKnowTV | plugin_youknow | Fatal | Fail 0/3 | Empty | Not Reached | 0/2 | connectivity_failed:1, search_empty:1 |
| libvio | plugin_libvio | Partial | OK 1/2 | Empty | Fail 0/1 | 1/5 | search_empty:1, plugin_empty_view:2, callback_timeout:1 |
| 韩剧网 | plugin_thanju | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |
| 独播库 | plugin_dbku | OK | OK 3/3 | OK | OK 3/3 | 5/5 | - |

Latest files: [latest.log](./syncnextPlugin_all_plugin_test_runs/latest.log), [latest.summary.log](./syncnextPlugin_all_plugin_test_runs/latest.summary.log), [latest.json](./syncnextPlugin_all_plugin_test_runs/latest.json)

Invalid sources: `3`
- `plugin_czzy` 廠長資源: fatal_error:1
- `plugin_youknow` YouKnowTV: fatal_error:1
- `plugin_libvio` libvio: plugin_empty_view:2, callback_timeout:1

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
- Keyword: `天降小红娘，我来助您成仙`
- URL: https://api.olelive.com/v1/pub/index/search/%E5%A4%A9%E9%99%8D%E5%B0%8F%E7%BA%A2%E5%A8%98%EF%BC%8C%E6%88%91%E6%9D%A5%E5%8A%A9%E6%82%A8%E6%88%90%E4%BB%99/vod/0/1/4

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 天降小红娘，我来助您成仙啦 | 第1集 | https://europe.olemovienews.com/ts4/20260605/niGfmxtf/mp4/niGfmxtf.mp4/clipTo/118760/master.m3u8 |
| OK | 流放岭南第一天，全家馋哭了 | 第1集 | https://europe.olemovienews.com/ts4/20260605/yEEdIhpa/mp4/yEEdIhpa.mp4/clipTo/359533/master.m3u8 |
| OK | 重生拒婚：我成了新太子妃 | 第1集 | https://europe.olemovienews.com/ts4/20260605/ozepihbc/mp4/ozepihbc.mp4/clipTo/130800/master.m3u8 |

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
- Keyword: `淡岛百景`
- URL: https://ageapi.omwjhz.com:18888/v2/search?page=1&query=%E6%B7%A1%E5%B2%9B%E7%99%BE%E6%99%AF

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 淡岛百景 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_827agyLY84Fs32FZ5cv0Tp1A1%2BQx5oo7zdQnDhm8k2LtOlyu38090V6qRlqmXLe5G9%2Bh6PuMGxsl%2F803lc%2FZbEeRmlAmpY6dvkN0pRNVBa%2BzouNwclTXKobh |
| OK | 轮回的花瓣 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_8c02f2WdWt8xBxVQsjB7ahW8TEzCov%2FrONAnilJOTmW%2F2PYMvjZQz9C0%2Fcb1eu%2BGBPLEH%2FeXtoLIsI3OOvDc6BDCv1AF2d0wa2i8rirURc56vZ8rqo4mYM52 |
| OK | 雾尾粉丝后援会 | 第01集 | https://jx.wuzhoupai.com:8443/m3u8/?url=age_485ae%2BYtcsLJ8snaMwvqai4kbDN2f5KG5Eiqub5Bst0EP4pZeX6O5FnR9ZWX8jmSHqGiYsJX2hdRy7KycKip78I1PEh%2BS4I79SloK8mZXS33ikeHIMN9EcIt |

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
<summary>libvio · Partial · conn=OK 1/2 · search=Empty · playback=Fail 0/1 · reasons=search_empty:1, plugin_empty_view:2, callback_timeout:1</summary>

- Folder: `plugin_libvio`
- Entry: `libvio`
- Overall: `Partial`
- Cases: `1/5`
- Reasons: `search_empty:1, plugin_empty_view:2, callback_timeout:1`
- Note: libvio

Connectivity
- [OK] `HEAD 200` https://www.libvio.cam/
- [FAIL] `GET 520` https://www.libvio.cam/search/-------------.html?wd=test | status 520

Search
- Status: `Empty`
- Keyword: `伪装的真实之吻`
- URL: https://www.libvio.cam/search/-------------.html?wd=%E4%BC%AA%E8%A3%85%E7%9A%84%E7%9C%9F%E5%AE%9E%E4%B9%8B%E5%90%BB
- Reason: `search_empty`
- Detail: 搜尋執行成功但結果為空

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| FAIL | 掩耳盗邻第二季 | HD3播放 第01集 | callback_timeout |

Failed Case Diagnostics
- keyword:伪装的真实之吻 | stage=`search` | reason=`search_empty`
  - detailURL: https://www.libvio.cam/search/-------------.html?wd=%E4%BC%AA%E8%A3%85%E7%9A%84%E7%9C%9F%E5%AE%9E%E4%B9%8B%E5%90%BB
  - detail: 搜尋執行成功但結果為空
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/search/-------------.html?wd=%E4%BC%AA%E8%A3%85%E7%9A%84%E7%9C%9F%E5%AE%9E%E4%B9%8B%E5%90%BB
- 伪装的真实之吻 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5813064.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/detail/5813064.html
- 掩耳盗邻第二季 | HD3播放 第01集 | stage=`player` | reason=`callback_timeout`
  - detailURL: https://www.libvio.cam/detail/5812892.html
  - episodeURL: https://www.libvio.cam/play/5812892-2-1.html
  - detail: 等待插件回調超時，可能是站點回應慢或頁面結構改版
  - http diagnostics:
  - `GET 520` https://www.libvio.cam/play/5812892-2-1.html
- 向流星许愿的我们 | stage=`episodes` | reason=`plugin_empty_view`
  - detailURL: https://www.libvio.cam/detail/5812840.html
  - detail: 插件回傳 emptyView，未取得可播放地址
  - http diagnostics:
  - `GET 200` https://www.libvio.cam/detail/5812840.html

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
| OK | 第一个男人 | 01 | https://cdn.yzzy31-play.com/20251216/9033_3613ef1e/index.m3u8 |
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
- Keyword: `未解决之女警视厅文件搜查`
- URL: https://www.dbku.tv/vodsearch/-------------.html?wd=%E6%9C%AA%E8%A7%A3%E5%86%B3%E4%B9%8B%E5%A5%B3%E8%AD%A6%E8%A7%86%E5%8E%85%E6%96%87%E4%BB%B6%E6%90%9C%E6%9F%A5&submit=

Playback Cases
| Result | Media | Episode | Output |
| --- | --- | --- | --- |
| OK | 未解决之女警视厅文件搜查官第3季 | 第1集 | https://vid.dbokutv.com/20260417/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBNTgQdfkQdDqTsfpOsTaCsejC34jC38uGJ4nDZasBcrmD0/chunklist.m3u8 |
| OK | 爱在连理里 | 第1集 | https://vid.dbokutv.com/20260404/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBsPsRsGlR7XgBM5wR6niBJ0nBJ0mGZb1EKOsCYvjS34/chunklist.m3u8 |
| OK | 我们愉快的好日子 | 第1集 | https://vid.dbokutv.com/20260402/ppotb62-S71lT2yliZApDBSvkYzBsrmD3fpCJ4nBtHsRsGlR7XgBNTjUMjaQ79wBJ0nBJ0mGaGoCpKpHYvjS34/chunklist.m3u8 |

</details>

<!-- AUTO-SMOKE-STATUS:END -->
