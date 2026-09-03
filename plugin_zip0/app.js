'user script';

// ZIP0 (https://zip0.com) 聚合影视站点插件。
// - 列表/分类页为服务端渲染，直接解析 .video-card。
// - 搜索为 TanStack Start server function（seroval 协议），逐线路串行查询后合并。
// - /watch 页内嵌 $tsr 数据，包含全部剧集的直连 m3u8。

const BASE_URL =
  typeof __syncnextPrimaryHost === 'string' && __syncnextPrimaryHost
    ? __syncnextPrimaryHost.replace(/\/$/, '')
    : 'https://zip0.com';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';

// /assets/video.functions-*.js 中导出 o 对应的 server function id（搜索）。
// 站点重新构建后该 id 可能变化，需要重新抓取。
const SEARCH_FN_ID = '924908a6328d92c97055b1d048defe7b4f8102dee6907ac36be30470204c7535';

// /search 页 loader 返回的线路目录（source -> 线路名）。
const SEARCH_SOURCES = [
  ['dyttzy', '线路 1'],
  ['ruyi', '线路 2'],
  ['bfzy', '线路 3'],
  ['ffzy', '线路 4'],
  ['zy360', '线路 5'],
  ['jisu', '线路 6'],
  ['mdzy', '线路 7'],
  ['zuid', '线路 8'],
  ['ikun', '线路 9'],
  ['lzi', '线路 10'],
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
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
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
    new RegExp('\\b' + name + '\\s*=\\s*(["\'])([\\s\\S]*?)\\1', 'i')
  );
  return match && match[2] ? decodeEntities(match[2]).trim() : '';
}

function pageHeaders() {
  return {
    Referer: BASE_URL + '/',
    'User-Agent': USER_AGENT,
  };
}

// zip0 的 serverFn 端点被 Cloudflare 规则保护，缺少浏览器 sec-fetch 头会 403。
function serverFnHeaders() {
  return {
    Referer: BASE_URL + '/search',
    'User-Agent': USER_AGENT,
    'x-tsr-serverFn': 'true',
    accept: 'application/x-tss-framed, application/x-ndjson, application/json',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
  };
}

function fetchHTML(url, onSuccess, onFailure) {
  $http.fetch({
    url: url,
    method: 'GET',
    headers: pageHeaders(),
  }).then(function (res) {
    const status = Number((res && res.statusCode) || 0);
    const body = String((res && res.body) || '');
    if (status < 200 || status >= 400 || !body) {
      onFailure('网页请求失败');
      return;
    }
    onSuccess(body);
  }).catch(function (error) {
    onFailure(String(error || '网页请求失败'));
  });
}

function HostsProbeRequest() {
  return {
    url: BASE_URL + '/category/movie',
    method: 'GET',
    headers: pageHeaders(),
    accept: {
      statusCodes: [200],
      bodyIncludesAny: ['video-card', '/watch?source='],
      bodyExcludesAny: ['Just a moment', 'captcha', '访问验证'],
      titleExcludesAny: ['Just a moment', '403 Forbidden'],
    },
  };
}

// ---------- 列表页解析 ----------

function parseMedias(html) {
  const datas = [];
  const seen = {};
  const card = /<article\b[^>]*class\s*=\s*"[^"]*\bvideo-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  let matched;

  while ((matched = card.exec(html)) !== null) {
    const body = matched[1];
    const link = body.match(/<a\b[^>]*href\s*=\s*"([^"]*\/watch\?source=[^"]+)"[^>]*class\s*=\s*"video-card__poster-link"/i)
      || body.match(/<a\b[^>]*class\s*=\s*"video-card__poster-link"[^>]*href\s*=\s*"([^"]+)"/i)
      || body.match(/href\s*=\s*"([^"]*\/watch\?source=[^"]+)"/i);
    if (!link) continue;

    const href = buildURL(decodeEntities(link[1]));
    if (seen[href]) continue;

    const img = body.match(/<img\b[^>]*class\s*=\s*"video-card__poster"[^>]*>/i);
    const cover = img ? buildURL(getAttribute(img[0], 'src')) : '';

    const titleMatch = body.match(/<a\b[^>]*class\s*=\s*"video-card__title"[^>]*>([\s\S]*?)<\/a>/i);
    const title = titleMatch ? stripTags(titleMatch[1]) : '';
    if (!title) continue;

    const remarksMatch = body.match(/<span\b[^>]*class\s*=\s*"video-card__remarks"[^>]*>([\s\S]*?)<\/span>/i);
    const remarks = remarksMatch ? stripTags(remarksMatch[1]) : '';
    const metaMatch = body.match(/<div\b[^>]*class\s*=\s*"video-card__meta"[^>]*>([\s\S]*?)<\/div>/i);
    // meta 內以 <i></i> 分隔年份與類型，轉為可讀分隔符。
    const meta = metaMatch
      ? stripTags(metaMatch[1].replace(/<i\b[^>]*>[\s\S]*?<\/i>/gi, ' · '))
      : '';
    const description = remarks && meta ? remarks + ' · ' + meta : remarks || meta;

    seen[href] = true;
    datas.push(buildMediaData(href, cover, title, description, href));
  }

  return datas;
}

function buildMedias(inputURL, key) {
  fetchHTML(inputURL, function (html) {
    $next.toMedias(JSON.stringify(parseMedias(html)), key);
  }, function () {
    $next.emptyView('影片列表请求失败');
  });
}

// ---------- 搜索（seroval server function） ----------

function escapeSerovalString(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// 手工构造 {data:{query,source}} 的 seroval cross-reference payload。
function buildSearchPayload(query, source) {
  return (
    '{"t":{"t":10,"i":0,"p":{"k":["data"],"v":[{"t":10,"i":1,"p":{"k":["query","source"],"v":[' +
    '{"t":1,"i":2,"s":"' + escapeSerovalString(query) + '"},' +
    '{"t":1,"i":3,"s":"' + escapeSerovalString(source) + '"}' +
    ']}}]}},"f":127,"m":[]}'
  );
}

// seroval 响应的最小反序列化子集：number/string/常量/数组/对象/引用。
function parseSeroval(root) {
  const refs = {};
  const consts = { 0: null, 1: null, 2: true, 3: false };

  function unescapeString(value) {
    return String(value)
      .replace(/\\x3C/g, '<')
      .replace(/\\u2028/g, ' ')
      .replace(/\\u2029/g, ' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  function read(node) {
    if (!node || typeof node !== 'object') return null;
    let value = null;
    switch (node.t) {
      case 0:
        value = Number(node.s);
        break;
      case 1:
        value = unescapeString(node.s);
        break;
      case 2:
        value = consts.hasOwnProperty(node.s) ? consts[node.s] : null;
        break;
      case 4:
        return refs.hasOwnProperty(node.i) ? refs[node.i] : null;
      case 9: {
        value = [];
        const list = node.a || [];
        for (let i = 0; i < list.length; i++) value.push(read(list[i]));
        break;
      }
      case 10:
      case 11: {
        value = {};
        const keys = (node.p && node.p.k) || [];
        const values = (node.p && node.p.v) || [];
        for (let i = 0; i < keys.length; i++) value[unescapeString(keys[i])] = read(values[i]);
        break;
      }
      default:
        return null;
    }
    if (typeof node.i === 'number') refs[node.i] = value;
    return value;
  }

  return read(root);
}

function searchSource(query, source, sourceName, onSuccess, onFailure) {
  const payload = buildSearchPayload(query, source);
  const url = BASE_URL + '/_serverFn/' + SEARCH_FN_ID + '?payload=' + encodeURIComponent(payload);
  $http.fetch({
    url: url,
    method: 'GET',
    headers: serverFnHeaders(),
  }).then(function (res) {
    const status = Number((res && res.statusCode) || 0);
    if (status < 200 || status >= 400) {
      onFailure('线路请求失败');
      return;
    }
    const body = String((res && res.body) || '');
    let parsed = null;
    try {
      parsed = parseSeroval(JSON.parse(body));
    } catch (_) {
      onFailure('线路响应格式错误');
      return;
    }
    const result = parsed && parsed.result;
    if (!result || parsed.error || !Array.isArray(result.items)) {
      onFailure('线路响应格式错误');
      return;
    }
    const items = result.items;
    const medias = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i] || {};
      if (!item.id || !item.title) continue;
      const detail = BASE_URL + '/watch?source=' + encodeURIComponent(source) +
        '&id=' + encodeURIComponent(item.id) + '&episode=1';
      const meta = [item.remarks, item.year, item.category]
        .filter(function (part) { return !!part; })
        .join(' · ');
      medias.push(buildMediaData(
        detail,
        buildURL(item.poster),
        String(item.title),
        (item.sourceName || sourceName) + (meta ? ' · ' + meta : ''),
        detail
      ));
    }
    onSuccess(medias);
  }).catch(function (error) {
    onFailure(String(error || '线路请求失败'));
  });
}

function extractSearchKeyword(inputURL) {
  const match = String(inputURL || '').match(/[?&]q=([^&]*)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  } catch (_) {
    return match[1];
  }
}

function Search(inputURL, key) {
  const query = extractSearchKeyword(inputURL);
  if (!query) {
    $next.toSearchMedias(JSON.stringify([]), key);
    return;
  }

  const all = [];
  const seen = {};
  let index = 0;

  function finish() {
    $next.toSearchMedias(JSON.stringify(all), key);
  }

  function next() {
    if (index >= SEARCH_SOURCES.length) {
      finish();
      return;
    }
    const entry = SEARCH_SOURCES[index];
    index += 1;
    searchSource(query, entry[0], entry[1], function (medias) {
      for (let i = 0; i < medias.length; i++) {
        const media = medias[i];
        if (seen[media.id]) continue;
        seen[media.id] = true;
        all.push(media);
      }
      next();
    }, function () {
      $next.emptyView('搜索' + entry[1] + '请求失败');
    });
  }

  next();
}

// ---------- 剧集（/watch 页 $tsr 数据） ----------

function unescapeScriptString(value) {
  return String(value || '')
    .replace(/\\x3C/gi, '<')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

function parseEpisodes(html) {
  const source = String(html || '');
  const datas = [];
  const seen = {};

  // 剧集数据形如 episodes:$R[16]=[$R[17]={name:"第1集",url:"https://.../index.m3u8"},...]
  const block = source.match(/episodes:\s*\$R\[\d+\]\s*=\s*\[([\s\S]*?)\]\s*\}/);
  const segment = block ? block[1] : source;
  const pair = /\{name:"((?:[^"\\]|\\.)*)",url:"((?:[^"\\]|\\.)*)"\}/g;
  let matched;

  while ((matched = pair.exec(segment)) !== null) {
    const name = unescapeScriptString(matched[1]).trim() || '播放';
    const url = unescapeScriptString(matched[2]).trim();
    if (!/^https?:\/\//i.test(url) || seen[url]) continue;
    seen[url] = true;
    datas.push(buildEpisodeData(url, name, url));
  }

  return datas;
}

function Episodes(detailURL) {
  fetchHTML(detailURL, function (html) {
    const episodes = parseEpisodes(html);
    if (episodes.length === 0) {
      $next.emptyView('未找到该剧集的播放地址');
      return;
    }
    $next.toEpisodes(JSON.stringify(episodes));
  }, function () {
    $next.emptyView('剧集页面请求失败');
  });
}

// ---------- 播放 ----------

function isDirectMediaURL(url) {
  return /\.(m3u8|mp4)(\?|#|$)/i.test(String(url || ''));
}

function emitPlayer(playURL, referer) {
  const payload = {
    url: playURL,
    headers: {
      Referer: referer || BASE_URL + '/',
      'User-Agent': USER_AGENT,
    },
  };
  if (typeof $next.toPlayerCandidates === 'function') {
    // 部分 CDN 对 HEAD 返回 502、GET 则正常，使用 App 的标准候选交接。
    $next.toPlayerCandidates(JSON.stringify([payload]));
    return;
  }
  $next.emptyView('当前版本不支持候选播放');
}

function Player(episodeURL) {
  // Episodes 已输出直连 m3u8，正常情况直接回传。
  if (isDirectMediaURL(episodeURL)) {
    emitPlayer(episodeURL, BASE_URL + '/');
    return;
  }

  $next.emptyView('播放地址不是直连媒体');
}
