`user script`;

var BASE_URL = "https://libvio.site";
var REFERER_URL = BASE_URL + "/";
var ENABLE_LIST_PLAYABLE_PROBE = false;
var SOURCE_PROBE_CONCURRENCY = 3;
var SOURCE_PROBE_EPISODE_LIMIT = 3;
var SOURCE_PROBE_MAX_CANDIDATES = 16;
var PLAYER_API_BASE_CACHE = {};
var PLAYER_API_BASE_PENDING = {};

function print(params) {
  console.log(JSON.stringify(params));
}

function buildMediaData(
  id,
  coverURLString,
  title,
  descriptionText,
  detailURLString
) {
  var obj = {
    id: id,
    coverURLString: coverURLString,
    title: title,
    descriptionText: descriptionText,
    detailURLString: detailURLString,
  };

  return obj;
}

function buildEpisodeData(id, title, episodeDetailURL) {
  return {
    id: id,
    title: title,
    episodeDetailURL: episodeDetailURL,
  };
}

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = BASE_URL + href;
  }
  return href;
}

function buildAbsoluteURL(url) {
  if (!startsWithHttp(url)) {
    return BASE_URL + "/" + url.replace(/^\/+/, "");
  }
  return url;
}

function normalizePlayableURL(rawURL) {
  if (!rawURL) {
    return "";
  }

  var url = rawURL
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .trim();

  if (url.startsWith("//")) {
    url = "https:" + url;
  }

  return url;
}

function extractPlayableURL(body) {
  if (!body) {
    return "";
  }

  var patterns = [
    /(?:var|let|const)\s+urls?\s*=\s*["']([^"']+)["']/,
    /(?:var|let|const)\s+[a-zA-Z_$][\w$]*\s*=\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/,
    /["']url["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/,
    /url\s*=\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var matched = body.match(patterns[i]);
    if (matched && matched[1]) {
      return normalizePlayableURL(matched[1]);
    }
  }

  return "";
}

function nodeHasClass(node, className) {
  if (!node || !node.attributes || !node.attributes.class) {
    return false;
  }
  return node.attributes.class.split(/\s+/).indexOf(className) >= 0;
}

function nodeText(node) {
  if (!node) {
    return "";
  }
  if (typeof node === "string") {
    return node.trim();
  }
  if (!node.children || !node.children.length) {
    return "";
  }

  var text = "";
  for (var i = 0; i < node.children.length; i++) {
    var childText = nodeText(node.children[i]);
    if (childText) {
      text += (text ? " " : "") + childText;
    }
  }

  return text.trim();
}

function findFirstNodeByClass(node, className) {
  if (!node || typeof node !== "object") {
    return null;
  }

  if (nodeHasClass(node, className)) {
    return node;
  }

  if (!node.children || !node.children.length) {
    return null;
  }

  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    if (typeof child !== "object") {
      continue;
    }

    var found = findFirstNodeByClass(child, className);
    if (found) {
      return found;
    }
  }

  return null;
}

function shouldSkipMediaByDescription(descriptionText) {
  var text = (descriptionText || "").trim();
  return text.indexOf("网盘") >= 0 || text.indexOf("網盤") >= 0;
}

function detailHasBD5PlayableTag(body) {
  var text = body || "";
  var keywords = ["BD播放", "BD5播放", "HD5播放"];
  for (var i = 0; i < keywords.length; i++) {
    if (text.indexOf(keywords[i]) >= 0) {
      return true;
    }
  }
  return false;
}

function findAllByKey(obj, keyToFind) {
  return (
    Object.entries(obj).reduce(
      (acc, [key, value]) =>
        key === keyToFind
          ? acc.concat(value)
          : typeof value === "object" && value
          ? acc.concat(findAllByKey(value, keyToFind))
          : acc,
      []
    ) || []
  );
}

function extractPlayerConfig(body) {
  if (!body) {
    return null;
  }

  var patterns = [
    /r player_.*?=\s*(\{[\s\S]*?\})\s*</i,
    /player_[a-z0-9_]+\s*=\s*(\{[\s\S]*?\})\s*;/i,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var matched = body.match(patterns[i]);
    if (!matched || !matched[1]) {
      continue;
    }

    try {
      return JSON.parse(matched[1]);
    } catch (error) {}
  }

  return null;
}

function extractPlayAPIBase(playerJSBody) {
  if (!playerJSBody) {
    return "";
  }

  var matched = playerJSBody.match(/src\s*=\s*["']([^"']+)["']/i);
  if (!matched || !matched[1]) {
    return "";
  }

  return buildAbsoluteURL(matched[1]);
}

function fetchPlayableURLByAPI(playAPIURL, callback) {
  if (!playAPIURL) {
    callback("");
    return;
  }

  $http
    .fetch({
      url: playAPIURL,
      headers: {
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      callback(extractPlayableURL(res.body));
    })
    .catch(function () {
      callback("");
    });
}

function getPlayAPIBaseForSource(from, callback) {
  if (!from) {
    callback("");
    return;
  }

  if (PLAYER_API_BASE_CACHE.hasOwnProperty(from)) {
    callback(PLAYER_API_BASE_CACHE[from]);
    return;
  }

  if (PLAYER_API_BASE_PENDING[from]) {
    PLAYER_API_BASE_PENDING[from].push(callback);
    return;
  }

  PLAYER_API_BASE_PENDING[from] = [callback];

  function finish(value) {
    var resolved = value || "";
    PLAYER_API_BASE_CACHE[from] = resolved;

    var pending = PLAYER_API_BASE_PENDING[from] || [];
    delete PLAYER_API_BASE_PENDING[from];

    for (var i = 0; i < pending.length; i++) {
      pending[i](resolved);
    }
  }

  $http
    .fetch({
      url: BASE_URL + "/static/player/" + from + ".js",
      method: "GET",
    })
    .then(function (res) {
      finish(extractPlayAPIBase(res.body));
    })
    .catch(function () {
      finish("");
    });
}

function resolvePlayableURLByConfig(config, callback) {
  if (!config || !config.url || !config.from) {
    callback("");
    return;
  }

  var url = config.url;
  var from = config.from;
  var next = config.link_next || "";
  var id = config.id || "";
  var nid = config.nid || "";

  if (from === "kuake" || from === "uc") {
    callback("");
    return;
  }

  if (from === "ty_new1") {
    fetchPlayableURLByAPI(BASE_URL + "/vid/ty4.php?url=" + url, callback);
    return;
  }

  getPlayAPIBaseForSource(from, function (playAPIBase) {
    if (!playAPIBase) {
      callback("");
      return;
    }

    if (from === "tweb") {
      var twebPlayAPIURL = buildAbsoluteURL(playAPIBase + url);
      $http
        .fetch({
          url: twebPlayAPIURL,
          headers: {
            Referer: REFERER_URL,
          },
        })
        .then(function (res) {
          var code = res.body.match(/(?<={).+?(?=})/);
          if (!code || !code[0]) {
            callback("");
            return;
          }

          try {
            var decoded = JSON.parse("{" + code[0] + "}").data;
            if (!decoded) {
              callback("");
              return;
            }
            callback(normalizePlayableURL(decodeStr(htoStr(strRevers(decoded)))));
          } catch (error) {
            callback("");
          }
        })
        .catch(function () {
          callback("");
        });
      return;
    }

    var playAPIURL =
      playAPIBase + url + "&next=" + next + "&id=" + id + "&nid=" + nid;
    fetchPlayableURLByAPI(buildAbsoluteURL(playAPIURL), callback);
  });
}

function extractEpisodeURLsFromDetailBody(body) {
  var urls = [];
  var seen = {};
  var playlists = tXml.getElementsByClassName(body, "stui-content__playlist");

  for (var i = 0; i < playlists.length; i++) {
    var playlist = playlists[i];
    if (!playlist || !playlist.children) {
      continue;
    }

    for (var index = 0; index < playlist.children.length; index++) {
      var listItem = playlist.children[index];
      if (!listItem || !listItem.children || !listItem.children.length) {
        continue;
      }

      var anchor = null;
      for (var childIndex = 0; childIndex < listItem.children.length; childIndex++) {
        var child = listItem.children[childIndex];
        if (child && child.attributes && child.attributes.href) {
          anchor = child;
          break;
        }
      }
      var href = anchor && anchor.attributes ? anchor.attributes.href : "";
      if (!href) {
        continue;
      }

      href = buildURL(href);
      if (seen[href]) {
        continue;
      }

      seen[href] = true;
      urls.push(href);
    }
  }

  return urls;
}

function probePlayableURLFromPlayPage(playPageURL, callback) {
  $http
    .fetch({
      url: playPageURL,
      method: "GET",
      headers: {
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      var config = extractPlayerConfig(res.body);
      if (!config) {
        callback("");
        return;
      }
      resolvePlayableURLByConfig(config, callback);
    })
    .catch(function () {
      callback("");
    });
}

function probeEpisodeListForPlayable(episodeURLs, index, callback) {
  if (index >= episodeURLs.length || index >= SOURCE_PROBE_EPISODE_LIMIT) {
    callback("");
    return;
  }

  probePlayableURLFromPlayPage(episodeURLs[index], function (playURL) {
    if (playURL) {
      callback(playURL);
      return;
    }
    probeEpisodeListForPlayable(episodeURLs, index + 1, callback);
  });
}

function mediaHasPlayableSource(detailURL, callback) {
  $http
    .fetch({
      url: detailURL,
      method: "GET",
      headers: {
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      callback(detailHasBD5PlayableTag(res.body));
    })
    .catch(function () {
      callback(false);
    });
}

function mapWithConcurrency(items, limit, worker, callback) {
  limit = Math.max(1, limit || 1);

  if (!items || !items.length) {
    callback([]);
    return;
  }

  var results = new Array(items.length);
  var nextIndex = 0;
  var active = 0;
  var completed = 0;

  function checkDone() {
    if (completed >= items.length) {
      callback(results);
    }
  }

  function schedule() {
    while (active < limit && nextIndex < items.length) {
      (function (currentIndex) {
        active += 1;

        worker(items[currentIndex], currentIndex, function (result) {
          results[currentIndex] = result || null;
          active -= 1;
          completed += 1;
          checkDone();
          schedule();
        });
      })(nextIndex);

      nextIndex += 1;
    }
  }

  schedule();
}

function parseMediaCandidates(body) {
  var datas = [];
  var seen = {};
  var content = tXml.getElementsByClassName(body, "stui-vodlist__box");

  for (var index = 0; index < content.length; index++) {
    var dom = content[index];
    var title = findAllByKey(dom, "title")[0];
    var href = findAllByKey(dom, "href")[0];
    var coverURLString = findAllByKey(dom, "data-original")[0];
    var picTextNode = findFirstNodeByClass(dom, "pic-text");
    var descriptionText = nodeText(picTextNode);

    if (shouldSkipMediaByDescription(descriptionText)) {
      continue;
    }

    if (!title || !href) {
      continue;
    }

    href = buildURL(href);
    if (seen[href]) {
      continue;
    }

    seen[href] = true;
    datas.push(buildMediaData(href, coverURLString, title, descriptionText, href));
  }

  return datas;
}

function buildMediasWithPlayableProbe(inputURL, callback) {
  $http
    .fetch({
      url: inputURL,
      method: "GET",
    })
    .then(function (res) {
      var candidates = parseMediaCandidates(res.body);
      if (!ENABLE_LIST_PLAYABLE_PROBE) {
        callback(candidates);
        return;
      }

      if (
        SOURCE_PROBE_MAX_CANDIDATES > 0 &&
        candidates.length > SOURCE_PROBE_MAX_CANDIDATES
      ) {
        candidates = candidates.slice(0, SOURCE_PROBE_MAX_CANDIDATES);
      }
      mapWithConcurrency(
        candidates,
        SOURCE_PROBE_CONCURRENCY,
        function (media, index, done) {
          mediaHasPlayableSource(media.detailURLString, function (ok) {
            done(ok ? media : null);
          });
        },
        function (results) {
          var datas = [];
          for (var i = 0; i < results.length; i++) {
            if (results[i]) {
              datas.push(results[i]);
            }
          }
          callback(datas);
        }
      );
    })
    .catch(function () {
      callback([]);
    });
}

// Main

function buildMedias(inputURL) {
  buildMediasWithPlayableProbe(inputURL, function (datas) {
    $next.toMedias(JSON.stringify(datas));
  });
}

function Episodes(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then(function (res) {
    if (!detailHasBD5PlayableTag(res.body)) {
      if ($next.emptyView) {
        $next.emptyView("此資源目前僅網盤或無站內可播源，請返回選擇其他資源。");
      }
      $next.toEpisodes(JSON.stringify(datas));
      return;
    }

    var playlists = tXml.getElementsByClassName(res.body, "stui-content__playlist");
    var content = playlists[0];
    if (!content || !content.children || !content.children.length) {
      $next.toEpisodes(JSON.stringify(datas));
      return;
    }

    for (var index = 0; index < content.children.length; index++) {
      var listItem = content.children[index];
      if (!listItem || !listItem.children || !listItem.children.length) {
        continue;
      }

      var element = null;
      for (var childIndex = 0; childIndex < listItem.children.length; childIndex++) {
        var child = listItem.children[childIndex];
        if (child && child.attributes && child.attributes.href) {
          element = child;
          break;
        }
      }
      if (!element) {
        continue;
      }

      var href = element.attributes ? element.attributes.href : "";
      var title = element.children.toString();
      if (!href) {
        continue;
      }

      href = buildURL(href);

      datas.push(buildEpisodeData(href, title, href));
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function Player(inputURL) {
  $http
    .fetch({
      url: inputURL,
      method: "GET",
    })
    .then(function (res) {
      var config = extractPlayerConfig(res.body);
      if (!config) {
        print("libvio: 读取播放器配置失败");
        return;
      }

      if (config.from === "kuake" || config.from === "uc") {
        print("未能支持網盤播放，請按返回");
        return;
      }

      resolvePlayableURLByConfig(config, function (playURL) {
        if (!playURL) {
          print("libvio: 解析播放地址失败(" + config.from + ")");
          return;
        }

        gotoPlay(playURL);
      });
    })
    .catch(function () {
      print("libvio: 播放页请求失败");
    });
}

function gotoPlay(url) {
  try {
    let json = {
      url: url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
        Referer: REFERER_URL,
      },
    };

    $next.toPlayerByJSON(JSON.stringify(json));
  } catch (error) {
    print("請 Syncnext 更新到 1.116 或以上版本");
    $next.toPlayer(url);
  }
}

function Search(inputURL, key) {
  buildMediasWithPlayableProbe(inputURL, function (datas) {
    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}
function htoStr(_0x335e0c) {
  var _0x19492b = "";
  for (
    var _0x53a455 = 0;
    _0x53a455 < _0x335e0c.length;
    _0x53a455 = _0x53a455 + 2
  ) {
    var _0x4091f2 = _0x335e0c[_0x53a455] + _0x335e0c[_0x53a455 + 1];
    _0x4091f2 = parseInt(_0x4091f2, 16);
    _0x19492b += String.fromCharCode(_0x4091f2);
  }
  return _0x19492b;
}
function strRevers(_0x5d6b71) {
  return _0x5d6b71.split("").reverse();
}
function decodeStr(_0x267828) {
  var _0x5cd2b5 = (_0x267828.length - 7) / 2,
    _0x2191ed = _0x267828.substring(0, _0x5cd2b5),
    _0x35a256 = _0x267828.substring(_0x5cd2b5 + 7);
  return _0x2191ed + _0x35a256;
}

function startsWithHttp(str) {
  return str.startsWith("http");
}
