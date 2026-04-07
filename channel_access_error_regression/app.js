'use strict';

const TARGET_HOST = 'https://www.youknow.tv';

function log(prefix, value) {
  console.log('[channel_access_error_regression]', prefix, value || '');
}

function htmlTitle(input) {
  const html = String(input || '');
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match && match[1] ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function firstMeaningfulLine(input) {
  const text = String(input || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 160);
}

function containsChallengeMarkers(input) {
  const text = String(input || '');
  return /cloudflare|attention required|you have been blocked|cf-wrapper/i.test(text);
}

function emptyMediasJSON() {
  return JSON.stringify([]);
}

function buildMedias(listURL, key) {
  const req = {
    url: listURL || TARGET_HOST + '/label/new/',
    method: 'GET',
  };

  log('buildMedias.request', req.url);

  $http.fetch(req).then(
    function (res) {
      const body = String((res && res.body) || '');
      const statusCode = Number((res && res.statusCode) || 0);
      const title = htmlTitle(body);
      const summary = firstMeaningfulLine(body);

      log('buildMedias.statusCode', statusCode);
      log('buildMedias.title', title || 'title-empty');
      log('buildMedias.challenge', containsChallengeMarkers(body) ? 'true' : 'false');
      log('buildMedias.summary', summary || 'summary-empty');

      $next.toMedias(emptyMediasJSON(), key);
    },
    function (err) {
      log('buildMedias.error', String(err || 'unknown error'));
      $next.toMedias(emptyMediasJSON(), key);
    }
  );
}

function buildSearchMedias(searchURL, key) {
  log('buildSearchMedias', searchURL || TARGET_HOST);
  $next.toSearchMedias(emptyMediasJSON(), key);
}

function Episodes(detailURL) {
  log('Episodes', detailURL || '');
  $next.toEpisodes(emptyMediasJSON());
}

function Player(episodeURL) {
  log('Player', episodeURL || '');
  $next.toPlayer('');
}
