`user script`;

const HOST = "https://www.czzymovie.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

var cookieStore = {};

function getDomainKey(url) {
  var match = (url || "").match(/^https?:\/\/([^\/]+)/i);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }
  return "www.czzymovie.com";
}

function storeCookiesFromHeaders(headers, url) {
  if (!headers) {
    return;
  }

  var setCookieHeader = null;
  if (headers["Set-Cookie"]) {
    setCookieHeader = headers["Set-Cookie"];
  } else if (headers["set-cookie"]) {
    setCookieHeader = headers["set-cookie"];
  } else {
    for (var key in headers) {
      if (key && key.toLowerCase() === "set-cookie") {
        setCookieHeader = headers[key];
        break;
      }
    }
  }

  if (!setCookieHeader) {
    return;
  }

  var domainKey = getDomainKey(url);
  var jar = cookieStore[domainKey] || {};
  var entries = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry) {
      continue;
    }

    var pair = entry.split(";")[0];
    var separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    var cookieName = pair.substring(0, separatorIndex).trim();
    var cookieValue = pair.substring(separatorIndex + 1).trim();
    if (cookieName) {
      jar[cookieName] = cookieValue;
    }
  }

  cookieStore[domainKey] = jar;
}

function buildCookieHeader(url) {
  var domainKey = getDomainKey(url);
  var jar = cookieStore[domainKey];
  if (!jar) {
    return "";
  }

  var pairs = [];
  for (var name in jar) {
    if (jar.hasOwnProperty(name)) {
      pairs.push(name + "=" + jar[name]);
    }
  }

  return pairs.join("; ");
}

function print(params) {
  try {
    console.log(JSON.stringify(params));
  } catch (error) { }
}

function buildMediaData(
  id,
  coverURLString,
  title,
  descriptionText,
  detailURLString
) {
  return {
    id: id,
    coverURLString: coverURLString || "",
    title: title || "",
    descriptionText: descriptionText || "",
    detailURLString: detailURLString || "",
  };
}

function buildEpisodeData(id, title, episodeDetailURL) {
  return {
    id: id,
    title: title || "",
    episodeDetailURL: episodeDetailURL || "",
  };
}

function sanitizeText(text) {
  if (!text) {
    return "";
  }

  return String(text).replace(/\s+/g, " ").trim();
}

function normalizeURL(href) {
  if (!href) {
    return "";
  }

  var value = href.trim();
  if (!value) {
    return "";
  }

  var lowerValue = value.toLowerCase();
  if (
    lowerValue.indexOf("javascript:") === 0 ||
    lowerValue.indexOf("mailto:") === 0 ||
    value.indexOf("#") === 0
  ) {
    return "";
  }

  if (
    lowerValue.startsWith("http://") ||
    lowerValue.startsWith("https://") ||
    lowerValue.startsWith("magnet:") ||
    lowerValue.startsWith("ed2k:") ||
    lowerValue.startsWith("ftp:")
  ) {
    if (value.startsWith("//")) {
      return "https:" + value;
    }
    return value;
  }

  if (value.startsWith("//")) {
    return "https:" + value;
  }

  if (value.startsWith("/")) {
    return HOST + value;
  }

  return HOST + "/" + value;
}

function normalizeAssetURL(url) {
  if (!url) {
    return "";
  }

  if (url.startsWith("data:image")) {
    return url;
  }

  return normalizeURL(url);
}

function isHTTPURL(url) {
  if (!url) {
    return false;
  }

  var lower = url.toLowerCase();
  return lower.indexOf("http://") === 0 || lower.indexOf("https://") === 0;
}

function fetchHTML(url, options, onSuccess, onError) {
  if (typeof options === "function") {
    onError = onSuccess;
    onSuccess = options;
    options = null;
  }

  options = options || {};
  var targetURL = normalizeURL(url);

  if (!targetURL || !isHTTPURL(targetURL)) {
    if (typeof onError === "function") {
      try {
        onError("Invalid URL");
      } catch (error) { }
    }
    return;
  }

  var headers = {
    "User-Agent": UA,
  };

  if (options.referer) {
    headers.Referer = options.referer;
  } else {
    headers.Referer = HOST;
  }

  var extraHeaders = options.headers;
  if (extraHeaders) {
    for (var key in extraHeaders) {
      headers[key] = extraHeaders[key];
    }
  }

  var cookieHeader = buildCookieHeader(targetURL);
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  var shouldSaveCookies = true;
  if (options && options.saveCookies === false) {
    shouldSaveCookies = false;
  }

  $http.fetch({
    url: targetURL,
    method: "GET",
    headers: headers,
  }).then(
    function (res) {
      if (shouldSaveCookies) {
        storeCookiesFromHeaders(res.headers, targetURL);
      }

      if (typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    function (error) {
      if (typeof onError === "function") {
        try {
          onError(error);
        } catch (err) { }
      }
    }
  );
}

function getAttribute(node, name) {
  if (!node || typeof node === "string" || !node.attributes) {
    return "";
  }

  return node.attributes[name] || "";
}

function hasClass(node, className) {
  if (!node || typeof node === "string" || !node.attributes) {
    return false;
  }

  var classValue = node.attributes["class"];
  if (!classValue) {
    return false;
  }

  var classes = classValue.split(/\s+/);
  return classes.indexOf(className) !== -1;
}

function getTextContent(node) {
  if (!node) {
    return "";
  }

  if (Array.isArray(node)) {
    var arrText = "";
    for (var i = 0; i < node.length; i++) {
      var part = getTextContent(node[i]);
      if (part) {
        arrText = arrText ? arrText + " " + part : part;
      }
    }
    return arrText.trim();
  }

  if (typeof node === "string") {
    return sanitizeText(node);
  }

  var children = node.children || [];
  var text = "";
  for (var index = 0; index < children.length; index++) {
    var childText = getTextContent(children[index]);
    if (childText) {
      text = text ? text + " " + childText : childText;
    }
  }

  return text.trim();
}

function findFirstTag(node, tag) {
  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var nested = findFirstTag(node[i], tag);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (typeof node === "string") {
    return null;
  }

  var currentTag = (node.tagName || "").toLowerCase();
  if (currentTag === tag.toLowerCase()) {
    return node;
  }

  var children = node.children || [];
  for (var index = 0; index < children.length; index++) {
    var found = findFirstTag(children[index], tag);
    if (found) {
      return found;
    }
  }
  return null;
}

function findFirstClass(node, className) {
  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var nested = findFirstClass(node[i], className);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (typeof node === "string") {
    return null;
  }

  if (hasClass(node, className)) {
    return node;
  }

  var children = node.children || [];
  for (var index = 0; index < children.length; index++) {
    var found = findFirstClass(children[index], className);
    if (found) {
      return found;
    }
  }

  return null;
}

function collectNodesByTag(node, tag, result) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      collectNodesByTag(node[i], tag, result);
    }
    return;
  }

  if (typeof node === "string") {
    return;
  }

  var currentTag = (node.tagName || "").toLowerCase();
  if (currentTag === tag.toLowerCase()) {
    result.push(node);
  }

  var children = node.children || [];
  for (var index = 0; index < children.length; index++) {
    collectNodesByTag(children[index], tag, result);
  }
}

function dedupeMedias(list) {
  var seen = {};
  var result = [];

  for (var index = 0; index < list.length; index++) {
    var item = list[index];
    var key = item.detailURLString || item.id;
    if (!key || seen[key]) {
      continue;
    }

    seen[key] = true;
    result.push(item);
  }

  return result;
}

function parseMediaCardsFromHTML(html) {
  var containers = tXml.getElementsByClassName(html, "bt_img");
  var medias = [];

  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];
    if (!container || typeof container === "string") {
      continue;
    }

    var liNodes = [];
    collectNodesByTag(container, "li", liNodes);

    for (var j = 0; j < liNodes.length; j++) {
      var li = liNodes[j];
      if (!li || typeof li === "string") {
        continue;
      }

      var anchor = findFirstTag(li, "a");
      var image = findFirstTag(li, "img");

      if (!anchor || !image) {
        continue;
      }

      var href = normalizeURL(getAttribute(anchor, "href"));
      if (!href) {
        continue;
      }

      var title =
        sanitizeText(getAttribute(image, "alt")) ||
        sanitizeText(getAttribute(anchor, "title")) ||
        getTextContent(anchor) ||
        getTextContent(li);

      var cover =
        normalizeAssetURL(getAttribute(image, "data-original")) ||
        normalizeAssetURL(getAttribute(image, "data-src")) ||
        normalizeAssetURL(getAttribute(image, "src"));

      var badgeNode = findFirstClass(li, "jidi") || findFirstClass(li, "hdinfo");
      var description = getTextContent(badgeNode);

      medias.push(
        buildMediaData(
          href,
          cover,
          title || "未命名",
          description || "",
          href
        )
      );
    }
  }

  return dedupeMedias(medias);
}

function buildMedias(inputURL, key) {
  fetchHTML(
    inputURL,
    null,
    function (res) {

      var medias = parseMediaCardsFromHTML(res.body || "");
      var payload = JSON.stringify(medias);

      if (key) {
        $next.toMedias(payload, key);
      } else {
        $next.toMedias(payload);
      }
    },
    function () {
      $next.emptyView("無法載入內容，請稍後再試");
    }
  );
}

function Search(inputURL, key) {
  fetchHTML(
    inputURL,
    null,
    function (res) {
      var medias = parseMediaCardsFromHTML(res.body || "");
      var payload = JSON.stringify(medias);

      $next.toSearchMedias(payload, key);
    },
    function () {
      $next.emptyView("搜尋失敗，請稍後再試");
    }
  );
}

function detectPanProvider(url) {
  if (!url) {
    return "";
  }

  var lower = url.toLowerCase();

  if (lower.indexOf("aliyundrive") !== -1 || lower.indexOf("alipan") !== -1) {
    return "阿里雲盤";
  }

  if (lower.indexOf("quark") !== -1) {
    return "夸克";
  }

  if (lower.indexOf("115.com") !== -1) {
    return "115";
  }

  if (lower.indexOf("baidu") !== -1) {
    return "百度";
  }

  if (lower.indexOf("ucpan") !== -1 || lower.indexOf("uc.cn") !== -1) {
    return "UC";
  }

  return "";
}

function parseEpisodeNodes(html, className) {
  var sections = tXml.getElementsByClassName(html, className);
  var anchors = [];

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    if (!section || typeof section === "string") {
      continue;
    }

    collectNodesByTag(section, "a", anchors);
  }

  return anchors;
}

function buildEpisodeList(html) {
  var anchors = parseEpisodeNodes(html, "paly_list_btn");
  var episodes = [];

  for (var i = 0; i < anchors.length; i++) {
    var anchor = anchors[i];
    var href = normalizeURL(getAttribute(anchor, "href"));
    if (!href) {
      continue;
    }

    var title = getTextContent(anchor) || "播放";
    episodes.push(buildEpisodeData(href, title, href));
  }

  var panAnchors = parseEpisodeNodes(html, "ypbt_down_list");

  for (var j = 0; j < panAnchors.length; j++) {
    var panAnchor = panAnchors[j];
    var panHref = getAttribute(panAnchor, "href");
    if (!panHref) {
      continue;
    }

    var panTarget = normalizeURL(panHref);
    if (!panTarget) {
      continue;
    }

    var provider = detectPanProvider(panTarget);
    var panTitle =
      sanitizeText(getTextContent(panAnchor)) || provider || "雲盤資源";
    if (provider) {
      panTitle = "[" + provider + "] " + panTitle;
    }

    episodes.push(
      buildEpisodeData(panTarget, panTitle, panTarget)
    );
  }

  var seen = {};
  var result = [];

  for (var index = 0; index < episodes.length; index++) {
    var item = episodes[index];
    var key = item.episodeDetailURL;

    if (!key || seen[key]) {
      continue;
    }

    seen[key] = true;
    result.push(item);
  }

  return result;
}

function Episodes(inputURL) {
  fetchHTML(
    inputURL,
    null,
    function (res) {
      var list = buildEpisodeList(res.body || "");

      if (list.length === 0) {
        $next.emptyView("暫無可用劇集，請稍後再試");
        return;
      }

      $next.toEpisodes(JSON.stringify(list));
    },
    function () {
      $next.emptyView("載入劇集失敗，請稍後再試");
    }
  );
}

function isAliShare(url) {
  if (!url) {
    return false;
  }

  var lower = url.toLowerCase();
  return (
    lower.indexOf("aliyundrive.com") !== -1 ||
    lower.indexOf("alipan.com") !== -1
  );
}

function extractIframeURL(html) {
  if (!html) {
    return "";
  }

  var match = html.match(/<iframe[^>]+src=['"]([^'"]+)['"]/i);
  if (match && match[1]) {
    return match[1];
  }

  return "";
}

function decryptPlayerPayload(cipherText, key, iv) {
  try {
    var keyValue = CryptoJS.enc.Utf8.parse(key || "PBfAUnTdMjNDe6pL");
    var ivValue = CryptoJS.enc.Utf8.parse(iv || "sENS6bVbwSfvnXrj");
    var decrypted = CryptoJS.AES.decrypt(cipherText, keyValue, {
      iv: ivValue,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return "";
  }
}

function decodeObfuscatedURL(data) {
  if (!data) {
    return "";
  }

  try {
    var encrypted = data.split("").reverse().join("");
    var temp = "";

    for (var i = 0; i < encrypted.length; i += 2) {
      var pair = encrypted[i] + (encrypted[i + 1] || "");
      var code = parseInt(pair, 16);
      if (isNaN(code)) {
        continue;
      }
      temp += String.fromCharCode(code);
    }

    var mid = (temp.length - 7) / 2;
    if (mid > 0) {
      return temp.substring(0, mid) + temp.substring(mid + 7);
    }

    return temp;
  } catch (error) {
    return "";
  }
}

function extractPlayURLFromIframe(html) {
  if (!html) {
    return "";
  }

  var playerMatch = html.match(/var\s+player\s*=\s*["']([^"']+)["']/);
  var randMatch = html.match(/var\s+rand\s*=\s*["']([^"']+)["']/);

  if (playerMatch && randMatch) {
    try {
      var decrypted = decryptPlayerPayload(
        playerMatch[1],
        "VFBTzdujpR9FWBhe",
        randMatch[1]
      );
      var parsed = JSON.parse(decrypted);
      if (parsed && parsed.url) {
        return parsed.url;
      }
    } catch (error) { }
  }

  var dataMatch = html.match(/["']data["']\s*:\s*["']([^"']+)["']/);
  if (dataMatch && dataMatch[1]) {
    var decoded = decodeObfuscatedURL(dataMatch[1]);
    if (decoded) {
      return decoded;
    }
  }

  return "";
}

function extractWpPlayURL(html) {
  if (!html) {
    return "";
  }

  var scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  var match;

  while ((match = scriptRegex.exec(html))) {
    var scriptContent = match[1];
    if (
      scriptContent.indexOf("window.wp_nonce") === -1 ||
      scriptContent.indexOf("eval(") === -1
    ) {
      continue;
    }

    var group = scriptContent.match(/(var[\s\S]*?)eval\((\w+\(\w+\))\)/);
    if (!group || !group[1] || !group[2]) {
      continue;
    }

    try {
      var result = eval(group[1] + group[2]);
      if (!result) {
        continue;
      }

      var urlMatch = result.match(/url:\s*['"]([^'"]+)['"]/);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
    } catch (error) { }
  }

  return "";
}

function sendPlayerURL(url, referer) {
  if (!url) {
    $next.emptyView("找不到可用的播放地址");
    return;
  }

  var payload = {
    url: url,
    headers: {
      "User-Agent": UA,
      Referer: referer || HOST,
    },
  };

  $next.toPlayerByJSON(JSON.stringify(payload));
}

function resolveIframePlayer(iframeURL, referer) {
  var target = normalizeURL(iframeURL);
  if (!target) {
    $next.emptyView("播放解析失敗，無法訪問播放器頁面");
    return;
  }

  var extraHeaders = {};
  var needsStrictReferer =
    target.indexOf("player-v2") !== -1 || target.indexOf("player-v4") !== -1;

  if (needsStrictReferer) {
    extraHeaders["sec-fetch-dest"] = "iframe";
    extraHeaders["sec-fetch-mode"] = "navigate";
  }

  var refererHeader = referer || HOST;
  if (needsStrictReferer) {
    refererHeader = HOST + "/";
  }

  fetchHTML(
    target,
    { referer: refererHeader, headers: extraHeaders },
    function (res) {
      var html = res.body || "";
      var playURL = extractPlayURLFromIframe(html);

      if (playURL) {
        sendPlayerURL(playURL, target);
        return;
      }

      var fallback = extractWpPlayURL(html);
      if (fallback) {
        sendPlayerURL(fallback, target);
        return;
      }

      $next.emptyView("暫無可用的播放來源");
    },
    function () {
      $next.emptyView("播放來源請求失敗，請稍後再試");
    }
  );
}

function Player(inputURL) {
  if (!inputURL) {
    $next.emptyView("無效的播放地址");
    return;
  }

  if (isAliShare(inputURL)) {
    $next.aliLink(inputURL);
    return;
  }

  var detailURL = normalizeURL(inputURL);
  if (!isHTTPURL(detailURL)) {
    $next.emptyView("暫不支援此播放地址");
    return;
  }

  fetchHTML(
    detailURL,
    null,
    function (res) {
      var html = res.body || "";
      var iframeSrc = extractIframeURL(html);

      if (iframeSrc) {
        resolveIframePlayer(iframeSrc, detailURL);
        return;
      }

      var fallback = extractWpPlayURL(html);
      if (fallback) {
        sendPlayerURL(fallback, detailURL);
        return;
      }

      $next.emptyView("找不到可用的播放地址");
    },
    function () {
      $next.emptyView("播放解析失敗，請稍後再試");
    }
  );
}
