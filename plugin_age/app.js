'user script';

const DETAIL_BASE = 'https://ageapi.omwjhz.com:18888/v2/detail/';
const DEFAULT_ZJ_RESOLVER = 'https://jx.ejtsyc.com:8443/m3u8/?url=';
const DEFAULT_VIP_RESOLVER = 'https://jx.ejtsyc.com:8443/vip/?url=';
const RESOLVER_REGEX = /var\s+Vurl\s*=\s*['"]([^'"]*)['"]\s*;/;
const PLAYER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

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

function buildEpisodeData(id, title, episodeDetailURL, tagText) {
  return {
    id: id,
    title: title,
    tagText: tagText,
    episodeDetailURL: episodeDetailURL,
  };
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
    } catch (error) {
      print({ stage: 'normalizePlayURL', baseURL: baseURL, playURL: playURL, error: String(error) });
    }
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
    }
  );
}

function cloneEpisodeWithURL(episode, newURL) {
  return {
    id: episode.id,
    title: episode.title,
    titleNumber: episode.titleNumber,
    descriptionText: episode.descriptionText,
    imageURL: episode.imageURL,
    tagText: episode.tagText,
    episodeDetailURL: newURL,
    resumeKey: episode.resumeKey,
    fileCodec: episode.fileCodec,
    fileID: episode.fileID,
    fileSize: episode.fileSize,
  };
}

function resolveCandidateProbeURLs(candidateGroups, onDone) {
  var groups = candidateGroups || [];
  var resolvedGroups = [];
  var index = 0;

  function next() {
    if (index >= groups.length) {
      onDone(resolvedGroups);
      return;
    }

    var group = groups[index++];
    if (!group || !group.episodes || !group.episodes.length) {
      next();
      return;
    }

    var firstEpisode = group.episodes[0];
    resolveResolverURL(
      firstEpisode.episodeDetailURL,
      function (playURL) {
        var episodes = group.episodes.slice(0);
        episodes[0] = cloneEpisodeWithURL(firstEpisode, playURL);
        resolvedGroups.push({
          source: group.source,
          episodes: episodes,
        });
        next();
      },
      function (error) {
        print({ stage: 'resolveCandidateProbeURLs', source: group.source, url: firstEpisode.episodeDetailURL, error: String(error) });
        next();
      }
    );
  }

  next();
}

function emitPlayerURL(playURL, refererURL) {
  if (typeof $next.toPlayerByJSON === 'function') {
    $next.toPlayerByJSON(JSON.stringify({
      url: playURL,
      headers: refererURL ? {
        Referer: refererURL,
        'User-Agent': PLAYER_USER_AGENT,
      } : {},
    }));
    return;
  }

  $next.toPlayer(playURL);
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

function buildDescription(item) {
  var parts = [];
  var status = trimText(item && item.status);
  var type = trimText(item && item.type);

  if (status) {
    parts.push(status);
  }

  if (type) {
    parts.push(type);
  }

  return parts.join(' ');
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

function buildEpisodeCandidates(detailData) {
  var candidates = [];
  var fallbackCandidates = [];
  var video = detailData && detailData.video ? detailData.video : {};
  var playlists = video.playlists || {};
  var labelsMap = detailData && detailData.player_label_arr ? detailData.player_label_arr : {};
  var videoID = String(video.id || '');
  var lineKeys = Object.keys(playlists);

  for (var i = 0; i < lineKeys.length; i++) {
    var lineKey = lineKeys[i];
    var sourceName = buildSourceName(lineKey, labelsMap);
    var lineEpisodes = playlists[lineKey];
    var episodes = [];

    if (!lineEpisodes || !lineEpisodes.length) {
      continue;
    }

    for (var j = 0; j < lineEpisodes.length; j++) {
      var pair = lineEpisodes[j];
      if (!pair || pair.length < 2) {
        continue;
      }

      var title = trimText(pair[0]) || '第' + (j + 1) + '集';
      var cryptograph = trimText(pair[1]);
      if (!cryptograph) {
        continue;
      }

      episodes.push(
        buildEpisodeData(
          videoID + '-' + lineKey + '-' + title,
          title,
          buildResolverURL(lineKey, cryptograph, detailData),
          sourceName
        )
      );
    }

    if (!episodes.length) {
      continue;
    }

    var candidateGroup = {
      source: sourceName,
      episodes: episodes,
    };

    fallbackCandidates.push(candidateGroup);

    // AGE 的 vip 线路还需要额外的浏览器态加密请求，插件运行时无法稳定复现。
    // 这里优先只交给 Syncnext 能直接回放的非 vip 源，避免自动选线落到不可播页面。
    if (!lineUsesVIPResolver(lineKey, detailData)) {
      candidates.push(candidateGroup);
    }
  }

  return candidates.length ? candidates : fallbackCandidates;
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
    function (error) {
      print({ stage: 'buildMedias', url: inputURL, error: String(error) });
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
    function (error) {
      print({ stage: 'buildSearchMedias', url: inputURL, error: String(error) });
      $next.toSearchMedias('[]', key);
    }
  );
}

function Episodes(detailURL) {
  fetchText(
    detailURL,
    function (body) {
      var payload = safeJSONParse(body);
      var candidates = buildEpisodeCandidates(payload);
      var finishEpisodes = function (finalCandidates) {
        if (!finalCandidates.length) {
          if (typeof $next.emptyView === 'function') {
            $next.emptyView('未找到可播放劇集');
          }
          $next.toEpisodes('[]');
          return;
        }

        if (finalCandidates.length > 1 && typeof $next.toEpisodesCandidates === 'function') {
          $next.toEpisodesCandidates(JSON.stringify(finalCandidates));
          return;
        }

        $next.toEpisodes(JSON.stringify(finalCandidates[0].episodes));
      };

      if (!candidates.length) {
        finishEpisodes([]);
        return;
      }

      resolveCandidateProbeURLs(candidates, function (resolvedCandidates) {
        finishEpisodes(resolvedCandidates.length ? resolvedCandidates : candidates);
      });
    },
    function (error) {
      print({ stage: 'Episodes', url: detailURL, error: String(error) });
      if (typeof $next.emptyView === 'function') {
        $next.emptyView('讀取 AGE 詳情失敗');
      }
      $next.toEpisodes('[]');
    }
  );
}

function Player(episodeURL) {
  resolveResolverURL(
    episodeURL,
    function (playURL) {
      emitPlayerURL(playURL, isResolverURL(episodeURL) ? episodeURL : '');
    },
    function (error) {
      print({ stage: 'Player', url: episodeURL, error: String(error) });
      if (typeof $next.emptyView === 'function') {
        $next.emptyView('AGE 播放地址解析失敗');
      }
    }
  );
}
