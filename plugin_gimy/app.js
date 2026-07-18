'user script';

const BASE_URL =
  typeof __syncnextPrimaryHost === 'string' && __syncnextPrimaryHost
    ? __syncnextPrimaryHost.replace(/\/$/, '')
    : 'https://gimy.tv';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';

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

function buildURL(value) {
  const raw = String(value || '').replace(/\\\//g, '/').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.indexOf('//') === 0) return 'https:' + raw;
  if (raw[0] === '/') return BASE_URL + raw;
  return BASE_URL + '/' + raw;
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, function (_, number) {
      return String.fromCharCode(Number(number));
    });
}

function stripTags(value) {
  return decodeEntities(String(value || '').replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttribute(fragment, name) {
  const match = String(fragment || '').match(
    new RegExp('\\b' + name + '\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1', 'i')
  );
  return match && match[2] ? decodeEntities(match[2]).trim() : '';
}

function requestHeaders(referer) {
  return {
    Referer: referer || BASE_URL + '/',
    'User-Agent': USER_AGENT,
  };
}

function fetchHTML(url) {
  return $http.fetch({
    url: url,
    method: 'GET',
    headers: requestHeaders(BASE_URL + '/'),
  }).then(function (res) {
    return String((res && res.body) || '');
  });
}

function HostsProbeRequest() {
  return {
    url: BASE_URL + '/',
    method: 'GET',
    headers: requestHeaders(BASE_URL + '/'),
    accept: {
      statusCodes: [200],
      bodyIncludesAny: ['myui-vodlist__box'],
      bodyExcludesAny: ['访问验证', '訪問驗證', '安全验证', '安全驗證', 'Just a moment', 'captcha'],
      titleExcludesAny: ['访问验证', '訪問驗證', '安全验证', '安全驗證', 'Just a moment', '403 Forbidden'],
    },
  };
}

function parseCover(attributes) {
  let cover =
    getAttribute(attributes, 'data-original') ||
    getAttribute(attributes, 'data-src') ||
    getAttribute(attributes, 'src');
  if (!cover) {
    const style = getAttribute(attributes, 'style');
    const matched = style.match(/background\s*:\s*url\(([^)]+)\)/i);
    if (matched && matched[1]) {
      cover = matched[1].replace(/^['"]|['"]$/g, '').trim();
    }
  }
  return buildURL(cover);
}

function parseMedias(html) {
  const datas = [];
  const seen = {};
  const card = /<a\b([^>]*\bclass\s*=\s*(?:"[^"]*\bmyui-vodlist__thumb\b[^"]*"|'[^']*\bmyui-vodlist__thumb\b[^']*')[^>]*)>([\s\S]*?)<\/a>/gi;
  let matched;

  while ((matched = card.exec(html)) !== null) {
    const attributes = matched[1];
    const href = buildURL(getAttribute(attributes, 'href'));
    if (!/\/vod\/\d+\.html(?:$|[?#])/i.test(href) || seen[href]) continue;

    const title = getAttribute(attributes, 'title') || stripTags(matched[2]);
    if (!title) continue;

    seen[href] = true;
    datas.push(buildMediaData(href, parseCover(attributes), title, stripTags(matched[2]), href));
  }

  return datas;
}

function parseEpisodes(fragment) {
  const datas = [];
  const seen = {};
  const episode = /<a\b([^>]*\bhref\s*=\s*(?:"[^"]*\/ep-\d+-\d+-\d+\.html[^"]*"|'[^']*\/ep-\d+-\d+-\d+\.html[^']*')[^>]*)>([\s\S]*?)<\/a>/gi;
  let matched;

  while ((matched = episode.exec(fragment)) !== null) {
    const href = buildURL(getAttribute(matched[1], 'href'));
    if (!href || seen[href]) continue;

    const title = getAttribute(matched[1], 'title') || stripTags(matched[2]) || '播放';
    seen[href] = true;
    datas.push(buildEpisodeData(href, title, href));
  }

  return datas;
}

function parseEpisodeCandidates(html) {
  const candidates = [];
  const sourcePanel = /<div\s+class=["'][^"']*\bmyui-panel\b[^"']*["'][\s\S]*?<h3[^>]*class=["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/h3>[\s\S]*?<ul[^>]*class=["'][^"']*\bmyui-content__list\b[^"']*["'][^>]*>([\s\S]*?)<\/ul>/gi;
  let matched;

  while ((matched = sourcePanel.exec(html)) !== null) {
    const episodes = parseEpisodes(matched[2]);
    if (episodes.length === 0) continue;
    candidates.push({
      source: stripTags(matched[1]) || '播放线路',
      episodes: episodes,
    });
  }

  return candidates;
}

function base64Decode(value) {
  const input = String(value || '');
  if (!input) return '';
  if (typeof atob === 'function') {
    try {
      return atob(input);
    } catch (_) {}
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (let index = 0; index < input.length; index++) {
    if (input[index] === '=') break;
    const valueAtIndex = alphabet.indexOf(input[index]);
    if (valueAtIndex < 0) continue;
    buffer = (buffer << 6) | valueAtIndex;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

function decodePlayerURL(value, encrypt) {
  const raw = String(value || '');
  if (!raw) return '';
  try {
    if (Number(encrypt) === 1) return unescape(raw);
    if (Number(encrypt) === 2) return decodeURIComponent(base64Decode(raw));
  } catch (_) {
    return raw;
  }
  return raw;
}

function parsePlayerData(html) {
  const matched = String(html || '').match(
    /<script[^>]*>\s*var\s+player_data\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/i
  );
  if (!matched || !matched[1]) return null;
  try {
    return JSON.parse(matched[1]);
  } catch (_) {
    return null;
  }
}

function buildMedias(inputURL, key) {
  fetchHTML(inputURL).then(function (html) {
    $next.toMedias(JSON.stringify(parseMedias(html)), key);
  }).catch(function (error) {
    print({ stage: 'medias', error: String(error || '') });
    $next.toMedias(JSON.stringify([]), key);
  });
}

function Search(inputURL, key) {
  fetchHTML(inputURL).then(function (html) {
    $next.toSearchMedias(JSON.stringify(parseMedias(html)), key);
  }).catch(function (error) {
    print({ stage: 'search', error: String(error || '') });
    $next.toSearchMedias(JSON.stringify([]), key);
  });
}

function Episodes(detailURL) {
  fetchHTML(detailURL).then(function (html) {
    const candidates = parseEpisodeCandidates(html);
    if (candidates.length > 1 && typeof $next.toEpisodesCandidates === 'function') {
      $next.toEpisodesCandidates(JSON.stringify(candidates));
      return;
    }

    const episodes = candidates.length > 0 ? candidates[0].episodes : parseEpisodes(html);
    $next.toEpisodes(JSON.stringify(episodes));
  }).catch(function (error) {
    print({ stage: 'episodes', error: String(error || '') });
    $next.toEpisodes(JSON.stringify([]));
  });
}

function Player(episodeURL) {
  $http.fetch({
    url: episodeURL,
    method: 'GET',
    headers: requestHeaders(episodeURL),
  }).then(function (res) {
    const playerData = parsePlayerData(res && res.body);
    const playURL = playerData ? buildURL(decodePlayerURL(playerData.url, playerData.encrypt)) : '';
    if (!playURL) {
      $next.emptyView('未解析到播放地址');
      return;
    }

    const payload = {
      url: playURL,
      headers: requestHeaders(episodeURL),
    };
    if (typeof $next.toPlayerByJSON === 'function') {
      $next.toPlayerByJSON(JSON.stringify(payload));
      return;
    }
    $next.toPlayer(playURL);
  }).catch(function (error) {
    print({ stage: 'player', error: String(error || '') });
    $next.emptyView('播放器请求失败');
  });
}
