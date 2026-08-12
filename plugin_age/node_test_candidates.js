#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_TIMEOUT_MS = 90000;
const RESOLVER_ONLY = process.argv.includes('--resolver-only');
const ROOT = path.resolve(__dirname, '..');
const FILES = [
  path.join(__dirname, 'app.js'),
];

const CASES = [
  {
    detailURL: 'https://ageapi.omwjhz.com:18888/v2/detail/20240215',
    expectedEpisodes: 21,
    episodeIndex: 20,
    expectedSources: 6,
  },
  {
    detailURL: 'https://ageapi.omwjhz.com:18888/v2/detail/20220528',
    expectedEpisodes: 1,
    episodeIndex: 1,
    expectedSources: 2,
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function headersToObject(headers) {
  const out = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

async function doHTTP(req, methodOverride) {
  const request = req && typeof req === 'object' ? req : {};
  const url = String(request.url || '').trim();
  if (!url) {
    throw new Error('$http.fetch missing req.url');
  }

  const method = String(methodOverride || request.method || 'GET').toUpperCase();
  const headers = Object.assign({}, request.headers || {});
  const options = {
    method,
    headers,
    redirect: 'follow',
  };

  if (method !== 'GET' && method !== 'HEAD' && request.body != null) {
    options.body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
  }

  const response = await fetch(url, options);
  const body = method === 'HEAD' ? '' : await response.text();
  return {
    status: response.status,
    statusCode: response.status,
    headers: headersToObject(response.headers),
    body,
    url: response.url,
  };
}

function normalizeCandidates(payload) {
  const parsed =
    typeof payload === 'string'
      ? JSON.parse(payload)
      : (payload && typeof payload === 'object' ? payload : []);
  const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.candidates) ? parsed.candidates : []);
  return list.map((item) => ({
    url: String(item && item.url || '').trim(),
    headers: item && item.headers && typeof item.headers === 'object' ? item.headers : {},
  })).filter((item) => item.url);
}

function createRuntime() {
  const state = {
    pending: null,
  };

  const context = {
    console,
    Buffer,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    atob: (input) => Buffer.from(String(input || ''), 'base64').toString('binary'),
    btoa: (input) => Buffer.from(String(input || ''), 'binary').toString('base64'),
    $http: {
      fetch: (req) => doHTTP(req, null),
      head: (req) => doHTTP(req, 'HEAD'),
    },
    $next: {
      toMedias: (payload, key) => onCallback('toMedias', payload, key),
      toSearchMedias: (payload, key) => onCallback('toSearchMedias', payload, key),
      toEpisodes: (payload, key) => onCallback('toEpisodes', payload, key),
      toEpisodesCandidates: (payload, key) => onCallback('toEpisodesCandidates', payload, key),
      toPlayer: (payload, key) => onCallback('toPlayer', payload, key),
      toPlayerByJSON: (payload, key) => onCallback('toPlayerByJSON', payload, key),
      toPlayerCandidates: (payload, key) => onCallback('toPlayerCandidates', payload, key),
      emptyView: (message) => {
        if (!state.pending) return;
        const pending = state.pending;
        clearTimeout(pending.timer);
        state.pending = null;
        pending.reject(new Error(`emptyView: ${String(message || '')}`));
      },
      aliLink: () => {},
      aliPlay: () => {},
    },
  };

  function onCallback(type, payload, key) {
    if (!state.pending) return;
    if (!state.pending.expected.has(type)) return;
    const pending = state.pending;
    clearTimeout(pending.timer);
    state.pending = null;
    pending.resolve({ callbackType: type, payload, key });
  }

  context.window = context;
  context.global = context;
  context.self = context;

  vm.createContext(context);
  for (const filePath of FILES) {
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(code, context, {
      filename: path.relative(ROOT, filePath),
      timeout: 8000,
    });
  }

  async function invoke(fnName, args, expectedTypes, timeoutMs) {
    const fn = context[fnName];
    if (typeof fn !== 'function') {
      throw new Error(`function not found: ${fnName}`);
    }

    return await new Promise((resolve, reject) => {
      state.pending = {
        expected: new Set(expectedTypes),
        resolve,
        reject,
        timer: setTimeout(() => {
          state.pending = null;
          reject(new Error(`callback timeout (${fnName})`));
        }, timeoutMs || DEFAULT_TIMEOUT_MS),
      };

      try {
        const ret = fn.apply(context, args || []);
        if (ret && typeof ret.then === 'function') {
          ret.catch((error) => {
            if (!state.pending) return;
            const pending = state.pending;
            clearTimeout(pending.timer);
            state.pending = null;
            pending.reject(error);
          });
        }
      } catch (error) {
        const pending = state.pending;
        clearTimeout(pending.timer);
        state.pending = null;
        reject(error);
      }
    });
  }

  return { context, invoke };
}

async function runEpisodesCase(runtime, testCase) {
  const episodesResult = await runtime.invoke(
    'Episodes',
    [testCase.detailURL],
    ['toEpisodes'],
    DEFAULT_TIMEOUT_MS
  );
  const episodes = JSON.parse(episodesResult.payload);

  assert(
    Array.isArray(episodes) && episodes.length === testCase.expectedEpisodes,
    `${testCase.detailURL} expected ${testCase.expectedEpisodes} episodes, got ${episodes.length}`
  );

  const episode = episodes[testCase.episodeIndex - 1];
  assert(episode, `${testCase.detailURL} missing aligned episode ${testCase.episodeIndex}`);

  const payload = runtime.context.parseEpisodePayload(episode.episodeDetailURL);
  assert(payload, `${testCase.detailURL} episode payload missing`);
  assert(
    Array.isArray(payload.candidates) && payload.candidates.length === testCase.expectedSources,
    `${testCase.detailURL} episode ${testCase.episodeIndex} expected ${testCase.expectedSources} sources, got ${payload.candidates && payload.candidates.length}`
  );

  const playerResult = await runtime.invoke(
    'Player',
    [episode.episodeDetailURL],
    ['toPlayerCandidates', 'toPlayerByJSON', 'toPlayer'],
    DEFAULT_TIMEOUT_MS
  );

  assert(
    playerResult.callbackType === 'toPlayerCandidates',
    `${testCase.detailURL} episode ${testCase.episodeIndex} expected toPlayerCandidates, got ${playerResult.callbackType}`
  );

  const candidates = normalizeCandidates(playerResult.payload);
  assert(
    candidates.length === testCase.expectedSources,
    `${testCase.detailURL} episode ${testCase.episodeIndex} expected ${testCase.expectedSources} play candidates, got ${candidates.length}`
  );

  const resolverURLs = new Set(payload.candidates.map((item) => String(item && item.resolverURL || '').trim()));
  const seen = new Set();
  for (const candidate of candidates) {
    assert(/^https?:\/\//i.test(candidate.url), `invalid candidate url: ${candidate.url}`);
    assert(!resolverURLs.has(candidate.url), `resolver page escaped as a media candidate: ${candidate.url}`);
    assert(!seen.has(candidate.url), `duplicate candidate url: ${candidate.url}`);
    seen.add(candidate.url);
  }

  console.log(
    `[OK] ${testCase.detailURL} ep=${testCase.episodeIndex} episodes=${episodes.length} sources=${payload.candidates.length} candidates=${candidates.length}`
  );
}

async function runLegacyPayloadCase(runtime) {
  const response = await doHTTP({ url: 'https://ageapi.omwjhz.com:18888/v2/detail/20220528' });
  const detail = JSON.parse(response.body);
  const lineEpisodes = detail && detail.video && detail.video.playlists ? detail.video.playlists.hnm3u8 : null;
  assert(Array.isArray(lineEpisodes) && lineEpisodes.length > 0, 'legacy payload fixture missing hnm3u8');

  const oldPayload = 'age-payload:' + encodeURIComponent(JSON.stringify({
    resolverURL: runtime.context.buildResolverURL('hnm3u8', lineEpisodes[0][1], detail),
  }));

  const playerResult = await runtime.invoke(
    'Player',
    [oldPayload],
    ['toPlayerCandidates', 'toPlayerByJSON', 'toPlayer'],
    DEFAULT_TIMEOUT_MS
  );

  assert(
    playerResult.callbackType === 'toPlayerCandidates',
    `legacy payload expected toPlayerCandidates, got ${playerResult.callbackType}`
  );

  const candidates = normalizeCandidates(playerResult.payload);
  assert(candidates.length >= 1, 'legacy payload returned no playable candidates');
  console.log(`[OK] legacy payload candidates=${candidates.length}`);
}

async function runJavaScriptCoreResolverCase(runtime) {
  const resolverURL = 'https://resolver.example:8443/m3u8/?url=age_fixture';
  const mediaURL = 'https://media.example/video/index.m3u8';
  const originalFetch = runtime.context.$http.fetch;

  runtime.context.$http.fetch = async (request) => {
    assert(request && request.url === resolverURL, 'resolver fixture received an unexpected request');
    return {
      status: 200,
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: `<script>var Vurl = '${mediaURL}';</script>`,
      url: resolverURL,
    };
  };

  try {
    const episodeURL = runtime.context.buildEpisodePayload({
      candidates: [{ source: 'fixture', resolverURL }],
    });
    const playerResult = await runtime.invoke(
      'Player',
      [episodeURL],
      ['toPlayerCandidates', 'toPlayerByJSON', 'toPlayer'],
      5000
    );
    const candidates = normalizeCandidates(playerResult.payload);

    assert(playerResult.callbackType === 'toPlayerCandidates', 'resolver fixture used the wrong callback');
    assert(candidates.length === 1, `resolver fixture expected 1 candidate, got ${candidates.length}`);
    assert(candidates[0].url === mediaURL, 'resolver HTML escaped instead of its media URL');
    assert(candidates[0].headers.Referer === resolverURL, 'resolved media lost its resolver Referer');
  } finally {
    runtime.context.$http.fetch = originalFetch;
  }

  console.log('[OK] JavaScriptCore-compatible resolver extraction');
}

async function main() {
  const runtime = createRuntime();

  assert(
    typeof runtime.context.URL === 'undefined',
    'fixture must match the App JavaScriptCore environment without WHATWG URL globals'
  );
  assert(
    runtime.context.isResolverURL('https://resolver.example:8443/m3u8/?url=age_fixture'),
    'AGE resolver recognition must follow the provider reference contract rather than one host'
  );
  assert(
    runtime.context.isResolverURL('https://resolver.example:8443/vip/?line=1&url=age_fixture'),
    'AGE resolver recognition must accept the provider reference outside the first query position'
  );
  assert(
    !runtime.context.isResolverURL('https://resolver.example:8443/m3u8/?url=unrelated_fixture'),
    'non-AGE resolver references must not be accepted'
  );
  assert(
    !runtime.context.isResolverURL('https://media.example/video/index.m3u8'),
    'direct media playlists must not be treated as resolver pages'
  );

  await runJavaScriptCoreResolverCase(runtime);
  if (RESOLVER_ONLY) {
    console.log('[DONE] plugin_age resolver regression passed');
    return;
  }

  for (const testCase of CASES) {
    await runEpisodesCase(runtime, testCase);
  }

  await runLegacyPayloadCase(runtime);
  console.log('[DONE] plugin_age candidate regression passed');
}

main().catch((error) => {
  console.error('[FAIL]', error && error.message ? error.message : error);
  process.exitCode = 1;
});
