`user script`;

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = "https://xl01.com.de" + href;
  }
  return href;
}

// Main
function buildMedias(inputURL) {
  const req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then((res) => {
    const content = tXml.getElementsByClassName(
      res.body,
      "card card-sm card-link"
    );
    content.forEach((dom) => {
      _len = dom.children.length;

      let href = findAllByKey(dom, "href")[0];

      const title = dom.children[_len - 1].children[0].children[0];

      const coverURLString = findAllByKey(dom, "src")[0];

      let descriptionText = dom.children[_len - 1].children[1].children[0];
      /* 不知道為什麽本地 node 環境可以正常輸出，但是在插件里會報錯，後續找到原因再調試。
            const _array = dom.children[_len-2].children[1] || dom.children[_len-1].children[1];
            const descriptionText = _array.children[0];
            */
      // print(descriptionText);
      href = buildURL(href);

      datas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    });

    $next.toMedias(JSON.stringify(datas));
  });
}

function Episodes(inputURL) {
  // consoleLog(inputURL);

  const req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then((res) => {
    const content = tXml.getElementsByClassName(
      res.body,
      "btn btn-square me-2"
    );

    content.forEach((element) => {
      let href = element.attributes.href;
      const title = element.children[0];

      href = buildURL(href);

      datas.push(buildEpisodeData(href, title, href));
    });

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function parseBDYSMediasFromHTML(html, keyword) {
  const keywordLower = String(keyword || "").trim().toLowerCase();
  const content = tXml.getElementsByClassName(html, "card card-sm card-link");
  const datas = [];
  const seen = {};

  content.forEach((dom) => {
    const hrefRaw = findAllByKey(dom, "href")[0] || "";
    const coverURLRaw = findAllByKey(dom, "src")[0] || "";
    const textNodes = findAllByKey(dom, "children") || [];

    let title = "";
    let descriptionText = "";

    if (dom && dom.children && dom.children.length > 0) {
      const len = dom.children.length;
      const cardBody = dom.children[len - 1];
      if (cardBody && cardBody.children && cardBody.children[0]) {
        const h3 = cardBody.children[0];
        title = String(
          (h3.children && h3.children[0]) || h3.text || h3 || ""
        ).trim();
      }
      if (cardBody && cardBody.children && cardBody.children[1]) {
        const p = cardBody.children[1];
        descriptionText = String(
          (p.children && p.children[0]) || p.text || p || ""
        ).trim();
      }
    }

    if (!title && textNodes.length > 0) {
      for (let i = 0; i < textNodes.length; i++) {
        const value = String(textNodes[i] || "").trim();
        if (value && value.length > 1) {
          title = value;
          break;
        }
      }
    }

    if (!hrefRaw || !title) {
      return;
    }

    if (keywordLower && title.toLowerCase().indexOf(keywordLower) === -1) {
      return;
    }

    const href = buildURL(hrefRaw);
    if (seen[href]) {
      return;
    }
    seen[href] = true;

    const coverURLString = coverURLRaw ? buildURL(coverURLRaw) : "";
    datas.push(buildMediaData(href, coverURLString, title, descriptionText, href));
  });

  return datas;
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
      : "https://xl01.com.de/search/" + encodeURIComponent(keyword);

  const searchReq = {
    url: searchURL,
    method: "GET",
  };

  const isChallengePage = function (html) {
    const text = String(html || "");
    return (
      text.indexOf("verifyCode") >= 0 ||
      text.indexOf("验证码") >= 0 ||
      text.indexOf("首次搜索需要输入验证码") >= 0
    );
  };

  const fallbackPages = [1, 2, 3, 4];
  const fallbackDatas = [];
  const fallbackSeen = {};

  const runFallback = function (index) {
    if (index >= fallbackPages.length || fallbackDatas.length >= 30) {
      toSearchResult(fallbackDatas, key);
      return;
    }

    const page = fallbackPages[index];
    const req = {
      url: "https://xl01.com.de/s/all/" + page,
      method: "GET",
    };

    $http.fetch(req).then((res) => {
      const parsed = parseBDYSMediasFromHTML(res.body, keyword);
      parsed.forEach((item) => {
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

  $http.fetch(searchReq).then((res) => {
    const directResults = parseBDYSMediasFromHTML(res.body, "");
    if (directResults.length > 0 && !isChallengePage(res.body)) {
      toSearchResult(directResults, key);
      return;
    }
    runFallback(0);
  }).catch(() => {
    runFallback(0);
  });
}
