'user script';

const BASE_URL = 'https://www.youknow.tv';
const PLAYER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';
const EPISODE_PAYLOAD_PREFIX = 'youknow-episode:';

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

function buildPlayerCandidate(url, headers) {
  return {
    url: url,
    headers: headers && typeof headers === 'object' ? headers : {},
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

function decodePercentLayers(str, maxDepth) {
  let value = str == null ? '' : String(str);
  const depth = maxDepth > 0 ? maxDepth : 1;

  for (let i = 0; i < depth; i++) {
    const decoded = safeDecodeURIComponent(value);
    if (decoded === value) {
      break;
    }
    value = decoded;
  }

  return value;
}

function base64Decode(text) {
  if (!text) {
    return '';
  }

  const normalized = String(text)
    .replace(/[\r\n\t\s]/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  if (!normalized || normalized.length % 4 === 1) {
    return '';
  }

  if (typeof atob === 'function') {
    try {
      return atob(normalized);
    } catch (e) {}
  }

  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(normalized, 'base64').toString('binary');
    } catch (e) {}
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < normalized.length; i++) {
    const index = alphabet.indexOf(normalized.charAt(i));
    if (index < 0) {
      continue;
    }
    if (index === 64) {
      break;
    }
    value = (value << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((value >> bits) & 0xff);
    }
  }

  return output;
}

function uniqueStrings(list) {
  const seen = {};
  const out = [];

  for (let i = 0; i < (list || []).length; i++) {
    const value = String(list[i] || '').trim();
    if (!value || seen[value]) {
      continue;
    }
    seen[value] = true;
    out.push(value);
  }

  return out;
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

function fetchAndParse(url, refererOverride) {
  const req = {
    url: url,
    method: 'GET',
    headers: {
      'User-Agent': PLAYER_USER_AGENT,
      Referer: refererOverride || BASE_URL + '/',
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
    $next.toMedias(JSON.stringify(datas), key);
  });
}

function buildSearchMedias(searchURL, key) {
  buildMedias(searchURL, key);
}

function buildEpisodePayload(payload) {
  return EPISODE_PAYLOAD_PREFIX + encodeURIComponent(JSON.stringify(payload || {}));
}

function parseEpisodePayload(inputURL) {
  const text = String(inputURL || '');
  if (text.indexOf(EPISODE_PAYLOAD_PREFIX) !== 0) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(text.substring(EPISODE_PAYLOAD_PREFIX.length)));
  } catch (error) {
    return null;
  }
}

function extractEpisodeMeta(episodeURL) {
  const match = String(episodeURL || '').match(/\/p\/(\d+)-(\d+)-(\d+)\/?$/i);
  if (!match) {
    return null;
  }

  return {
    vodId: String(match[1] || ''),
    sourceId: String(match[2] || ''),
    episodeIndex: parseInt(match[3], 10) || 0,
  };
}

function extractEpisodeNodeTitle(node, fallbackIndex) {
  const innerText = sanitizeText(node && node.children ? tXml.toContentString(node.children) : '');
  if (innerText) {
    return innerText;
  }

  const titleAttr = sanitizeText(node && node.attributes ? node.attributes.title || '' : '');
  if (!titleAttr) {
    return fallbackIndex > 0 ? '第' + fallbackIndex + '集' : '';
  }

  const matched = titleAttr.match(/第[^集]*集/);
  return matched && matched[0] ? matched[0] : titleAttr;
}

function parseEpisodeSourceNames(html) {
  const names = [];
  const regex = /data-dropdown-value=["']([^"']+)["']/gi;
  let match = null;

  while ((match = regex.exec(html))) {
    const text = sanitizeText(match[1] || '');
    if (text) {
      names.push(text);
    }
  }

  return names;
}

function parseEpisodeSourceGroups(html) {
  const groups = [];
  const groupNodes = tXml.getElementsByClassName(html, 'module-play-list') || [];
  const sourceNames = parseEpisodeSourceNames(html);

  for (let groupIndex = 0; groupIndex < groupNodes.length; groupIndex++) {
    const groupNode = groupNodes[groupIndex];
    const anchors = [];
    const seen = {};
    const episodes = [];

    collectAnchorNodes(groupNode, anchors);

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      if (!anchor || !anchor.attributes || !anchor.attributes.href) {
        continue;
      }

      const episodeURL = buildURL(anchor.attributes.href);
      const meta = extractEpisodeMeta(episodeURL);
      if (!episodeURL || !meta || seen[episodeURL]) {
        continue;
      }

      seen[episodeURL] = true;
      episodes.push({
        id: episodeURL,
        title: extractEpisodeNodeTitle(anchor, meta.episodeIndex),
        episodeDetailURL: episodeURL,
        vodId: meta.vodId,
        sourceId: meta.sourceId,
        episodeIndex: meta.episodeIndex,
      });
    }

    if (episodes.length === 0) {
      continue;
    }

    groups.push({
      source: sourceNames[groups.length] || '线路' + (groups.length + 1),
      sourceId: episodes[0].sourceId || String(groups.length + 1),
      episodes: episodes,
    });
  }

  return groups;
}

function alignEpisodeSourceGroups(groups) {
  const alignedMap = {};
  const alignedIndexes = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];
    const sourceName = sanitizeText(group && group.source ? group.source : '') || '线路' + (groupIndex + 1);
    const sourceEpisodes = group && group.episodes ? group.episodes : [];

    for (let i = 0; i < sourceEpisodes.length; i++) {
      const episode = sourceEpisodes[i];
      const episodeIndex = parseInt(episode && episode.episodeIndex, 10) || 0;
      if (!episodeIndex) {
        continue;
      }

      const key = String(episodeIndex);
      if (!alignedMap[key]) {
        alignedMap[key] = {
          vodId: episode.vodId || '',
          episodeIndex: episodeIndex,
          title: episode.title || '',
          candidates: [],
        };
        alignedIndexes.push(episodeIndex);
      }

      const record = alignedMap[key];
      if (!record.vodId && episode.vodId) {
        record.vodId = episode.vodId;
      }
      if (!record.title && episode.title) {
        record.title = episode.title;
      }

      record.candidates.push({
        source: sourceName,
        sourceId: episode.sourceId || group.sourceId || '',
        episodeURL: episode.episodeDetailURL || '',
        title: episode.title || '',
      });
    }
  }

  alignedIndexes.sort(function (a, b) {
    return a - b;
  });

  const datas = [];
  for (let i = 0; i < alignedIndexes.length; i++) {
    const episodeIndex = alignedIndexes[i];
    const record = alignedMap[String(episodeIndex)];
    if (!record || !record.candidates || record.candidates.length === 0) {
      continue;
    }

    const title = record.title || '第' + episodeIndex + '集';
    const id = (record.vodId || 'youknow') + ':' + episodeIndex;
    datas.push(
      buildEpisodeData(
        id,
        title,
        buildEpisodePayload({
          vodId: record.vodId || '',
          episodeIndex: episodeIndex,
          title: title,
          candidates: record.candidates,
        })
      )
    );
  }

  return datas;
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
    const sourceGroups = parseEpisodeSourceGroups(html);
    if (sourceGroups.length > 0) {
      const alignedEpisodes = alignEpisodeSourceGroups(sourceGroups);
      if (alignedEpisodes.length > 0) {
        $next.toEpisodes(JSON.stringify(alignedEpisodes));
        return;
      }
    }

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
  const candidates = [];

  function addCandidate(value) {
    if (!value) {
      return;
    }
    const v = String(value).trim();
    if (!v) {
      return;
    }
    if (candidates.indexOf(v) === -1) {
      candidates.push(v);
    }
  }

  const seeds = [
    enc == null ? '' : String(enc),
    decodePercentLayers(enc, 1),
    decodePercentLayers(enc, 2),
  ];

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    addCandidate(seed);
    const decoded = base64Decode(seed);
    if (!decoded) {
      continue;
    }
    addCandidate(decoded);
    addCandidate(decodePercentLayers(decoded, 1));
    addCandidate(decodePercentLayers(decoded, 2));
    addCandidate(decodePercentLayers(decoded, 3));
  }

  for (let i = 0; i < candidates.length; i++) {
    const normalized = normalizePlayURL(candidates[i]);
    if (isDirectPlayableURL(normalized)) {
      return normalized;
    }
  }

  return normalizePlayURL(decodePercentLayers(enc, 2));
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

function collectDirectMediaURLs(text) {
  if (!text) {
    return [];
  }

  const normalized = String(text).replace(/\\\//g, '/');
  const urls = [];
  let match = null;
  const directRegex = /https?:\/\/[^"'\\\s]+?\.(m3u8|mp4|flv)(\?[^"'\\\s]*)?/gi;
  while ((match = directRegex.exec(normalized))) {
    urls.push(normalizePlayURL(match[0]));
  }

  const protocolLessRegex = /\/\/[^"'\\\s]+?\.(m3u8|mp4|flv)(\?[^"'\\\s]*)?/gi;
  while ((match = protocolLessRegex.exec(normalized))) {
    urls.push(normalizePlayURL('https:' + match[0]));
  }

  return uniqueStrings(urls);
}

function getQueryParam(url, name) {
  if (!url) {
    return '';
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = url.match(new RegExp('[?&]' + escaped + '=([^&#]+)'));
  return match ? safeDecodeURIComponent(match[1]) : '';
}

function extractBalancedObject(text, startIndex) {
  if (!text || startIndex < 0 || startIndex >= text.length || text.charAt(startIndex) !== '{') {
    return '';
  }

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text.charAt(i);

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{') {
      depth++;
      continue;
    }

    if (char === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  return '';
}

function parseObjectLiteral(raw) {
  if (!raw) {
    return null;
  }

  const sanitized = String(raw).trim().replace(/,\s*}/g, '}');
  try {
    return JSON.parse(sanitized);
  } catch (e) {
    try {
      return Function('return (' + sanitized + ')')();
    } catch (err) {
      return null;
    }
  }
}

function extractPlayerConfig(html) {
  if (!html) {
    return null;
  }

  const regex = /player_aaaa\s*=\s*/gi;
  let match = null;

  while ((match = regex.exec(html))) {
    const assignIndex = match.index + match[0].length;
    const objectStart = html.indexOf('{', assignIndex);
    if (objectStart < 0) {
      continue;
    }

    const rawObject = extractBalancedObject(html, objectStart);
    const parsed = parseObjectLiteral(rawObject);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function appendPlayableURL(urls, seen, url) {
  const normalized = normalizePlayURL(url);
  if (!isDirectPlayableURL(normalized) || seen[normalized]) {
    return;
  }

  seen[normalized] = true;
  urls.push(normalized);
}

function collectPlayableURLsFromHTML(html) {
  const urls = [];
  const seen = {};
  const config = extractPlayerConfig(html);
  let iframeSrc = '';

  if (config && config.url) {
    appendPlayableURL(urls, seen, decodePlayerURL(config.url, config.encrypt));
  }

  const directURLs = collectDirectMediaURLs(html);
  for (let i = 0; i < directURLs.length; i++) {
    appendPlayableURL(urls, seen, directURLs[i]);
  }

  const iframeNode = tXml.getElementsByClassName(html, 'embed-responsive-item')[0];
  if (iframeNode && iframeNode.attributes && iframeNode.attributes.src) {
    iframeSrc = buildURL(iframeNode.attributes.src);
    appendPlayableURL(urls, seen, decodePlayerURL(getQueryParam(iframeSrc, 'url'), 0));
  }

  return {
    urls: urls,
    iframeSrc: iframeSrc,
  };
}

function resolvePlayableURLsFromEpisodePage(episodeURL) {
  const pageURL = String(episodeURL || '').trim();
  if (!pageURL) {
    return Promise.resolve([]);
  }

  if (isDirectPlayableURL(pageURL) && !extractEpisodeMeta(pageURL)) {
    return Promise.resolve([normalizePlayURL(pageURL)]);
  }

  return fetchAndParse(pageURL, BASE_URL + '/').then(function (html) {
    const state = collectPlayableURLsFromHTML(html);
    if (!state.iframeSrc) {
      return state.urls;
    }

    return fetchAndParse(state.iframeSrc, pageURL).then(function (iframeHTML) {
      const iframeState = collectPlayableURLsFromHTML(iframeHTML);
      return uniqueStrings(state.urls.concat(iframeState.urls));
    });
  });
}

function buildPlayerSourceEntries(inputURL) {
  const payload = parseEpisodePayload(inputURL);
  if (payload && payload.candidates && payload.candidates.length) {
    const entries = [];
    for (let i = 0; i < payload.candidates.length; i++) {
      const candidate = payload.candidates[i] || {};
      const episodeURL = String(candidate.episodeURL || '').trim();
      if (!episodeURL) {
        continue;
      }
      entries.push({
        source: sanitizeText(candidate.source || '') || '线路' + (i + 1),
        episodeURL: episodeURL,
      });
    }
    if (entries.length > 0) {
      return entries;
    }
  }

  if (!inputURL) {
    return [];
  }

  return [
    {
      source: '默认',
      episodeURL: String(inputURL),
    },
  ];
}

function emitPlayerCandidates(candidates) {
  if (!candidates || candidates.length === 0) {
    $next.toPlayer('');
    return;
  }

  if (typeof $next.toPlayerCandidates === 'function') {
    $next.toPlayerCandidates(JSON.stringify(candidates));
    return;
  }

  const first = candidates[0];
  if (typeof $next.toPlayerByJSON === 'function') {
    $next.toPlayerByJSON(JSON.stringify(first));
    return;
  }

  $next.toPlayer(first.url);
}

function Player(inputURL) {
  const sourceEntries = buildPlayerSourceEntries(inputURL);
  const results = [];

  function finish() {
    const candidates = [];
    const seen = {};

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const urls = result && result.urls ? result.urls : [];
      for (let j = 0; j < urls.length; j++) {
        const url = normalizePlayURL(urls[j]);
        if (!isDirectPlayableURL(url) || seen[url]) {
          continue;
        }
        seen[url] = true;
        candidates.push(buildPlayerCandidate(url, {}));
      }
    }

    if (candidates.length === 0) {
      print({ playerParseError: 'play url not found', episodeURL: inputURL, sources: sourceEntries });
    }

    emitPlayerCandidates(candidates);
  }

  function next(index) {
    if (index >= sourceEntries.length) {
      finish();
      return;
    }

    const entry = sourceEntries[index];
    resolvePlayableURLsFromEpisodePage(entry.episodeURL).then(
      function (urls) {
        results.push({
          source: entry.source,
          urls: urls || [],
        });
        next(index + 1);
      },
      function () {
        results.push({
          source: entry.source,
          urls: [],
        });
        next(index + 1);
      }
    );
  }

  next(0);
}
