`user script`;

var FALLBACK_HOST = "https://www.libvios.com";
var BASE_URL = normalizeHost(
  typeof __syncnextPrimaryHost === "string" && __syncnextPrimaryHost
    ? __syncnextPrimaryHost
    : FALLBACK_HOST
);
var REFERER_URL = BASE_URL + "/";
var UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
var ENABLE_LIST_PLAYABLE_PROBE = false;
var SOURCE_PROBE_CONCURRENCY = 3;
var SOURCE_PROBE_EPISODE_LIMIT = 3;
var SOURCE_PROBE_MAX_CANDIDATES = 16;
var PLAYER_API_BASE_CACHE = {};
var PLAYER_API_BASE_PENDING = {};
var SMARTPLAY_API_URL =
  "https://hd.ticktockwow.com/smartplay-cache/api/webvideo_ty.php";

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

function normalizeHost(host) {
  return String(host || "").trim().replace(/\/+$/, "");
}

function rebaseLibvioURL(url) {
  var value = String(url || "").trim();
  if (!value) {
    return "";
  }

  if (value.indexOf("//") === 0) {
    value = "https:" + value;
  }

  if (!startsWithHttp(value)) {
    return BASE_URL + "/" + value.replace(/^\/+/, "");
  }

  return value.replace(
    /^https?:\/\/(?:www\.)?(?:(?:libviohd|libvios|libviobd|libhd)\.com|libvio\.host|libvio\.(?:app|art|cam|cc|cloud|com|fun|in|la|life|link|me|mov|pro|pw|run|site|vip))(?=\/|$)/i,
    BASE_URL
  );
}

function buildURL(href) {
  return rebaseLibvioURL(href);
}

function buildAbsoluteURL(url) {
  return rebaseLibvioURL(url);
}

function HostsProbeRequest() {
  return {
    url: BASE_URL + "/",
    method: "GET",
    headers: {
      "User-Agent": UA,
      Referer: REFERER_URL,
    },
    accept: {
      statusCodes: [200],
      bodyIncludesAny: ["stui-vodlist__box", "stui-content", "LIBVIO"],
      bodyExcludesAny: [
        "访问验证",
        "訪問驗證",
        "安全验证",
        "安全驗證",
        "安全检测",
        "安全檢測",
        "Just a moment",
        "403 Forbidden",
        "503 · SERVICE UNAVAILABLE",
        "ERR_SERVICE_UNAVAILABLE",
        "域名停用",
        "停用通知",
        "站点导航",
        "發布頁",
        "发布页",
        "Region Restricted",
        "Not Available",
        "cf-browser-verification",
        "captcha",
      ],
      titleExcludesAny: [
        "访问验证",
        "訪問驗證",
        "安全验证",
        "安全驗證",
        "安全检测",
        "安全檢測",
        "Just a moment",
        "403 Forbidden",
        "503",
        "域名停用",
        "停用通知",
        "站点导航",
        "發布頁",
        "发布页",
        "Region Restricted",
        "Not Available",
      ],
    },
  };
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
    /["']?urls?["']?\s*:\s*["']([^"']+)["']/,
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

function isUnsupportedSourceTitle(title) {
  var text = String(title || "");
  return (
    text.indexOf("网盘") >= 0 ||
    text.indexOf("網盤") >= 0 ||
    text.indexOf("百度") >= 0 ||
    text.indexOf("夸克") >= 0 ||
    text.indexOf("UC") >= 0
  );
}

function detailHasPlayableSourceTag(body) {
  var text = body || "";
  var keywords = [
    "BD播放",
    "BD5播放",
    "HD5播放",
    "蓝光",
    "藍光",
    "高清线路",
    "高清線路",
  ];
  for (var i = 0; i < keywords.length; i++) {
    if (text.indexOf(keywords[i]) >= 0 && !isUnsupportedSourceTitle(keywords[i])) {
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

function extractQuotedConst(body, name) {
  if (!body || !name) {
    return "";
  }

  var pattern = new RegExp(
    "const\\s+" + name + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1"
  );
  var matched = body.match(pattern);
  return matched && matched[2] ? matched[2] : "";
}

function extractArtplayerScript(body) {
  if (!body) {
    return "";
  }

  var scripts = body.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
  for (var i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].indexOf("function execB") >= 0) {
      return scripts[i]
        .replace(/^<script\b[^>]*>/i, "")
        .replace(/<\/script>\s*$/i, "");
    }
  }

  return "";
}

function looksLikeResolvedMediaURL(url) {
  return /^https?:\/\/.+(?:\.m3u8|\.mp4|\/tos-|bytetos\.com|byteimg\.com|bytecdntp\.com)/i.test(
    String(url || "")
  );
}

function buildFakeArtplayerElement() {
  return {
    style: {},
    dataset: {},
    classList: {
      add: function () {},
      remove: function () {},
      contains: function () {
        return false;
      },
    },
    addEventListener: function () {},
    removeEventListener: function () {},
    appendChild: function () {},
    remove: function () {},
    setAttribute: function () {},
    getAttribute: function () {
      return "";
    },
    querySelector: function () {
      return buildFakeArtplayerElement();
    },
    querySelectorAll: function () {
      return [];
    },
    innerHTML: "",
    textContent: "",
    value: "",
  };
}

function decryptArtplayerURL(scriptBody, encryptedURL, mediaId) {
  if (
    !scriptBody ||
    !encryptedURL ||
    typeof CryptoJS === "undefined" ||
    !CryptoJS.AES
  ) {
    return "";
  }

  try {
    var fakeElement = buildFakeArtplayerElement;
    var fakeDocument = {
      body: fakeElement(),
      cookie: "",
      addEventListener: function () {},
      createElement: function () {
        return fakeElement();
      },
      getElementById: function () {
        return fakeElement();
      },
      querySelector: function () {
        return fakeElement();
      },
      querySelectorAll: function () {
        return [];
      },
    };
    var fakeStorage = {
      getItem: function () {
        return null;
      },
      setItem: function () {},
      removeItem: function () {},
    };
    var fakePromise = {
      then: function () {
        return fakePromise;
      },
      catch: function () {
        return fakePromise;
      },
    };
    var fetch = function () {
      return fakePromise;
    };
    var setTimeout = function () {
      return 0;
    };
    var clearTimeout = function () {};
    var setInterval = function () {
      return 0;
    };
    var clearInterval = function () {};
    var window = {
      location: {
        protocol: "https:",
        host: BASE_URL.replace(/^https?:\/\//i, ""),
        origin: BASE_URL,
        href: "",
        search: "",
      },
      addEventListener: function () {},
      removeEventListener: function () {},
    };
    var parent = {
      MacPlayer: {
        Id: String(mediaId || ""),
      },
    };
    var document = fakeDocument;
    var localStorage = fakeStorage;
    var location = window.location;
    var navigator = { userAgent: UA };
    var performance = { now: function () { return 0; } };
    var URLSearchParams = function () {
      this.get = function () {
        return "";
      };
    };
    var URL = function (url) {
      this.href = String(url || "");
      this.origin = BASE_URL;
    };
    var Artplayer = function () {
      return {
        controls: { add: function () {} },
        notice: {},
        template: {},
        on: function () {},
        play: function () {},
        pause: function () {},
        switchUrl: function () {},
      };
    };
    var Hls = function () {};
    var mpegts = {};
    var root = null;
    var oldGlobals = {};
    var names = [
      "window",
      "parent",
      "document",
      "localStorage",
      "location",
      "navigator",
      "performance",
      "URLSearchParams",
      "URL",
      "Artplayer",
      "Hls",
      "mpegts",
      "fetch",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ];

    try {
      root = Function("return this")();
      for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
        oldGlobals[names[nameIndex]] = root[names[nameIndex]];
      }
      root.window = window;
      root.parent = parent;
      root.document = document;
      root.localStorage = localStorage;
      root.location = location;
      root.navigator = navigator;
      root.performance = performance;
      root.URLSearchParams = URLSearchParams;
      root.URL = URL;
      root.Artplayer = Artplayer;
      root.Hls = Hls;
      root.mpegts = mpegts;
      root.fetch = fetch;
      root.setTimeout = setTimeout;
      root.clearTimeout = clearTimeout;
      root.setInterval = setInterval;
      root.clearInterval = clearInterval;
    } catch (error) {}

    eval(scriptBody);

    if (typeof execB !== "function") {
      return "";
    }

    var decrypted = execB(encryptedURL);
    return looksLikeResolvedMediaURL(decrypted) ? decrypted : "";
  } catch (error) {
    return "";
  } finally {
    if (root) {
      for (var restoreIndex = 0; restoreIndex < names.length; restoreIndex++) {
        var restoreName = names[restoreIndex];
        if (typeof oldGlobals[restoreName] === "undefined") {
          try {
            delete root[restoreName];
          } catch (error) {}
        } else {
          root[restoreName] = oldGlobals[restoreName];
        }
      }
    }
  }
}

function resolveArtplayerURL(playAPIBase, config, callback) {
  var next = config.link_next ? buildAbsoluteURL(config.link_next) : "";
  var artplayerURL =
    playAPIBase +
    config.url +
    (next ? "&next=" + encodeURIComponent(next) : "");

  $http
    .fetch({
      url: buildAbsoluteURL(artplayerURL),
      method: "GET",
      headers: {
        "User-Agent": UA,
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      var playPageUrl = extractQuotedConst(res.body, "playPageUrl");
      var secretKeySeed = extractQuotedConst(res.body, "secretKeySeed");
      var scriptBody = extractArtplayerScript(res.body);

      if (!playPageUrl || !secretKeySeed || !scriptBody) {
        callback("");
        return;
      }

      var t = Math.floor(Date.now() / 1000);
      var postBody = JSON.stringify({
        vkey: playPageUrl,
        code: secretKeySeed,
        t: t,
        signature: CryptoJS.MD5(String(t)).toString(),
      });

      $http
        .fetch({
          url: SMARTPLAY_API_URL,
          method: "POST",
          body: postBody,
          headers: {
            "Content-Type": "application/json",
            Origin: BASE_URL,
            Referer: buildAbsoluteURL(artplayerURL),
            "User-Agent": UA,
          },
        })
        .then(function (apiRes) {
          try {
            var data = JSON.parse(apiRes.body);
            var encryptedURL = data && data.url ? normalizePlayableURL(data.url) : "";
            callback(decryptArtplayerURL(scriptBody, encryptedURL, config.id));
          } catch (error) {
            callback("");
          }
        })
        .catch(function () {
          callback("");
        });
    })
    .catch(function () {
      callback("");
    });
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
        "User-Agent": UA,
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

function extractYD189ParseURL(body) {
  if (!body) {
    return "";
  }

  var matched = body.match(/fetch\(["']([^"']*\/vid\/parse_yd\.php[^"']*)["']/);
  return matched && matched[1] ? normalizePlayableURL(matched[1]) : "";
}

function resolveYD189URL(ydPlayerURL, callback) {
  $http
    .fetch({
      url: buildAbsoluteURL(ydPlayerURL),
      method: "GET",
      headers: {
        "User-Agent": UA,
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      var parseURL = extractYD189ParseURL(res.body);
      if (!parseURL) {
        callback("");
        return;
      }

      $http
        .fetch({
          url: buildAbsoluteURL(parseURL),
          method: "GET",
          headers: {
            "User-Agent": UA,
          },
        })
        .then(function (parseRes) {
          try {
            var data = JSON.parse(parseRes.body);
            callback(data && data.url ? normalizePlayableURL(data.url) : "");
          } catch (error) {
            callback("");
          }
        })
        .catch(function () {
          callback("");
        });
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
      headers: {
        "User-Agent": UA,
        Referer: REFERER_URL,
      },
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

  if (looksLikeResolvedMediaURL(url)) {
    callback(normalizePlayableURL(url));
    return;
  }

  if (from === "ty_new1") {
    fetchPlayableURLByAPI(buildAbsoluteURL("/vid/ty4.php?url=" + url), callback);
    return;
  }

  getPlayAPIBaseForSource(from, function (playAPIBase) {
    if (!playAPIBase) {
      callback("");
      return;
    }

    if (playAPIBase.indexOf("/static/player/artplayer/") >= 0) {
      resolveArtplayerURL(playAPIBase, config, callback);
      return;
    }

    if (from === "yd189") {
      resolveYD189URL(
        buildAbsoluteURL(playAPIBase + url + "&next=" + next + "&id=" + id + "&nid=" + nid),
        callback
      );
      return;
    }

    if (from === "tweb") {
      var twebPlayAPIURL = buildAbsoluteURL(playAPIBase + url);
      $http
        .fetch({
          url: twebPlayAPIURL,
          headers: {
            "User-Agent": UA,
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
  var playlistGroups = extractPlayablePlaylistGroups(body);
  if (playlistGroups.length) {
    var urls = [];
    for (var groupIndex = 0; groupIndex < playlistGroups.length; groupIndex++) {
      for (var urlIndex = 0; urlIndex < playlistGroups[groupIndex].episodes.length; urlIndex++) {
        urls.push(playlistGroups[groupIndex].episodes[urlIndex].href);
      }
    }
    return urls;
  }

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
      url: buildAbsoluteURL(playPageURL),
      method: "GET",
      headers: {
        "User-Agent": UA,
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
      url: buildAbsoluteURL(detailURL),
      method: "GET",
      headers: {
        "User-Agent": UA,
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      callback(detailHasPlayableSourceTag(res.body));
    })
    .catch(function () {
      callback(false);
    });
}

function stripTags(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPlayablePlaylistGroups(body) {
  var groups = [];
  var html = String(body || "");
  var blockPattern =
    /<div\b[^>]*class=["'][^"']*\b(?:stui-vodlist__head|panel-head)\b[^"']*["'][^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<\/div>\s*<ul\b[^>]*class=["'][^"']*\bstui-content__playlist\b[^"']*["'][^>]*>([\s\S]*?)<\/ul>/gi;
  var blockMatch;

  while ((blockMatch = blockPattern.exec(html)) !== null) {
    var sourceTitle = stripTags(blockMatch[1]);
    if (!sourceTitle || isUnsupportedSourceTitle(sourceTitle)) {
      continue;
    }

    var episodes = [];
    var linkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var linkMatch;
    while ((linkMatch = linkPattern.exec(blockMatch[2])) !== null) {
      var href = buildURL(linkMatch[1]);
      if (!href) {
        continue;
      }

      episodes.push({
        href: href,
        title: stripTags(linkMatch[2]) || href,
      });
    }

    if (episodes.length) {
      groups.push({
        title: sourceTitle,
        episodes: episodes,
      });
    }
  }

  return groups;
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
      url: buildAbsoluteURL(inputURL),
      method: "GET",
      headers: {
        "User-Agent": UA,
        Referer: REFERER_URL,
      },
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
    url: buildAbsoluteURL(inputURL),
    method: "GET",
    headers: {
      "User-Agent": UA,
      Referer: REFERER_URL,
    },
  };

  let datas = [];

  $http.fetch(req).then(function (res) {
    if (!detailHasPlayableSourceTag(res.body)) {
      if ($next.emptyView) {
        $next.emptyView("此資源目前僅網盤或無站內可播源，請返回選擇其他資源。");
      }
      $next.toEpisodes(JSON.stringify(datas));
      return;
    }

    var playlistGroups = extractPlayablePlaylistGroups(res.body);
    for (var groupIndex = 0; groupIndex < playlistGroups.length; groupIndex++) {
      var group = playlistGroups[groupIndex];
      for (var episodeIndex = 0; episodeIndex < group.episodes.length; episodeIndex++) {
        var episode = group.episodes[episodeIndex];
        datas.push(
          buildEpisodeData(
            episode.href,
            group.title + " " + episode.title,
            episode.href
          )
        );
      }
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function Player(inputURL) {
  $http
    .fetch({
      url: buildAbsoluteURL(inputURL),
      method: "GET",
      headers: {
        "User-Agent": UA,
        Referer: REFERER_URL,
      },
    })
    .then(function (res) {
      var config = extractPlayerConfig(res.body);
      if (!config) {
        reportPlayerUnavailable("libvio: 读取播放器配置失败");
        return;
      }

      if (config.from === "kuake" || config.from === "uc") {
        reportPlayerUnavailable("未能支持網盤播放，請按返回");
        return;
      }

      resolvePlayableURLByConfig(config, function (playURL) {
        if (!playURL) {
          reportPlayerUnavailable("libvio: 解析播放地址失败(" + config.from + ")");
          return;
        }

        gotoPlay(playURL);
      });
    })
    .catch(function () {
      reportPlayerUnavailable("libvio: 播放页请求失败");
    });
}

function reportPlayerUnavailable(message) {
  if ($next.emptyView) {
    $next.emptyView(message);
  }
  print(message);
}

function gotoPlay(url) {
  try {
    let json = {
      url: url,
      headers: {
        "User-Agent":
          UA,
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
