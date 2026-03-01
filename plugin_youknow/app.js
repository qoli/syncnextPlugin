'user script';

const BASE_URL = 'https://www.youknow.tv';

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
  if (!href) {
    return '';
  }
  if (href.startsWith('//')) {
    return 'https:' + href;
  }
  if (!href.startsWith('http')) {
    href = BASE_URL + href;
  }
  return href;
}

function sanitizeText(value) {
  if (!value) {
    return '';
  }
  return String(value).replace(/\s+/g, ' ').trim();
}

function safeDecodeURIComponent(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

function normalizePlayURL(url) {
  if (!url) {
    return '';
  }

  let value = String(url).trim();
  value = value.replace(/^['"]|['"]$/g, '');
  value = value.replace(/\\u0026/g, '&');
  value = value.replace(/\\\//g, '/');
  value = safeDecodeURIComponent(value);

  if (value.startsWith('//')) {
    value = 'https:' + value;
  } else if (value.startsWith('/')) {
    value = BASE_URL + value;
  }

  return value;
}

function findAllByKey(obj, keyToFind) {
  return (
    Object.entries(obj).reduce(
      function (acc, entry) {
        const key = entry[0];
        const value = entry[1];
        if (key === keyToFind) {
          return acc.concat(value);
        }
        if (typeof value === 'object' && value) {
          return acc.concat(findAllByKey(value, keyToFind));
        }
        return acc;
      },
      []
    ) || []
  );
}

function fetchAndParse(url) {
  const req = {
    url: url,
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      Referer: BASE_URL + '/',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  };
  return $http.fetch(req).then(
    function (res) {
      return res.body;
    },
    function (err) {
      print({ url: url, error: err });
      return '';
    }
  );
}

function isChallengePage(html) {
  if (!html) {
    return false;
  }
  const text = String(html).toLowerCase();
  return (
    text.includes('attention required') ||
    text.includes('sorry, you have been blocked') ||
    text.includes('cf-error-details') ||
    text.includes('cf-wrapper')
  );
}

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match && match[1] ? sanitizeText(match[1]) : '';
}

function extractMediasFromHTML(html) {
  const datas = [];
  const seen = {};
  const itemRegex =
    /<a\b[^>]*class=["'][^"']*module-(?:poster-item|card-item-poster)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi;

  let match = null;
  while ((match = itemRegex.exec(html))) {
    const block = match[0] || '';
    const openTag = block.split('>')[0] || '';
    const href = firstMatch(openTag, /href=["']([^"']+)["']/i);
    const detailURLString = buildURL(href);

    if (!detailURLString || seen[detailURLString]) {
      continue;
    }

    const coverURLString =
      firstMatch(block, /data-original=["']([^"']+)["']/i) ||
      firstMatch(block, /data-src=["']([^"']+)["']/i) ||
      firstMatch(block, /src=["']([^"']+)["']/i);

    const title =
      firstMatch(block, /title=["']([^"']+)["']/i) ||
      firstMatch(block, /alt=["']([^"']+)["']/i) ||
      firstMatch(block, /module-poster-item-title[^>]*>([^<]+)</i) ||
      firstMatch(block, /<strong[^>]*>([^<]+)</i);

    const descriptionText =
      firstMatch(block, /module-item-note[^>]*>([^<]+)</i) ||
      firstMatch(block, /module-item-text[^>]*>([^<]+)</i);

    seen[detailURLString] = true;
    datas.push(
      buildMediaData(detailURLString, buildURL(coverURLString), title, descriptionText, detailURLString)
    );
  }

  return datas;
}

function buildMedias(listURL, key) {
  fetchAndParse(listURL).then(function (html) {
    if (isChallengePage(html)) {
      $next.emptyView('封面列表載入失敗：目標站點觸發 Cloudflare 防護頁，請稍後重試或更換網絡。');
      $next.toMedias(JSON.stringify([]), key);
      return;
    }

    let datas = extractMediasFromHTML(html);

    // Fallback to existing tXml parsing for unexpected page structures.
    if (datas.length === 0) {
      const cards = tXml.getElementsByClassName(html, 'module-poster-item');
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const href = card.attributes && card.attributes.href ? card.attributes.href : '';
        const detailURLString = buildURL(href);
        if (!detailURLString) {
          continue;
        }

        const img = findAllByKey(card, 'data-original')[0] || '';
        const coverURLString = img || '';
        const title = findAllByKey(card, 'title')[0] || findAllByKey(card, 'alt')[0] || '';
        const descriptionText = '';

        datas.push(
          buildMediaData(detailURLString, coverURLString, title, descriptionText, detailURLString)
        );
      }
    }

    if (datas.length === 0) {
      $next.emptyView('封面列表為空：站點頁面結構可能變更，或目前返回了非預期內容。');
    }

    $next.toMedias(JSON.stringify(datas), key);
  });
}

function buildSearchMedias(searchURL, key) {
  buildMedias(searchURL, key);
}

function collectAnchorNodes(node, result) {
  if (!node || typeof node === 'string') {
    return;
  }

  if (node.tagName === 'a') {
    result.push(node);
  }

  if (!node.children) {
    return;
  }

  for (let i = 0; i < node.children.length; i++) {
    collectAnchorNodes(node.children[i], result);
  }
}

function pushEpisodeFromNode(node, datas, seen) {
  if (!node || !node.attributes) {
    return;
  }

  const href = node.attributes.href || '';
  if (!href) {
    return;
  }

  const lowerHref = href.toLowerCase();
  if (
    lowerHref.startsWith('javascript:') ||
    lowerHref === '#' ||
    lowerHref.startsWith('mailto:')
  ) {
    return;
  }

  const episodeURL = buildURL(href);
  if (!episodeURL || seen[episodeURL]) {
    return;
  }

  const titleAttr = node.attributes.title || '';
  const titleText = sanitizeText(
    titleAttr || (node.children ? tXml.toContentString(node.children) : '')
  );
  const title = titleText || 'Episode ' + (datas.length + 1);

  seen[episodeURL] = true;
  datas.push(buildEpisodeData(episodeURL, title, episodeURL));
}

function pushEpisodeByRegex(html, datas, seen) {
  const regex = /<a[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match = null;

  while ((match = regex.exec(html))) {
    const href = match[1] || '';
    const text = sanitizeText((match[2] || '').replace(/<[^>]+>/g, ' '));
    const lowerHref = href.toLowerCase();

    const maybeEpisode =
      lowerHref.includes('/play/') ||
      lowerHref.includes('/vodplay/') ||
      /-\d+-\d+\.html?$/.test(lowerHref) ||
      /\d+-\d+-\d+\.html?$/.test(lowerHref);

    if (!maybeEpisode) {
      continue;
    }

    const episodeURL = buildURL(href);
    if (!episodeURL || seen[episodeURL]) {
      continue;
    }

    seen[episodeURL] = true;
    datas.push(buildEpisodeData(episodeURL, text || 'Episode ' + (datas.length + 1), episodeURL));
  }
}

function Episodes(detailURL) {
  fetchAndParse(detailURL).then(function (html) {
    const datas = [];
    const seen = {};
    const containers = [];

    const idCandidates = [];
    for (let i = 0; i < 20; i++) {
      idCandidates.push('item-url-' + i);
    }
    idCandidates.push('playlist');
    idCandidates.push('playList');
    idCandidates.push('play-list');
    idCandidates.push('module-play-list');

    for (let i = 0; i < idCandidates.length; i++) {
      const node = tXml.getElementById(html, idCandidates[i]);
      if (node && node.children) {
        containers.push(node);
      }
    }

    const classCandidates = [
      'module-play-list',
      'module-play-list-content',
      'module-play-list-link',
      'playlist-notfull',
      'playlist-full',
      'stui-content__playlist',
    ];

    for (let i = 0; i < classCandidates.length; i++) {
      const nodes = tXml.getElementsByClassName(html, classCandidates[i]);
      if (nodes && nodes.length) {
        for (let j = 0; j < nodes.length; j++) {
          containers.push(nodes[j]);
        }
      }
    }

    for (let i = 0; i < containers.length; i++) {
      const anchors = [];
      collectAnchorNodes(containers[i], anchors);
      for (let j = 0; j < anchors.length; j++) {
        pushEpisodeFromNode(anchors[j], datas, seen);
      }
    }

    if (datas.length === 0) {
      pushEpisodeByRegex(html, datas, seen);
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function decodeEncrypt2(enc) {
  let s1 = safeDecodeURIComponent(enc);
  let s2 = safeDecodeURIComponent(s1);

  function tryBase64(str) {
    try {
      return atob(str);
    } catch (e) {
      return null;
    }
  }

  let decoded = tryBase64(s2);
  if (!decoded) {
    const s3 = safeDecodeURIComponent(s2);
    decoded = tryBase64(s3);
  }

  if (!decoded) {
    return null;
  }
  return safeDecodeURIComponent(decoded);
}

function decodePlayerURL(rawURL, encrypt) {
  let url = rawURL || '';
  const mode = String(encrypt || '0');

  if (mode === '1') {
    url = safeDecodeURIComponent(url);
  } else if (mode === '2') {
    url = decodeEncrypt2(url) || '';
  }

  return normalizePlayURL(url);
}

function isDirectPlayableURL(url) {
  if (!url) {
    return false;
  }
  const value = String(url).toLowerCase();
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('//') ||
    value.includes('.m3u8') ||
    value.includes('.mp4') ||
    value.includes('.flv')
  );
}

function extractDirectMediaURL(text) {
  if (!text) {
    return '';
  }

  const normalized = String(text).replace(/\\\//g, '/');
  const directMatch = normalized.match(/https?:\/\/[^"'\\\s]+?\.(m3u8|mp4|flv)(\?[^"'\\\s]*)?/i);
  if (directMatch && directMatch[0]) {
    return normalizePlayURL(directMatch[0]);
  }

  const protocolLessMatch = normalized.match(/\/\/[^"'\\\s]+?\.(m3u8|mp4|flv)(\?[^"'\\\s]*)?/i);
  if (protocolLessMatch && protocolLessMatch[0]) {
    return normalizePlayURL('https:' + protocolLessMatch[0]);
  }

  return '';
}

function getQueryParam(url, name) {
  if (!url) {
    return '';
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = url.match(new RegExp('[?&]' + escaped + '=([^&#]+)'));
  return match ? safeDecodeURIComponent(match[1]) : '';
}

function extractPlayerConfig(html) {
  const patterns = [
    /player_aaaa\s*=\s*(\{[\s\S]*?\})\s*<\/script>/i,
    /player_aaaa\s*=\s*(\{[\s\S]*?\});/i,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = html.match(patterns[i]);
    if (!match || !match[1]) {
      continue;
    }

    const raw = match[1].trim().replace(/,\s*}/g, '}');
    try {
      return JSON.parse(raw);
    } catch (e) {
      try {
        return Function('return (' + raw + ')')();
      } catch (err) {
        continue;
      }
    }
  }

  return null;
}

function Player(episodeURL) {
  fetchAndParse(episodeURL).then(function (html) {
    const config = extractPlayerConfig(html);
    let playURL = '';

    if (config && config.url) {
      const decoded = decodePlayerURL(config.url, config.encrypt);
      if (isDirectPlayableURL(decoded)) {
        playURL = decoded;
      }
    }

    if (!playURL) {
      playURL = extractDirectMediaURL(html);
    }

    let iframeSrc = '';
    const iframeNode = tXml.getElementsByClassName(html, 'embed-responsive-item')[0];
    if (iframeNode && iframeNode.attributes && iframeNode.attributes.src) {
      iframeSrc = buildURL(iframeNode.attributes.src);
      const urlParam = getQueryParam(iframeSrc, 'url');
      if (urlParam && !playURL && isDirectPlayableURL(urlParam)) {
        playURL = decodePlayerURL(urlParam, 0);
      }
    }

    if (playURL) {
      $next.toPlayer(playURL);
      return;
    }

    if (!iframeSrc) {
      print({ playerParseError: 'play url not found', episodeURL: episodeURL });
      $next.toPlayer('');
      return;
    }

    fetchAndParse(iframeSrc).then(function (iframeHTML) {
      let iframePlayURL = extractDirectMediaURL(iframeHTML);
      if (!iframePlayURL) {
        const iframeConfig = extractPlayerConfig(iframeHTML);
        if (iframeConfig && iframeConfig.url) {
          iframePlayURL = decodePlayerURL(iframeConfig.url, iframeConfig.encrypt);
        }
      }

      if (!iframePlayURL) {
        const urlParam = getQueryParam(iframeSrc, 'url');
        if (isDirectPlayableURL(urlParam)) {
          iframePlayURL = decodePlayerURL(urlParam, 0);
        }
      }

      if (!iframePlayURL) {
        print({ playerParseError: 'iframe play url not found', iframeSrc: iframeSrc });
      }
      $next.toPlayer(iframePlayURL || '');
    });
  });
}
