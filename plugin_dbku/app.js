`user script`;

const BASE_URL = "https://www.dbku.tv";

function print(params) {
  console.log(JSON.stringify(params));
}

function buildMediaData(id, coverURLString, title, descriptionText, detailURLString) {
  return {
    id: id,
    coverURLString: coverURLString,
    title: title,
    descriptionText: descriptionText,
    detailURLString: detailURLString,
  };
}

function buildEpisodeData(id, title, episodeDetailURL) {
  return {
    id: id,
    title: title,
    episodeDetailURL: episodeDetailURL,
  };
}

function buildURL(href) {
  const raw = String(href || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.indexOf("http") === 0) {
    return raw;
  }
  if (raw.indexOf("//") === 0) {
    return "https:" + raw;
  }
  if (raw[0] === "/") {
    return BASE_URL + raw;
  }
  return BASE_URL + "/" + raw;
}

function findAllByKey(obj, keyToFind) {
  if (typeof obj === "string") {
    return [];
  }

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

function getNodeText(node) {
  if (!node) {
    return "";
  }
  if (typeof node === "string") {
    return node.replace(/\s+/g, " ").trim();
  }
  if (!node.children || !Array.isArray(node.children)) {
    return "";
  }

  let out = "";
  node.children.forEach((child) => {
    const text = getNodeText(child);
    if (text) {
      out += (out ? " " : "") + text;
    }
  });

  return out.replace(/\s+/g, " ").trim();
}

function getClassText(node, classKeyword) {
  if (!node || typeof node !== "object") {
    return "";
  }

  const cls = String(node.attributes && node.attributes.class || "");
  if (cls.indexOf(classKeyword) >= 0) {
    const text = getNodeText(node);
    if (text) {
      return text;
    }
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  for (let i = 0; i < node.children.length; i++) {
    const value = getClassText(node.children[i], classKeyword);
    if (value) {
      return value;
    }
  }

  return "";
}

function collectAnchors(node, out) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (node.tagName === "a") {
    out.push(node);
  }

  if (!Array.isArray(node.children)) {
    return;
  }

  node.children.forEach((child) => collectAnchors(child, out));
}

function parseCardNode(card, seen, datas) {
  const links = [];
  collectAnchors(card, links);

  let target = null;
  for (let i = 0; i < links.length; i++) {
    const href = String(links[i].attributes && links[i].attributes.href || "");
    if (href.indexOf("/voddetail/") >= 0) {
      target = links[i];
      break;
    }
  }

  if (!target) {
    return;
  }

  const hrefRaw = String(target.attributes && target.attributes.href || "").trim();
  const detailURL = buildURL(hrefRaw);
  if (!detailURL || seen[detailURL]) {
    return;
  }

  const title = String(target.attributes && target.attributes.title || getNodeText(target) || "").trim();
  if (!title) {
    return;
  }

  const coverURLString = buildURL(
    String(target.attributes && (target.attributes["data-original"] || target.attributes.src) || "").trim()
  );

  let descriptionText = getClassText(card, "pic-text");
  if (!descriptionText) {
    const texts = findAllByKey(card, "children");
    for (let i = 0; i < texts.length; i++) {
      const text = String(texts[i] || "").replace(/\s+/g, " ").trim();
      if (text && text.length > 1 && text !== title) {
        descriptionText = text;
        break;
      }
    }
  }

  seen[detailURL] = true;
  datas.push(buildMediaData(detailURL, coverURLString, title, descriptionText, detailURL));
}

function parseListCards(html) {
  const cards = tXml.getElementsByClassName(html, "myui-vodlist__box");
  const datas = [];
  const seen = {};

  cards.forEach((card) => parseCardNode(card, seen, datas));
  return datas;
}

function parseSearchCards(html) {
  const datas = [];
  const seen = {};

  const searchList = tXml.getElementById(html, "searchList");
  if (searchList && Array.isArray(searchList.children)) {
    searchList.children.forEach((child) => parseCardNode(child, seen, datas));
  }

  if (datas.length > 0) {
    return datas;
  }

  return parseListCards(html);
}

function decodePlayURLByEncrypt(value, encrypt) {
  const raw = String(value || "");
  const mode = Number(encrypt || 0);

  if (!raw) {
    return "";
  }

  try {
    if (mode === 1) {
      return unescape(raw);
    }

    if (mode === 2) {
      const decoded = atob(raw);
      try {
        return decodeURIComponent(decoded);
      } catch (_) {
        return unescape(decoded);
      }
    }

    if (mode === 3) {
      let text = raw;
      if (text.length > 16) {
        text = text.substring(8);
      }
      text = atob(text);
      if (text.length > 16) {
        text = text.substring(8, text.length - 8);
      }
      return text;
    }

    return raw;
  } catch (error) {
    return raw;
  }
}

function parsePlayerData(html) {
  let matched = html.match(/var\s+player_data\s*=\s*(\{[\s\S]*?\})\s*<\/script>/i);
  if (!matched || !matched[1]) {
    matched = html.match(/var\s+player_[^=]*=\s*(\{[\s\S]*?\})\s*<\/script>/i);
  }

  if (!matched || !matched[1]) {
    return null;
  }

  try {
    return JSON.parse(matched[1]);
  } catch (error) {
    return null;
  }
}

function buildMedias(inputURL, key) {
  const req = {
    url: inputURL,
    method: "GET",
    headers: {
      Referer: BASE_URL,
      Origin: BASE_URL,
    },
  };

  $http.fetch(req).then((res) => {
    const datas = parseListCards(res.body);
    $next.toMedias(JSON.stringify(datas), key);
  }).catch((error) => {
    print({ stage: "buildMedias", error: String(error || "") });
    $next.toMedias(JSON.stringify([]), key);
  });
}

function Search(inputURL, key) {
  const req = {
    url: inputURL,
    method: "GET",
    headers: {
      Referer: BASE_URL,
      Origin: BASE_URL,
    },
  };

  $http.fetch(req).then((res) => {
    const datas = parseSearchCards(res.body);
    $next.toSearchMedias(JSON.stringify(datas), key);
  }).catch((error) => {
    print({ stage: "search", error: String(error || "") });
    $next.toSearchMedias(JSON.stringify([]), key);
  });
}

function Episodes(inputURL) {
  const req = {
    url: inputURL,
    method: "GET",
    headers: {
      Referer: BASE_URL,
      Origin: BASE_URL,
    },
  };

  $http.fetch(req).then((res) => {
    const datas = [];
    const seen = {};
    const html = String(res.body || "");
    const re = /<a[^>]+href=["']([^"']*\/vodplay\/\d+-\d+-\d+\.html[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let matched = null;

    while ((matched = re.exec(html)) !== null) {
      const href = buildURL(matched[1]);
      if (!href || seen[href]) {
        continue;
      }

      const title = String(matched[2] || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!title || title.indexOf("立即播放") >= 0) {
        continue;
      }

      seen[href] = true;
      datas.push(buildEpisodeData(href, title, href));
    }

    $next.toEpisodes(JSON.stringify(datas));
  }).catch((error) => {
    print({ stage: "episodes", error: String(error || "") });
    $next.toEpisodes(JSON.stringify([]));
  });
}

function Player(inputURL) {
  const req = {
    url: inputURL,
    method: "GET",
    headers: {
      Referer: BASE_URL,
      Origin: BASE_URL,
    },
  };

  $http.fetch(req).then((res) => {
    const playerData = parsePlayerData(res.body);
    if (!playerData) {
      $next.emptyView("未找到播放器数据");
      return;
    }

    const decoded = decodePlayURLByEncrypt(playerData.url, playerData.encrypt);
    const playURL = buildURL(decoded);

    if (!playURL) {
      $next.emptyView("播放链接为空");
      return;
    }

    $next.toPlayer(playURL);
  }).catch((error) => {
    print({ stage: "player", error: String(error || "") });
    $next.emptyView("播放器请求失败");
  });
}
