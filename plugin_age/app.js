'user script';

const DETAIL_BASE = 'https://ageapi.omwjhz.com:18888/v2/detail/';
const DEFAULT_ZJ_RESOLVER = 'https://jx.ejtsyc.com:8443/m3u8/?url=';
const DEFAULT_VIP_RESOLVER = 'https://jx.ejtsyc.com:8443/vip/?url=';
const RESOLVER_REGEX = /var\s+Vurl\s*=\s*['"]([^'"]*)['"]\s*;/;
const PLAYER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const EPISODE_PAYLOAD_PREFIX = 'age-payload:';
const RESOLVER_REQUEST_HEADERS = {
  Origin: '',
  Referer: '',
  'User-Agent': PLAYER_USER_AGENT,
};

function buildMediaData(id, coverURLString, title, descriptionText, detailURLString) {
  return {
    id: id,
    coverURLString: coverURLString,
    title: title,
    descriptionText: descriptionText,
    detailURLString: detailURLString,
  };
}

function buildEpisodeData(id, title, episodeDetailURL, tagText) {
  return {
    id: id,
    title: title,
    tagText: tagText,
    episodeDetailURL: episodeDetailURL,
  };
}

function buildPlayerCandidate(url, headers) {
  return {
    url: url,
    headers: headers && typeof headers === 'object' ? headers : {},
  };
}

function buildEpisodePayload(payload) {
  var safePayload = payload;

  if (typeof safePayload === 'string') {
    safePayload = {
      resolverURL: safePayload,
    };
  }

  return EPISODE_PAYLOAD_PREFIX + encodeURIComponent(JSON.stringify(safePayload || {}));
}

function parseEpisodePayload(inputURL) {
  var text = String(inputURL || '');
  var payloadText = '';

  if (text.indexOf(EPISODE_PAYLOAD_PREFIX) === 0) {
    payloadText = text.substring(EPISODE_PAYLOAD_PREFIX.length);
  } else {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(payloadText));
  } catch (error) {
    return null;
  }
}

function fetchText(url, onSuccess, onFailure, headers) {
  var req = {
    url: url,
    method: 'GET',
  };

  if (headers) {
    req.headers = headers;
  }

  $http.fetch(req)
    .then(function (res) {
      onSuccess(res.body || '');
    })
    .catch(function (error) {
      if (onFailure) {
        onFailure(error);
      }
    });
}

function isHTTPURL(inputURL) {
  return /^https?:\/\//i.test(String(inputURL || ''));
}

function isResolverURL(inputURL) {
  return /^https?:\/\/jx\.ejtsyc\.com:8443\/(m3u8|vip)\/\?url=/i.test(String(inputURL || ''));
}

function normalizePlayURL(playURL, baseURL) {
  var finalURL = trimText(playURL);

  if (!finalURL) {
    return '';
  }

  if (!isHTTPURL(finalURL)) {
    try {
      finalURL = new URL(finalURL, baseURL).toString();
    } catch (error) {}
  }

  return finalURL;
}

function resolveResolverURL(inputURL, onSuccess, onFailure) {
  if (!isResolverURL(inputURL)) {
    onSuccess(inputURL);
    return;
  }

  fetchText(
    inputURL,
    function (body) {
      var match = body.match(RESOLVER_REGEX);
      var playURL = normalizePlayURL(match && match[1] ? match[1] : '', inputURL);

      if (!playURL || isResolverURL(playURL)) {
        if (onFailure) {
          onFailure('resolver-unmatched');
        }
        return;
      }

      onSuccess(playURL);
    },
    function (error) {
      if (onFailure) {
        onFailure(error);
      }
    },
    RESOLVER_REQUEST_HEADERS
  );
}

function buildResolverHeaders(resolverURL) {
  var headers = {
    'User-Agent': PLAYER_USER_AGENT,
  };

  if (isResolverURL(resolverURL)) {
    headers.Referer = resolverURL;
  }

  return headers;
}

function emitPlayerCandidates(candidates) {
  var list = candidates || [];

  if (!list.length) {
    if (typeof $next.emptyView === 'function') {
      $next.emptyView('AGE 播放地址解析失敗');
      return;
    }

    $next.toPlayer('');
    return;
  }

  if (typeof $next.toPlayerCandidates === 'function') {
    $next.toPlayerCandidates(JSON.stringify(list));
    return;
  }

  if (typeof $next.toPlayerByJSON === 'function') {
    $next.toPlayerByJSON(JSON.stringify(list[0]));
    return;
  }

  $next.toPlayer(list[0].url);
}

function safeJSONParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function trimText(input) {
  return String(input || '').replace(/^\s+|\s+$/g, '');
}

function sanitizeText(input) {
  return trimText(String(input || '').replace(/\s+/g, ' '));
}

function buildDescription(item) {
  var parts = [];
  var uptodate = trimText(item && item.uptodate);
  var status = trimText(item && item.status);
  var type = trimText(item && item.type);

  if (uptodate) {
    parts.push(uptodate);
  } else if (status) {
    parts.push(status);
  }

  if (type) {
    parts.push(type);
  }

  return parts.join(' · ');
}

function buildDetailURL(id) {
  return DETAIL_BASE + encodeURIComponent(String(id || ''));
}

function splitCSV(input) {
  var list = String(input || '').split(',');
  var result = [];

  for (var i = 0; i < list.length; i++) {
    var value = trimText(list[i]);
    if (value) {
      result.push(value);
    }
  }

  return result;
}

function lineUsesVIPResolver(lineKey, detailData) {
  var vipLines = splitCSV(detailData && detailData.player_vip);

  for (var i = 0; i < vipLines.length; i++) {
    if (vipLines[i] === lineKey) {
      return true;
    }
  }

  return false;
}

function buildResolverURL(lineKey, cryptograph, detailData) {
  var playerJX = detailData && detailData.player_jx ? detailData.player_jx : {};
  var prefix = lineUsesVIPResolver(lineKey, detailData)
    ? (playerJX.vip || DEFAULT_VIP_RESOLVER)
    : (playerJX.zj || DEFAULT_ZJ_RESOLVER);

  return prefix + String(cryptograph || '');
}

function buildSourceName(lineKey, labelsMap) {
  if (labelsMap && labelsMap[lineKey]) {
    return labelsMap[lineKey];
  }

  return trimText(lineKey) || '未知線路';
}

function extractEpisodeNumber(title) {
  var text = sanitizeText(title).replace(/\s+/g, '');
  var match = null;

  if (!text) {
    return 0;
  }

  match = text.match(/第0*(\d+)(?:[集话話期卷篇]|$)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10) || 0;
  }

  match = text.match(/^0*(\d+)(?:[集话話期卷篇]|$)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10) || 0;
  }

  return 0;
}

function buildEpisodeAlignMeta(title, episodeOrder) {
  var episodeNumber = extractEpisodeNumber(title);

  if (episodeNumber > 0) {
    return {
      key: 'num:' + episodeNumber,
      episodeNumber: episodeNumber,
    };
  }

  return {
    key: 'slot:' + episodeOrder,
    episodeNumber: 0,
  };
}

function selectPreferredTitle(currentTitle, nextTitle) {
  var current = sanitizeText(currentTitle);
  var next = sanitizeText(nextTitle);
  var currentHasEnding = false;
  var nextHasEnding = false;

  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  currentHasEnding = /完结|完結/i.test(current);
  nextHasEnding = /完结|完結/i.test(next);

  if (!currentHasEnding && nextHasEnding) {
    return next;
  }

  if (next.length > current.length) {
    return next;
  }

  return current;
}

function buildEpisodeSourceGroups(detailData) {
  var allGroups = [];
  var preferredGroups = [];
  var video = detailData && detailData.video ? detailData.video : {};
  var playlists = video.playlists || {};
  var labelsMap = detailData && detailData.player_label_arr ? detailData.player_label_arr : {};
  var lineKeys = Object.keys(playlists);

  for (var i = 0; i < lineKeys.length; i++) {
    var lineKey = lineKeys[i];
    var lineEpisodes = playlists[lineKey];
    var sourceName = buildSourceName(lineKey, labelsMap);
    var episodes = [];
    var isVIP = lineUsesVIPResolver(lineKey, detailData);

    if (!lineEpisodes || !lineEpisodes.length) {
      continue;
    }

    for (var j = 0; j < lineEpisodes.length; j++) {
      var pair = lineEpisodes[j];
      var title = '';
      var cryptograph = '';
      var alignMeta = null;

      if (!pair || pair.length < 2) {
        continue;
      }

      title = sanitizeText(pair[0]) || '第' + (j + 1) + '集';
      cryptograph = trimText(pair[1]);
      if (!cryptograph) {
        continue;
      }

      alignMeta = buildEpisodeAlignMeta(title, j + 1);
      episodes.push({
        title: title,
        source: sourceName,
        lineKey: lineKey,
        resolverURL: buildResolverURL(lineKey, cryptograph, detailData),
        episodeOrder: j + 1,
        alignKey: alignMeta.key,
        episodeNumber: alignMeta.episodeNumber,
      });
    }

    if (!episodes.length) {
      continue;
    }

    allGroups.push({
      source: sourceName,
      lineKey: lineKey,
      isVIP: isVIP,
      episodes: episodes,
    });

    if (!isVIP) {
      preferredGroups.push({
        source: sourceName,
        lineKey: lineKey,
        isVIP: false,
        episodes: episodes,
      });
    }
  }

  return preferredGroups.length ? preferredGroups : allGroups;
}

function alignEpisodeSourceGroups(detailData, groups) {
  var datas = [];
  var alignedMap = {};
  var orderedKeys = [];
  var video = detailData && detailData.video ? detailData.video : {};
  var videoID = String(video.id || '');

  for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    var group = groups[groupIndex];
    var sourceEpisodes = group && group.episodes ? group.episodes : [];

    for (var i = 0; i < sourceEpisodes.length; i++) {
      var episode = sourceEpisodes[i];
      var key = episode && episode.alignKey ? String(episode.alignKey) : '';
      var record = null;

      if (!key) {
        continue;
      }

      if (!alignedMap[key]) {
        alignedMap[key] = {
          videoId: videoID,
          title: sanitizeText(episode.title || ''),
          episodeOrder: episode.episodeOrder || (i + 1),
          alignKey: key,
          episodeNumber: episode.episodeNumber || 0,
          sortOrder: episode.episodeNumber > 0 ? episode.episodeNumber : (100000 + (episode.episodeOrder || (i + 1))),
          candidates: [],
        };
        orderedKeys.push(key);
      }

      record = alignedMap[key];
      record.title = selectPreferredTitle(record.title, episode.title);

      if (episode.episodeNumber > 0) {
        record.episodeNumber = episode.episodeNumber;
        record.sortOrder = episode.episodeNumber;
      } else if ((episode.episodeOrder || 0) < record.episodeOrder) {
        record.episodeOrder = episode.episodeOrder || record.episodeOrder;
      }

      record.candidates.push({
        source: episode.source || group.source || '',
        lineKey: episode.lineKey || group.lineKey || '',
        resolverURL: episode.resolverURL || '',
        title: episode.title || '',
      });
    }
  }

  orderedKeys.sort(function (left, right) {
    var a = alignedMap[left];
    var b = alignedMap[right];
    var aOrder = a ? a.sortOrder : 0;
    var bOrder = b ? b.sortOrder : 0;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return (a && a.episodeOrder ? a.episodeOrder : 0) - (b && b.episodeOrder ? b.episodeOrder : 0);
  });

  for (var index = 0; index < orderedKeys.length; index++) {
    var record = alignedMap[orderedKeys[index]];
    var title = '';

    if (!record || !record.candidates || !record.candidates.length) {
      continue;
    }

    title = sanitizeText(record.title);
    if (!title) {
      if (record.episodeNumber > 0) {
        title = '第' + record.episodeNumber + '集';
      } else {
        title = '第' + record.episodeOrder + '集';
      }
    }

    datas.push(
      buildEpisodeData(
        record.videoId + ':' + record.alignKey,
        title,
        buildEpisodePayload({
          videoId: record.videoId,
          title: title,
          episodeOrder: record.episodeOrder,
          alignKey: record.alignKey,
          candidates: record.candidates,
        })
      )
    );
  }

  return datas;
}

function mapVideos(videos) {
  var datas = [];
  var list = videos || [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i] || {};
    var id = String(item.id || '');
    if (!id) {
      continue;
    }

    datas.push(
      buildMediaData(
        id,
        item.cover || '',
        trimText(item.name) || id,
        buildDescription(item),
        buildDetailURL(id)
      )
    );
  }

  return datas;
}

function buildMedias(inputURL, key) {
  fetchText(
    inputURL,
    function (body) {
      var payload = safeJSONParse(body);
      var datas = mapVideos(payload && payload.videos);

      if (!datas.length && typeof $next.emptyView === 'function') {
        $next.emptyView('AGE 列表暫時沒有內容');
      }

      $next.toMedias(JSON.stringify(datas), key);
    },
    function () {
      if (typeof $next.emptyView === 'function') {
        $next.emptyView('讀取 AGE 列表失敗');
      }
      $next.toMedias('[]', key);
    }
  );
}

function buildSearchMedias(inputURL, key) {
  fetchText(
    inputURL,
    function (body) {
      var payload = safeJSONParse(body);
      var videos = payload && payload.data ? payload.data.videos : [];
      var datas = mapVideos(videos);
      $next.toSearchMedias(JSON.stringify(datas), key);
    },
    function () {
      $next.toSearchMedias('[]', key);
    }
  );
}

function Episodes(detailURL) {
  fetchText(
    detailURL,
    function (body) {
      var payload = safeJSONParse(body);
      var groups = buildEpisodeSourceGroups(payload);
      var datas = alignEpisodeSourceGroups(payload, groups);

      if (!datas.length) {
        if (typeof $next.emptyView === 'function') {
          $next.emptyView('未找到可播放劇集');
        }
        return;
      }

      $next.toEpisodes(JSON.stringify(datas));
    },
    function () {
      if (typeof $next.emptyView === 'function') {
        $next.emptyView('讀取 AGE 詳情失敗');
      }
    }
  );
}

function buildPlayerSourceEntries(inputURL) {
  var payload = parseEpisodePayload(inputURL);
  var entries = [];
  var seen = {};

  if (payload && payload.candidates && payload.candidates.length) {
    for (var i = 0; i < payload.candidates.length; i++) {
      var candidate = payload.candidates[i] || {};
      var resolverURL = String(candidate.resolverURL || '').trim();
      var key = resolverURL;

      if (!resolverURL || seen[key]) {
        continue;
      }

      seen[key] = true;
      entries.push({
        source: sanitizeText(candidate.source || '') || '线路' + (i + 1),
        resolverURL: resolverURL,
      });
    }

    if (entries.length) {
      return entries;
    }
  }

  if (payload && payload.resolverURL) {
    return [{
      source: '默认',
      resolverURL: String(payload.resolverURL),
    }];
  }

  if (!inputURL) {
    return [];
  }

  return [{
    source: '默认',
    resolverURL: String(inputURL),
  }];
}

function Player(episodeURL) {
  var sourceEntries = buildPlayerSourceEntries(episodeURL);
  var candidates = [];
  var seen = {};

  function finish() {
    emitPlayerCandidates(candidates);
  }

  function next(index) {
    if (index >= sourceEntries.length) {
      finish();
      return;
    }

    var entry = sourceEntries[index];
    resolveResolverURL(
      entry.resolverURL,
      function (playURL) {
        var finalURL = normalizePlayURL(playURL, entry.resolverURL);

        if (finalURL && !seen[finalURL]) {
          seen[finalURL] = true;
          candidates.push(buildPlayerCandidate(finalURL, buildResolverHeaders(entry.resolverURL)));
        }

        next(index + 1);
      },
      function () {
        next(index + 1);
      }
    );
  }

  if (!sourceEntries.length) {
    finish();
    return;
  }

  next(0);
}
