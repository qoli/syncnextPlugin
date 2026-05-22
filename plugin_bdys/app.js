`user script`;

var BDYS_HOST = "https://www.xlys02.com";
var BDYS_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

function buildURL(href) {
  href = String(href || "").trim();
  if (!href) {
    return "";
  }
  if (href.indexOf("//") === 0) {
    href = "https:" + href;
  } else if (href.indexOf("http") !== 0) {
    href = BDYS_HOST + (href.charAt(0) === "/" ? href : "/" + href);
  }
  return href.replace(/^https?:\/\/(www\.)?(xl01\.com\.de|xlys02\.com)/, BDYS_HOST);
}

function buildRequest(url, referer) {
  return {
    url: buildURL(url),
    method: "GET",
    headers: Object.assign({}, BDYS_HEADERS, {
      Referer: referer || BDYS_HOST + "/",
    }),
  };
}

function textOf(node) {
  return String(tXml.toContentString(node || "") || "").trim();
}

function firstByClass(node, className) {
  if (!node || typeof node !== "object") {
    return null;
  }
  const classAttr = (node.attributes && node.attributes.class) || "";
  if ((" " + classAttr + " ").indexOf(" " + className + " ") >= 0) {
    return node;
  }
  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const found = firstByClass(children[i], className);
    if (found) {
      return found;
    }
  }
  return null;
}

function firstByTag(node, tagName) {
  if (!node || typeof node !== "object") {
    return null;
  }
  if (node.tagName === tagName) {
    return node;
  }
  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const found = firstByTag(children[i], tagName);
    if (found) {
      return found;
    }
  }
  return null;
}

function firstCoverURL(dom) {
  const dataSrcList = findAllByKey(dom, "data-src") || [];
  if (dataSrcList.length > 0) {
    return buildURL(dataSrcList[0]);
  }
  const srcList = findAllByKey(dom, "src") || [];
  for (let i = 0; i < srcList.length; i++) {
    if (String(srcList[i] || "").indexOf("data:image") !== 0) {
      return buildURL(srcList[i]);
    }
  }
  return "";
}

function mediaFromNewCard(dom) {
  const cardImg = firstByClass(dom, "card-img");
  const href = buildURL(
    (cardImg && cardImg.attributes && cardImg.attributes.href) ||
      (findAllByKey(dom, "href") || []).filter((item) => /\.htm/i.test(item))[0]
  );
  if (!href || href.indexOf("/play/") >= 0) {
    return null;
  }

  const h4 = firstByTag(dom, "h4");
  const title = String(
    (h4 && textOf(h4)) ||
      (cardImg && cardImg.attributes && cardImg.attributes.title) ||
      ""
  ).trim();
  if (!title) {
    return null;
  }

  const descriptionText =
    textOf(firstByClass(dom, "card-meta")) || textOf(firstByClass(dom, "episode-badge"));
  return buildMediaData(href, firstCoverURL(dom), title, descriptionText, href);
}

function mediaFromOldCard(dom) {
  const href = buildURL((findAllByKey(dom, "href") || [])[0]);
  if (!href) {
    return null;
  }
  const len = dom.children ? dom.children.length : 0;
  const body = len > 0 ? dom.children[len - 1] : null;
  const title = String(
    (body && body.children && body.children[0] && textOf(body.children[0])) || ""
  ).trim();
  const descriptionText = String(
    (body && body.children && body.children[1] && textOf(body.children[1])) || ""
  ).trim();
  if (!title) {
    return null;
  }
  return buildMediaData(href, firstCoverURL(dom), title, descriptionText, href);
}

function parseBDYSMediasFromHTML(html, keyword) {
  const keywordLower = String(keyword || "").trim().toLowerCase();
  const datas = [];
  const seen = {};

  const addItem = function (item) {
    if (!item || !item.id || seen[item.id]) {
      return;
    }
    if (keywordLower && item.title.toLowerCase().indexOf(keywordLower) === -1) {
      return;
    }
    seen[item.id] = true;
    datas.push(item);
  };

  tXml.getElementsByClassName(html, "movie-card").forEach((dom) => {
    addItem(mediaFromNewCard(dom));
  });
  tXml.getElementsByClassName(html, "card card-sm card-link").forEach((dom) => {
    addItem(mediaFromOldCard(dom));
  });

  return datas;
}

function buildMedias(inputURL) {
  $http.fetch(buildRequest(inputURL)).then((res) => {
    $next.toMedias(JSON.stringify(parseBDYSMediasFromHTML(res.body, "")));
  });
}

function Episodes(inputURL) {
  const datas = [];
  const seen = {};

  const addEpisode = function (href, title) {
    href = buildURL(href);
    title = String(title || "").trim();
    if (!href || seen[href] || href.indexOf("/play/") < 0) {
      return;
    }
    seen[href] = true;
    datas.push(buildEpisodeData(href, title, href));
  };

  $http.fetch(buildRequest(inputURL)).then((res) => {
    tXml.getElementsByClassName(res.body, "play-item").forEach((element) => {
      addEpisode(element.attributes && element.attributes.href, textOf(element));
    });
    tXml.getElementsByClassName(res.body, "btn btn-square me-2").forEach((element) => {
      addEpisode(element.attributes && element.attributes.href, textOf(element));
    });
    $next.toEpisodes(JSON.stringify(datas));
  });
}

function extractKeywordFromSearchInput(inputURL) {
  const raw = String(inputURL || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.indexOf("http") === 0) {
    const matched = raw.match(/\/search\/([^/?#]+)/i);
    if (matched && matched[1]) {
      try {
        return decodeURIComponent(matched[1]).trim();
      } catch (error) {
        return matched[1].trim();
      }
    }
  }
  try {
    return decodeURIComponent(raw).trim();
  } catch (error) {
    return raw.trim();
  }
}

function toSearchResult(datas, key) {
  $next.toSearchMedias(JSON.stringify(datas || []), key);
}

function Search(inputURL, key) {
  const keyword = extractKeywordFromSearchInput(inputURL);
  if (!keyword) {
    toSearchResult([], key);
    return;
  }

  const searchURL =
    inputURL && String(inputURL).indexOf("http") === 0
      ? inputURL
      : BDYS_HOST + "/search/" + encodeURIComponent(keyword);

  const fallbackPages = [1, 2, 3, 4];
  const fallbackDatas = [];
  const fallbackSeen = {};

  const runFallback = function (index) {
    if (index >= fallbackPages.length || fallbackDatas.length >= 30) {
      toSearchResult(fallbackDatas, key);
      return;
    }
    const pageURL = BDYS_HOST + "/s/all/" + fallbackPages[index];
    $http.fetch(buildRequest(pageURL)).then((res) => {
      parseBDYSMediasFromHTML(res.body, keyword).forEach((item) => {
        if (!fallbackSeen[item.id]) {
          fallbackSeen[item.id] = true;
          fallbackDatas.push(item);
        }
      });
      runFallback(index + 1);
    }).catch(() => {
      runFallback(index + 1);
    });
  };

  $http.fetch(buildRequest(searchURL)).then((res) => {
    const directResults = parseBDYSMediasFromHTML(res.body, "");
    if (directResults.length > 0) {
      toSearchResult(directResults, key);
      return;
    }
    runFallback(0);
  }).catch(() => {
    runFallback(0);
  });
}
