'user script';

const BASE_URL = 'https://www.thanju.com';

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
  const raw = String(href || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  if (raw.startsWith('//')) return 'https:' + raw;
  if (raw.startsWith('/')) return BASE_URL + raw;
  return BASE_URL + '/' + raw;
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

function normalizeText(input) {
  return String(input || '').replace(/\s+/g, ' ').trim();
}

function stripTags(input) {
  return normalizeText(String(input || '').replace(/<[^>]+>/g, ''));
}

function decodeHtmlEntities(input) {
  return String(input || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function decodeEscapedURL(url) {
  return String(url || '').replace(/\\\//g, '/').trim();
}

function uniqStrings(list) {
  const seen = {};
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const key = String(list[i] || '').trim();
    if (!key || seen[key]) continue;
    seen[key] = true;
    out.push(key);
  }
  return out;
}

function nodeHasClass(node, classToken) {
  if (!node || !node.attributes || !node.attributes.class) return false;
  const classes = String(node.attributes.class).split(/\s+/);
  return classes.indexOf(classToken) >= 0;
}

function findFirstNodeByClass(node, classToken) {
  if (!node || typeof node !== 'object') return null;
  if (nodeHasClass(node, classToken)) return node;
  if (!node.children || !node.children.length) return null;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (typeof child !== 'object') continue;
    const found = findFirstNodeByClass(child, classToken);
    if (found) return found;
  }
  return null;
}

function nodeText(node) {
  if (!node) return '';
  if (typeof node === 'string') return normalizeText(decodeHtmlEntities(node));
  if (!node.children || !node.children.length) return '';

  let text = '';
  for (let i = 0; i < node.children.length; i++) {
    const t = nodeText(node.children[i]);
    if (!t) continue;
    text += (text ? ' ' : '') + t;
  }
  return normalizeText(decodeHtmlEntities(text));
}

function fetchAndParse(url) {
  const req = {
    url: url,
    method: 'GET',
    headers: {
      Referer: BASE_URL + '/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    },
  };
  return $http.fetch(req).then(
    function (res) {
      return res.body || '';
    },
    function (err) {
      print({ url: url, error: err });
      return '';
    }
  );
}

function parseCardList(html, preferClassName) {
  let cards = tXml.getElementsByClassName(html, preferClassName);
  if (!cards || cards.length === 0) {
    cards = tXml.getElementsByClassName(html, 'myui-vodlist__media');
  }
  if (!cards || cards.length === 0) {
    cards = tXml.getElementsByClassName(html, 'myui-vodlist__box');
  }
  return cards || [];
}

function extractMediaFromCard(card) {
  const hrefCandidates = findAllByKey(card, 'href');
  let href = '';
  for (let i = 0; i < hrefCandidates.length; i++) {
    const text = String(hrefCandidates[i] || '');
    if (text.indexOf('/detail/') >= 0) {
      href = text;
      break;
    }
  }
  if (!href && hrefCandidates.length > 0) {
    href = hrefCandidates[0];
  }

  let title = normalizeText(findAllByKey(card, 'title')[0] || '');
  if (!title) {
    const text = findAllByKey(card, 'alt')[0] || '';
    title = normalizeText(text);
  }

  let cover = findAllByKey(card, 'data-original')[0] || '';
  if (!cover) {
    const style = findAllByKey(card, 'style')[0] || '';
    const styleHit = String(style).match(/url\(([^)]+)\)/i);
    if (styleHit && styleHit[1]) {
      cover = String(styleHit[1]).replace(/^["']|["']$/g, '').trim();
    }
  }
  if (!cover) {
    cover = findAllByKey(card, 'data-src')[0] || '';
  }
  if (!cover) {
    cover = findAllByKey(card, 'src')[0] || '';
  }

  const episodeNode = findFirstNodeByClass(card, 'pic-text');
  const actorNode = findFirstNodeByClass(card, 'text-muted');
  const episodeText = nodeText(episodeNode);
  const actorText = nodeText(actorNode);

  let desc = [episodeText, actorText].filter(Boolean).join(' · ');
  if (!desc) {
    desc = title;
  }

  return {
    title: title,
    href: buildURL(href),
    cover: buildURL(cover),
    desc: desc,
  };
}

function buildMedias(listURL, key) {
  fetchAndParse(listURL).then(function (html) {
    const datas = [];
    const cards = parseCardList(html, 'myui-vodlist__box');

    for (let index = 0; index < cards.length; index++) {
      const media = extractMediaFromCard(cards[index]);
      if (!media.href || !media.title) continue;
      datas.push(buildMediaData(media.href, media.cover, media.title, media.desc, media.href));
    }

    $next.toMedias(JSON.stringify(datas), key);
  });
}

function buildSearchMedias(searchURL, key) {
  fetchAndParse(searchURL).then(function (html) {
    const datas = [];
    let cards = parseCardList(html, 'myui-vodlist__media');
    if (!cards || cards.length === 0) {
      cards = parseCardList(html, 'myui-vodlist__box');
    }

    // Search pages may return wrapper UL nodes; extract each card node from wrappers.
    const normalizedCards = [];
    for (let i = 0; i < cards.length; i++) {
      const item = cards[i];
      if (item && item.tagName === 'div' && item.attributes && item.attributes.class === 'myui-vodlist__box') {
        normalizedCards.push(item);
        continue;
      }
      const inner = findAllByKey(item, 'class');
      if (inner && inner.indexOf('myui-vodlist__box') >= 0) {
        const boxes = tXml.getElementsByClassName(item, 'myui-vodlist__box') || [];
        for (let j = 0; j < boxes.length; j++) normalizedCards.push(boxes[j]);
      }
    }
    const finalCards = normalizedCards.length > 0 ? normalizedCards : cards;

    for (let index = 0; index < finalCards.length; index++) {
      const media = extractMediaFromCard(finalCards[index]);
      if (!media.href || !media.title) continue;
      datas.push(buildMediaData(media.href, media.cover, media.title, media.desc, media.href));
    }

    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}

function extractEpisodesFromPlaylistHTML(playlistHTML) {
  const episodes = [];
  const anchorRegex = /<a[^>]*href=['"]([^'"]*\/play\/[^'"]+\.html)['"][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  let fallbackIndex = 1;
  while ((match = anchorRegex.exec(playlistHTML)) !== null) {
    const fullAnchor = match[0];
    const href = buildURL(match[1]);
    const titleAttr = (fullAnchor.match(/title=['"]([^'"]*)['"]/i) || [])[1] || '';
    const titleFromBody = stripTags(match[2]);
    const title = normalizeText(titleAttr || titleFromBody || ('第' + fallbackIndex + '集'));
    episodes.push(buildEpisodeData(href, title, href));
    fallbackIndex += 1;
  }
  return episodes;
}

function parseEpisodeCandidates(html) {
  const tabMap = {};
  const tabRegex = /href=['"]#playlist(\d+)['"][^>]*>([^<]*)<\/a>/gi;
  let tabMatch;
  while ((tabMatch = tabRegex.exec(html)) !== null) {
    tabMap[tabMatch[1]] = stripTags(tabMatch[2]) || ('线路' + tabMatch[1]);
  }

  const candidates = [];
  const playlistRegex = /<div id=['"]playlist(\d+)['"][\s\S]*?<ul class=['"][^'"]*sort-list[^'"]*['"][\s\S]*?>([\s\S]*?)<\/ul>/gi;
  let playMatch;
  while ((playMatch = playlistRegex.exec(html)) !== null) {
    const playlistId = playMatch[1];
    const listHTML = playMatch[2];
    const episodes = extractEpisodesFromPlaylistHTML(listHTML);
    if (episodes.length === 0) continue;

    candidates.push({
      source: tabMap[playlistId] || ('线路' + playlistId),
      episodes: episodes,
    });
  }

  return candidates;
}

function Episodes(detailURL) {
  fetchAndParse(detailURL).then(function (html) {
    const candidates = parseEpisodeCandidates(html);
    if (candidates.length > 0) {
      if (typeof $next.toEpisodesCandidates === 'function') {
        // Syncnext app expects a plain array for toEpisodesCandidates.
        $next.toEpisodesCandidates(JSON.stringify(candidates));
      } else {
        $next.toEpisodes(JSON.stringify(candidates[0].episodes));
      }
      return;
    }

    const fallbackEpisodes = [];
    const fallback = /<a[^>]*href=['"]([^'"]*\/play\/[^'"]+\.html)['"][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    let idx = 1;
    while ((match = fallback.exec(html)) !== null) {
      const full = buildURL(match[1]);
      const title = stripTags(match[2]) || ('第' + idx + '集');
      fallbackEpisodes.push(buildEpisodeData(full, title, full));
      idx += 1;
    }

    if (fallbackEpisodes.length === 0) {
      $next.emptyView('未找到可播放剧集');
      return;
    }

    $next.toEpisodes(JSON.stringify(fallbackEpisodes));
  });
}

function Player(episodeURL) {
  fetchAndParse(episodeURL).then(function (html) {
    const headers = {
      Referer: episodeURL,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    };
    const urls = [];
    let nextURL = '';

    const match = html.match(/var\s+cms_player\s*=\s*(\{[\s\S]*?\});/);
    if (match && match[1]) {
      try {
        const obj = JSON.parse(match[1]);
        const playURL = decodeEscapedURL(obj.url || '');
        nextURL = decodeEscapedURL(obj.next_url || '');
        if (playURL) {
          urls.push(playURL);
        }
      } catch (error) {
        print({ stage: 'parse-cms_player', error: String(error) });
      }
    }

    if (urls.length === 0) {
      const regex = /https?:\\\/\\\/[^"'\\\s]+?\.(m3u8|mp4)[^"'\\\s]*/gi;
      let fallback;
      while ((fallback = regex.exec(html)) !== null) {
        const candidate = decodeEscapedURL(fallback[0]);
        if (candidate && candidate !== nextURL) {
          urls.push(candidate);
        }
      }
    }

    const finalURLs = uniqStrings(urls);
    if (finalURLs.length === 0) {
      $next.emptyView('未解析到播放地址');
      return;
    }

    if (finalURLs.length > 1 && typeof $next.toPlayerCandidates === 'function') {
      const candidates = finalURLs.map(function (item) {
        return {
          url: item,
          headers: headers,
        };
      });
      $next.toPlayerCandidates(JSON.stringify({ candidates: candidates }));
      return;
    }

    if (typeof $next.toPlayerByJSON === 'function') {
      $next.toPlayerByJSON(
        JSON.stringify({
          url: finalURLs[0],
          headers: headers,
        })
      );
      return;
    }

    $next.toPlayer(finalURLs[0]);
  });
}
