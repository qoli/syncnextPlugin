'use strict';

const COVER_LIST_ERROR =
  '封面列表為空：站點頁面結構可能變更，或目前返回了非預期內容。';
const EPISODE_EMPTYVIEW_ERROR =
  '劇集列表為空：插件主動回報 emptyView，用於測試劇集錯誤頁。';
const PLAYER_EMPTYVIEW_ERROR =
  '播放器地址為空：插件主動回報 emptyView，用於測試播放器錯誤提示。';
const PLAYER_CANDIDATES_ERROR =
  '播放器候選地址全部失效：用於測試候選地址回退失敗。';

const SCENARIOS = [
  {
    id: 'cover-carry-over',
    title: '首頁錯誤殘留檢查',
    descriptionText:
      '首頁保留 coverList 錯誤，但詳情頁仍返回 1 集，用來驗證錯誤不會串場到結果頁。',
    detailURLString: 'syncnext://plugin_error_regression/detail/cover-carry-over',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/9O1Iy9od7uA6h2hT3h4L7mD8l0L.jpg',
  },
  {
    id: 'episodes-emptyview',
    title: '劇集 emptyView',
    descriptionText:
      '點進後劇集列表不返回任何項目，並主動回報 emptyView。',
    detailURLString: 'syncnext://plugin_error_regression/detail/episodes-emptyview',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/u8q1P7dF7V1fxYw0M3g7xq4k6Yf.jpg',
  },
  {
    id: 'episodes-empty-array',
    title: '劇集空陣列',
    descriptionText:
      '點進後劇集列表直接返回空陣列，不附帶 emptyView，測試通用空白頁。',
    detailURLString: 'syncnext://plugin_error_regression/detail/episodes-empty-array',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg',
  },
  {
    id: 'player-invalid-url',
    title: '播放器失效地址',
    descriptionText:
      '劇集可進入，播放器返回一個失效的 m3u8 地址，用於測試播放器錯誤頁。',
    detailURLString: 'syncnext://plugin_error_regression/detail/player-invalid-url',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/6MKr3KgOLmzOP6MSuZERO41Lpkt.jpg',
  },
  {
    id: 'player-emptyview',
    title: '播放器 emptyView',
    descriptionText:
      '劇集可進入，播放器階段主動回報 emptyView，不返回可播放地址。',
    detailURLString: 'syncnext://plugin_error_regression/detail/player-emptyview',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
  },
  {
    id: 'player-candidates-fail',
    title: '候選播放全部失敗',
    descriptionText:
      '劇集可進入，播放器返回多個候選地址但全部失效，用於測試候選播放回退。',
    detailURLString: 'syncnext://plugin_error_regression/detail/player-candidates-fail',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
  },
  {
    id: 'player-empty-url',
    title: '播放器空字串',
    descriptionText:
      '劇集可進入，播放器直接返回空字串，用於測試未取得播放地址。',
    detailURLString: 'syncnext://plugin_error_regression/detail/player-empty-url',
    coverURLString:
      'https://image.tmdb.org/t/p/w500/yF1eOkaYvwiORauRCPWznV9xVvi.jpg',
  },
];

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

function buildPlayerCandidate(url) {
  return {
    url: url,
    headers: {},
  };
}

function getScenarioByURL(rawURL) {
  return (
    SCENARIOS.find((scenario) => rawURL && rawURL.indexOf('/' + scenario.id) !== -1) ||
    SCENARIOS[0]
  );
}

function buildScenarioMedias(prefix) {
  return SCENARIOS.map((scenario, index) =>
    buildMediaData(
      prefix + '-' + scenario.id + '-' + index,
      scenario.coverURLString,
      scenario.title,
      scenario.descriptionText,
      scenario.detailURLString
    )
  );
}

function buildMedias(listURL, key) {
  console.log('[plugin_error_regression] buildMedias', listURL, key);

  $next.emptyView(COVER_LIST_ERROR);
  $next.toMedias(JSON.stringify(buildScenarioMedias('index')), key);
}

function buildSearchMedias(searchURL, key) {
  console.log('[plugin_error_regression] buildSearchMedias', searchURL, key);

  $next.emptyView(COVER_LIST_ERROR);
  $next.toSearchMedias(JSON.stringify(buildScenarioMedias('search')), key);
}

function Episodes(detailURL) {
  console.log('[plugin_error_regression] Episodes', detailURL);
  const scenario = getScenarioByURL(detailURL);

  if (scenario.id === 'episodes-emptyview') {
    $next.emptyView(EPISODE_EMPTYVIEW_ERROR);
    $next.toEpisodes(JSON.stringify([]));
    return;
  }

  if (scenario.id === 'episodes-empty-array') {
    $next.toEpisodes(JSON.stringify([]));
    return;
  }

  const episodes = [
    buildEpisodeData(
      'episode-' + scenario.id + '-1',
      '第 1 集',
      'syncnext://plugin_error_regression/play/' + scenario.id
    ),
  ];

  $next.toEpisodes(JSON.stringify(episodes));
}

function Player(episodeURL) {
  console.log('[plugin_error_regression] Player', episodeURL);
  const scenario = getScenarioByURL(episodeURL);

  if (scenario.id === 'player-emptyview') {
    $next.emptyView(PLAYER_EMPTYVIEW_ERROR);
    return;
  }

  if (scenario.id === 'player-candidates-fail') {
    if (typeof $next.toPlayerCandidates === 'function') {
      $next.toPlayerCandidates(
        JSON.stringify([
          buildPlayerCandidate('https://example.invalid/plugin_error_regression/candidate-1.m3u8'),
          buildPlayerCandidate('https://example.invalid/plugin_error_regression/candidate-2.m3u8'),
        ])
      );
      return;
    }

    $next.emptyView(PLAYER_CANDIDATES_ERROR);
    return;
  }

  if (scenario.id === 'player-empty-url' || scenario.id === 'cover-carry-over') {
    $next.toPlayer('');
    return;
  }

  if (scenario.id === 'player-invalid-url') {
    $next.toPlayer('https://example.invalid/plugin_error_regression/playlist.m3u8');
    return;
  }

  $next.toPlayer('');
}
