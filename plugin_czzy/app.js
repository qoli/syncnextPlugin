`user script`;

const SITE = "https://www.czzymovie.com";
const CUSTOM_SCHEME = "czzy://";
const ALI_PREFIX = "ali-share://";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const TAB_ALIAS = {
  home: ["首頁", "首页", "Home"],
  movie: ["電影", "电影"],
  tv: ["劇集", "電視劇", "电视剧"],
  anime: ["動漫", "动画", "动漫", "番剧"],
  variety: ["綜藝", "综艺"],
};

const IGNORE_TABS = ["关于", "公告", "官方", "备用", "群", "地址", "求片"];

let cachedTabs = null;

function print(params) {
  params = params || "";
  if (typeof params === "object") {
    try {
      console.log(JSON.stringify(params));
    } catch (e) {
      console.log(typeof params + ":" + params.length);
    }
  } else {
    console.log(params);
  }
}

function buildMediaData(id, coverURLString, title, descriptionText, detailURLString) {
  return {
    id,
    coverURLString,
    title,
    descriptionText,
    detailURLString,
  };
}

function buildEpisodeData(id, title, episodeDetailURL) {
  return {
    id,
    title,
    episodeDetailURL,
  };
}

function findAllByKey(obj, keyToFind) {
  if (!obj) {
    return [];
  }
  return (
    Object.entries(obj).reduce(function (acc, entry) {
      var key = entry[0];
      var value = entry[1];
      if (key === keyToFind) {
        acc.push(value);
      } else if (value && typeof value === "object") {
        acc = acc.concat(findAllByKey(value, keyToFind));
      }
      return acc;
    }, []) || []
  );
}

function buildMedias(inputURL, key) {
  resolveListURL(inputURL, key)
    .then(function (target) {
      return requestHTML(target.url).then(function (html) {
        var medias = parseMediaList(html, target.url);
        if (!medias.length) {
          $next.emptyView("暫時沒有可用的影片，稍後再試");
          return;
        }
        $next.toMedias(JSON.stringify(medias), key);
      });
    })
    .catch(function (error) {
      print(error);
      $next.emptyView("載入失敗，請稍後重試");
    });
}

function Episodes(inputURL) {
  if (!inputURL) {
    $next.emptyView("缺少影片地址");
    return;
  }
  requestHTML(inputURL)
    .then(function (html) {
      var data = parseEpisodes(html, inputURL);
      var episodes = data.streams.map(function (item) {
        return buildEpisodeData(item.href, item.name, item.href);
      });
      data.ali.forEach(function (item) {
        var aliURL = ALI_PREFIX + encodeURIComponent(item.href);
        episodes.push(buildEpisodeData(aliURL, "阿里雲盤 - " + item.name, aliURL));
      });
      if (!episodes.length) {
        $next.emptyView("找不到可用的劇集");
        return;
      }
      $next.toEpisodes(JSON.stringify(episodes));
    })
    .catch(function (error) {
      print(error);
      $next.emptyView("劇集載入失敗");
    });
}

function Player(inputURL) {
  if (!inputURL) {
    $next.emptyView("缺少播放地址");
    return;
  }
  if (inputURL.indexOf(ALI_PREFIX) === 0) {
    var ali = decodeURIComponent(inputURL.slice(ALI_PREFIX.length));
    $next.aliLink(ali);
    return;
  }
  var normalizedURL = normalizeURL(inputURL);
  requestHTML(normalizedURL)
    .then(function (html) {
      return resolvePlayURL(html, normalizedURL);
    })
    .then(function (playURL) {
      if (!playURL) {
        $next.emptyView("無法解析播放鏈接");
        return;
      }
      var payload = {
        url: playURL,
        headers: {
          "User-Agent": UA,
          Referer: normalizedURL,
        },
      };
      $next.toPlayerByJSON(JSON.stringify(payload));
    })
    .catch(function (error) {
      print(error);
      $next.emptyView("播放解析失敗");
    });
}

function Search(inputURL, key) {
  requestHTML(inputURL)
    .then(function (html) {
      var medias = parseMediaList(html, inputURL);
      if (!medias.length) {
        $next.emptyView("找不到相關內容");
        return;
      }
      $next.toSearchMedias(JSON.stringify(medias), key);
    })
    .catch(function (error) {
      print(error);
      $next.emptyView("搜尋失敗，請稍後重試");
    });
}

function resolveListURL(inputURL, key) {
  var parsed = parsePluginURL(inputURL);
  var page = parsed.page || 1;
  if (parsed.url && parsed.url.indexOf("http") === 0) {
    return Promise.resolve({
      url: buildPageURL(parsed.url, page),
      page: page,
    });
  }
  var identifier = parsed.identifier || key || "home";
  return resolveCategoryBase(identifier).then(function (baseURL) {
    return {
      url: buildPageURL(baseURL, page),
      page: page,
    };
  });
}

function resolveCategoryBase(identifier) {
  if (!identifier || identifier === "home") {
    return Promise.resolve(SITE);
  }
  return fetchTabs().then(function (tabs) {
    if (!tabs.length) {
      return SITE;
    }
    var alias = TAB_ALIAS[identifier] || [identifier];
    for (var i = 0; i < alias.length; i++) {
      var keyword = alias[i];
      for (var j = 0; j < tabs.length; j++) {
        if (tabMatch(tabs[j].name, keyword)) {
          return tabs[j].url;
        }
      }
    }
    return tabs[0].url;
  });
}

function tabMatch(source, keyword) {
  return (
    source.indexOf(keyword) !== -1 ||
    keyword.indexOf(source) !== -1 ||
    cleanText(source) === cleanText(keyword)
  );
}

function fetchTabs() {
  if (cachedTabs) {
    return Promise.resolve(cachedTabs);
  }
  return requestHTML(SITE).then(function (html) {
    cachedTabs = parseTabs(html);
    return cachedTabs;
  });
}

function parseTabs(html) {
  var results = [];
  var navRegex = /<ul[^>]+class="[^"]*submenu_mi[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi;
  var match;
  while ((match = navRegex.exec(html)) !== null) {
    var block = match[1];
    var anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    var anchor;
    while ((anchor = anchorRegex.exec(block)) !== null) {
      var name = cleanText(decodeHTML(stripTags(anchor[2])));
      if (!name) {
        continue;
      }
      if (shouldIgnoreTab(name)) {
        continue;
      }
      var href = normalizeURL(anchor[1]);
      results.push({
        name: name,
        url: href,
      });
    }
  }
  return results;
}

function shouldIgnoreTab(name) {
  for (var i = 0; i < IGNORE_TABS.length; i++) {
    if (name.indexOf(IGNORE_TABS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function parseMediaList(html, referer) {
  var cards = [];
  var containers = tXml.getElementsByClassName(html, "bt_img");
  if (!containers || !containers.length) {
    return cards;
  }
  var seen = {};
  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];
    var className = (container.attributes && container.attributes.class) || "";
    if (className.indexOf("mi_ne_kd") === -1 || className.indexOf("mrb") === -1) {
      continue;
    }
    var listItems = [];
    collectByTag(container.children || [], "li", listItems);
    for (var j = 0; j < listItems.length; j++) {
      var node = listItems[j];
      var href = normalizeURL(first(findAllByKey(node, "href")));
      if (!href || seen[href]) {
        continue;
      }
      seen[href] = true;
      var cover = normalizeURL(first(findAllByKey(node, "data-original")) || first(findAllByKey(node, "src")));
      var rawTitle = first(findAllByKey(node, "alt")) || first(findAllByKey(node, "title"));
      var title = cleanText(decodeHTML(rawTitle));
      if (!title) {
        continue;
      }
      var remark = extractRemark(node);
      cards.push(buildMediaData(href, cover, title, remark, href));
      if (cards.length >= 40) {
        return cards;
      }
    }
  }
  return cards;
}

function extractRemark(node) {
  var html = stringifyNode(node);
  var remark =
    extractByClass(html, "jidi") ||
    extractByClass(html, "hdinfo") ||
    extractByClass(html, "qb") ||
    "";
  return cleanText(decodeHTML(remark));
}

function extractByClass(html, className) {
  if (!html) {
    return "";
  }
  var regex = new RegExp('<[^>]*class="[^"]*' + className + '[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>', "i");
  var match = html.match(regex);
  if (!match) {
    return "";
  }
  return stripTags(match[1]);
}

function stringifyNode(node) {
  try {
    return tXml.stringify([node]);
  } catch (e) {
    return "";
  }
}

function collectByTag(children, tagName, bucket) {
  if (!children || !children.length) {
    return;
  }
  for (var i = 0; i < children.length; i++) {
    var item = children[i];
    if (!item) {
      continue;
    }
    if (typeof item === "string") {
      continue;
    }
    if (item.tagName === tagName) {
      bucket.push(item);
    }
    if (item.children && item.children.length) {
      collectByTag(item.children, tagName, bucket);
    }
  }
}

function parseEpisodes(html, referer) {
  var streams = [];
  var ali = [];
  var listRegex = /<div[^>]+class="[^"]*paly_list_btn[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  var match;
  while ((match = listRegex.exec(html)) !== null) {
    var anchors = extractAnchors(match[1], referer);
    streams = streams.concat(anchors);
  }

  var panMatch = html.match(/<div[^>]+class="[^"]*ypbt_down_list[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (panMatch) {
    var panAnchors = extractAnchors(panMatch[1], referer);
    for (var i = 0; i < panAnchors.length; i++) {
      if (/ali(?:yun|pan|drive)/i.test(panAnchors[i].href)) {
        ali.push(panAnchors[i]);
      }
    }
  }
  return { streams: streams, ali: ali };
}

function extractAnchors(sectionHTML, referer) {
  var anchors = [];
  if (!sectionHTML) {
    return anchors;
  }
  var anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  var match;
  while ((match = anchorRegex.exec(sectionHTML)) !== null) {
    var href = normalizeURL(match[1], referer);
    var name = cleanText(decodeHTML(stripTags(match[2])));
    if (href && name) {
      anchors.push({ href: href, name: name });
    }
  }
  return anchors;
}

function resolvePlayURL(html, detailURL) {
  var iframeSrc = extractIframeSrc(html);
  if (iframeSrc) {
    var iframeURL = normalizeURL(iframeSrc, detailURL);
    var headers = {
      "User-Agent": UA,
    };
    if (iframeURL.indexOf("player-v2") !== -1) {
      headers["sec-fetch-dest"] = "iframe";
      headers["sec-fetch-mode"] = "navigate";
      headers.Referer = SITE + "/";
    }
    return requestHTML(iframeURL, headers).then(function (iframeHTML) {
      return parseIframePlayer(iframeHTML);
    });
  }
  var fallback = resolveViaNonce(html);
  if (fallback) {
    return Promise.resolve(fallback);
  }
  return Promise.resolve(null);
}

function extractIframeSrc(html) {
  var iframeMatch = html.match(/<iframe[^>]+src=['"]([^'"]+)['"]/i);
  if (iframeMatch) {
    return iframeMatch[1];
  }
  return null;
}

function parseIframePlayer(html) {
  var scripts = extractScripts(html);
  for (var i = scripts.length - 1; i >= 0; i--) {
    var code = scripts[i];
    var encrypted = parseEncryptedPlayer(code);
    if (encrypted) {
      return encrypted;
    }
    var reversed = parseReversedData(code);
    if (reversed) {
      return reversed;
    }
  }
  return null;
}

function parseEncryptedPlayer(code) {
  if (code.indexOf("var player") === -1) {
    return null;
  }
  var playerMatch = code.match(/var player = "(.*?)"/);
  var randMatch = code.match(/var rand = "(.*?)"/);
  if (!playerMatch || !randMatch) {
    return null;
  }
  try {
    var content = decryptAES(playerMatch[1], "VFBTzdujpR9FWBhe", randMatch[1]);
    var parsed = JSON.parse(content);
    if (parsed && parsed.url) {
      return parsed.url;
    }
  } catch (error) {
    print(error);
  }
  return null;
}

function parseReversedData(code) {
  if (code.indexOf('"data":"') === -1) {
    return null;
  }
  try {
    var data = code.split('"data":"')[1].split('"')[0];
    var encrypted = data.split("").reverse().join("");
    var temp = "";
    for (var i = 0; i < encrypted.length; i = i + 2) {
      temp += String.fromCharCode(parseInt(encrypted[i] + encrypted[i + 1], 16));
    }
    var point = (temp.length - 7) / 2;
    return temp.substring(0, point) + temp.substring(point + 7);
  } catch (error) {
    print(error);
    return null;
  }
}

function resolveViaNonce(html) {
  var scriptMatch = html.match(/<script[^>]*>[\s\S]*?window\.wp_nonce[\s\S]*?<\/script>/i);
  if (!scriptMatch) {
    return null;
  }
  var scriptContent = stripScriptTags(scriptMatch[0]);
  var group = scriptContent.match(/(var.*)eval\((\w+\(\w+\))\)/);
  if (!group) {
    return null;
  }
  try {
    var md5 = CryptoJS;
    var result = eval(group[1] + group[2]);
    var match = result.match(/url:.*?['"](.*?)['"]/);
    if (match) {
      return match[1];
    }
  } catch (error) {
    print(error);
  }
  return null;
}

function decryptAES(text, key, iv) {
  try {
    var keyValue = CryptoJS.enc.Utf8.parse(key || "PBfAUnTdMjNDe6pL");
    var ivValue = CryptoJS.enc.Utf8.parse(iv || "sENS6bVbwSfvnXrj");
    var content = CryptoJS.AES.decrypt(text, keyValue, {
      iv: ivValue,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    return content;
  } catch (error) {
    print(error);
    return "";
  }
}

function extractScripts(html) {
  var scripts = [];
  var scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  var match;
  while ((match = scriptRegex.exec(html)) !== null) {
    var content = (match[1] || "").trim();
    if (content) {
      scripts.push(content);
    }
  }
  return scripts;
}

function stripScriptTags(block) {
  return block.replace(/<\/?script[^>]*>/gi, "");
}

function requestHTML(url, extraHeaders) {
  var headers = {
    "User-Agent": UA,
  };
  if (extraHeaders) {
    for (var key in extraHeaders) {
      headers[key] = extraHeaders[key];
    }
  }
  var req = {
    url: url,
    method: "GET",
    headers: headers,
  };
  return $http.fetch(req).then(function (res) {
    return res.body || "";
  });
}

function parsePluginURL(inputURL) {

  print(inputURL);
  

  if (!inputURL) {
    return { page: 1 };
  }
  if (inputURL.indexOf(CUSTOM_SCHEME) === 0) {
    var rest = inputURL.slice(CUSTOM_SCHEME.length);
    var parts = rest.split("?");
    var identifier = parts[0] || "";
    var params = parseQuery(parts[1] || "");
    return {
      identifier: identifier,
      page: parseInt(params.page || "1", 10) || 1,
    };
  }
  return {
    url: inputURL,
    page: extractPageNumber(inputURL),
  };
}

function parseQuery(queryString) {
  var map = {};
  if (!queryString) {
    return map;
  }
  var pairs = queryString.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split("=");
    if (parts.length === 2) {
      var key = decodeURIComponentSafe(parts[0]);
      var value = decodeURIComponentSafe(parts[1]);
      map[key] = value;
    }
  }
  return map;
}

function extractPageNumber(url) {
  var match = url.match(/\/page\/(\d+)/i);
  if (match) {
    return parseInt(match[1], 10) || 1;
  }
  return 1;
}

function buildPageURL(baseURL, page) {
  if (page <= 1) {
    return baseURL;
  }
  var trimmed = baseURL.replace(/\/+$/, "");
  return trimmed + "/page/" + page;
}

function normalizeURL(href, referer) {
  if (!href) {
    return "";
  }
  if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
    return href;
  }
  if (href.indexOf("//") === 0) {
    return "https:" + href;
  }
  if (href.indexOf("/") === 0) {
    return SITE + href;
  }
  if (referer) {
    var base = referer.split("?")[0];
    var idx = base.lastIndexOf("/");
    if (idx > 7) {
      base = base.substring(0, idx + 1);
    } else if (base[base.length - 1] !== "/") {
      base = base + "/";
    }
    return base + href;
  }
  return SITE + "/" + href;
}

function first(list) {
  return list && list.length ? list[0] : "";
}

function stripTags(str) {
  if (!str) {
    return "";
  }
  return str.replace(/<[^>]+>/g, " ");
}

function cleanText(str) {
  if (!str) {
    return "";
  }
  return str.replace(/\s+/g, " ").trim();
}

function decodeHTML(str) {
  if (!str) {
    return "";
  }
  return str.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, function (_, entity) {
    var lower = entity.toLowerCase();
    if (lower === "nbsp") {
      return " ";
    }
    if (lower === "amp") {
      return "&";
    }
    if (lower === "quot") {
      return '"';
    }
    if (lower === "lt") {
      return "<";
    }
    if (lower === "gt") {
      return ">";
    }
    if (lower === "apos" || lower === "#39") {
      return "'";
    }
    if (entity.charAt(0) === "#") {
      var isHex = entity.charAt(1).toLowerCase() === "x";
      var number = isHex ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!isNaN(number)) {
        return String.fromCharCode(number);
      }
    }
    return "&" + entity + ";";
  });
}

function decodeURIComponentSafe(value) {
  try {
    return decodeURIComponent(value || "");
  } catch (error) {
    return value || "";
  }
}
