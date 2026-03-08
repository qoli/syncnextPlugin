'use strict';

const COVER_LIST_ERROR =
  '封面列表為空：站點頁面結構可能變更，或目前返回了非預期內容。';

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

function buildMedias(listURL, key) {
  console.log('[plugin_error_regression] buildMedias', listURL, key);

  const medias = [
    buildMediaData(
      'error-regression-media',
      'https://image.tmdb.org/t/p/w500/9O1Iy9od7uA6h2hT3h4L7mD8l0L.jpg',
      '錯誤回歸測試項目',
      '可進入 UniversalResultView，並保留 coverList 錯誤以驗證是否被錯誤顯示。',
      'syncnext://plugin_error_regression/detail'
    ),
  ];

  $next.emptyView(COVER_LIST_ERROR);
  $next.toMedias(JSON.stringify(medias), key);
}

function buildSearchMedias(searchURL, key) {
  console.log('[plugin_error_regression] buildSearchMedias', searchURL, key);
  const medias = [
    buildMediaData(
      'error-regression-search',
      'https://image.tmdb.org/t/p/w500/9O1Iy9od7uA6h2hT3h4L7mD8l0L.jpg',
      '搜尋錯誤回歸測試項目',
      '搜尋結果同樣保留 coverList 錯誤。',
      'syncnext://plugin_error_regression/search-detail'
    ),
  ];

  $next.emptyView(COVER_LIST_ERROR);
  $next.toSearchMedias(JSON.stringify(medias), key);
}

function Episodes(detailURL) {
  console.log('[plugin_error_regression] Episodes', detailURL);
  const episodes = [
    buildEpisodeData(
      'error-regression-episode-1',
      '第 1 集',
      'syncnext://plugin_error_regression/play/1'
    ),
  ];

  $next.toEpisodes(JSON.stringify(episodes));
}

function Player(episodeURL) {
  console.log('[plugin_error_regression] Player', episodeURL);
  $next.toPlayer('');
}
