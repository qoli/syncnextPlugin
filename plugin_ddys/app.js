`user script`;

var DDYS_HOST = 'https://ddys.app';
var DDYS_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
var CHALLENGE_API = DDYS_HOST + '/wp-json/ddys-protect/v1/gatecha/challenge';
var GATE_PAGE_URL = DDYS_HOST + '/';
var COOKIE_POOL_URL = 'https://raw.githubusercontent.com/qoli/syncnextPlugin/main/plugin_ddys/cookie.json';
var COOKIE_POOL_SCHEMA_VERSION = 1;
var COOKIE_POOL_MAX_ENTRIES = 10;

var bypassingGate = false;
var bypassQueue = [];

// ── helpers ─────────────────────────────────────────────────

function buildRequest(url, referer) {
  return {
    url: url,
    method: 'GET',
    headers: {
      'User-Agent': DDYS_UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: referer || DDYS_HOST + '/',
    },
  };
}

function normalizeURL(href) {
  return buildURL(href, DDYS_HOST);
}

// ── gate detection ──────────────────────────────────────────

function isGatePage(html) {
  if (!html || typeof html !== 'string') {
    return false;
  }
  return (
    html.indexOf('ddys-protect-gate') >= 0 ||
    html.indexOf('ddys_protect_password') >= 0 ||
    html.indexOf('ddys_protect_altcha_gate') >= 0
  );
}

function isWPBlocked(html) {
  if (!html || typeof html !== 'string') {
    return false;
  }
  return html.indexOf('ddys_protect_rest_blocked') >= 0;
}

// ── externally verified cookie pool ─────────────────────────

function parseCookiePool(jsonText, nowMilliseconds) {
  var pool;
  try {
    pool = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('DDYS cookie pool is not valid JSON');
  }
  if (!pool || pool.schemaVersion !== COOKIE_POOL_SCHEMA_VERSION || !Array.isArray(pool.cookies)) {
    throw new Error('DDYS cookie pool schema is invalid');
  }
  if (pool.cookies.length > COOKIE_POOL_MAX_ENTRIES) {
    throw new Error('DDYS cookie pool exceeds ' + COOKIE_POOL_MAX_ENTRIES + ' entries');
  }

  var active = [];
  pool.cookies.forEach(function (entry) {
    var addedAt = entry && Date.parse(entry.addedAt);
    var validUntil = entry && Date.parse(entry.validUntil);
    var cookie = entry && entry.cookie;
    if (
      typeof cookie !== 'string' ||
      cookie.trim() === '' ||
      cookie.indexOf('ddys_protect_') < 0 ||
      /[\r\n]/.test(cookie) ||
      !Number.isFinite(addedAt) ||
      !Number.isFinite(validUntil) ||
      addedAt >= validUntil
    ) {
      throw new Error('DDYS cookie pool contains a malformed entry');
    }
    if (validUntil > nowMilliseconds) {
      active.push(entry);
    }
  });
  return active;
}

function selectRandomValidCookie(jsonText, nowMilliseconds, randomValue) {
  var active = parseCookiePool(jsonText, nowMilliseconds);
  if (active.length === 0) {
    throw new Error('DDYS cookie pool contains no valid cookie');
  }
  var random = Number(randomValue);
  if (!Number.isFinite(random) || random < 0 || random >= 1) {
    throw new Error('DDYS cookie selection random value is invalid');
  }
  return active[Math.floor(random * active.length)];
}

function loadRandomValidCookie(callback) {
  $http.fetch({
    url: COOKIE_POOL_URL + '?_=' + String(Date.now()),
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'User-Agent': DDYS_UA,
    },
  }).then(function (response) {
    try {
      callback(
        selectRandomValidCookie(response.body, Date.now(), Math.random()),
        null
      );
    } catch (error) {
      callback(null, error.message || String(error));
    }
  }).catch(function (error) {
    callback(null, 'DDYS cookie pool request failed: ' + String(error));
  });
}

// ── ALTCHA PoW solver ───────────────────────────────────────

function solveAltcha(challengeData) {
  if (
    !challengeData ||
    challengeData.algorithm !== 'SHA-256' ||
    typeof challengeData.challenge !== 'string' ||
    typeof challengeData.salt !== 'string'
  ) {
    throw new Error('ALTCHA challenge is malformed');
  }

  var maximum = Number(challengeData.maxNumber);
  if (!Number.isInteger(maximum) || maximum < 0) {
    throw new Error('ALTCHA maxNumber is malformed');
  }

  for (var number = 0; number <= maximum; number++) {
    var candidate = CryptoJS.SHA256(challengeData.salt + String(number)).toString();
    if (candidate === challengeData.challenge) {
      return number;
    }
  }

  throw new Error('ALTCHA solution was not found within maxNumber');
}

// ── gate field extraction ───────────────────────────────────

function extractGateFields(html) {
  var fields = {};

  var nonceMatch = html.match(/"nonce"\s*:\s*"([^"]+)"/);
  fields.ajaxNonce = nonceMatch ? nonceMatch[1] : '';

  var tokenMatch = html.match(/ddys_protect_captcha_token[^"]*"([^"]+)"/);
  fields.captchaToken = tokenMatch ? tokenMatch[1] : '';

  var fnMatch = html.match(/name="ddys_protect_nonce"[^>]*value="([^"]+)"/);
  fields.formNonce = fnMatch ? fnMatch[1] : '';

  var stMatch = html.match(/name="ddys_protect_started"[^>]*value="(\d+)"/);
  fields.started = stMatch ? stMatch[1] : '';

  var sgMatch = html.match(/name="ddys_protect_started_sig"[^>]*value="([^"]+)"/);
  fields.startedSig = sgMatch ? sgMatch[1] : '';

  var hintMatch = html.match(/<img class="ddys-protect-click-prompt-image" src="data:image\/png;base64,([^"]+)"/);
  fields.hintImage = hintMatch ? hintMatch[1] : '';

  var chalMatch = html.match(/<img src="data:image\/png;base64,([^"]+)"[^>]*data-ddys-click-image/);
  fields.challengeImage = chalMatch ? chalMatch[1] : '';

  return fields;
}

// ── click captcha OCR ───────────────────────────────────────

var HINT_IMG_W = 172;
var HINT_IMG_H = 44;
var CHALLENGE_IMG_W = 320;
var CHALLENGE_IMG_H = 150;

function matchHintPositions(hintChars, challengeObservations) {
  var points = [];
  var usedObs = {};

  hintChars.forEach(function (hintChar) {
    var bestItem = null;
    for (var j = 0; j < challengeObservations.length; j++) {
      if (usedObs[j]) {
        continue;
      }
      var item = challengeObservations[j];
      if (
        item.text === hintChar &&
        item.bbox &&
        Number.isFinite(item.bbox.x) &&
        Number.isFinite(item.bbox.y) &&
        Number.isFinite(item.bbox.w) &&
        Number.isFinite(item.bbox.h)
      ) {
        usedObs[j] = true;
        bestItem = item;
        break;
      }
    }
    if (bestItem) {
      points.push({
        x: Math.round(bestItem.bbox.x + bestItem.bbox.w / 2),
        y: Math.round(bestItem.bbox.y + bestItem.bbox.h / 2),
      });
    }
  });

  return points;
}

function visionRecognize(hintB64, challengeB64, callback) {
  var completed = false;
  var hintFinished = false;
  var challengeFinished = false;
  var hintResult = null;
  var challengeResult = null;

  function finishOnce(points, errorMessage) {
    if (completed) {
      return;
    }
    completed = true;
    callback(points, errorMessage);
  }

  function finishWhenReady() {
    if (!hintFinished || !challengeFinished || completed) {
      return;
    }

    if (!hintResult || hintResult.error) {
      var hintCode = hintResult && hintResult.error ? hintResult.error.code : 'missing_result';
      finishOnce(null, 'Hint OCR failed: ' + hintCode);
      return;
    }
    if (!challengeResult || challengeResult.error) {
      var challengeCode = challengeResult && challengeResult.error
        ? challengeResult.error.code
        : 'missing_result';
      finishOnce(null, 'Challenge OCR failed: ' + challengeCode);
      return;
    }
    if (!Array.isArray(hintResult.observations) || !Array.isArray(challengeResult.observations)) {
      finishOnce(null, 'OCR result did not contain observations');
      return;
    }

    var hintChars = [];
    hintResult.observations.forEach(function (obs) {
      var text = String(obs.text || '').trim();
      if (text) {
        hintChars.push(text);
      }
    });

    if (hintChars.length === 0) {
      finishOnce(null, 'Hint OCR returned no characters');
      return;
    }
    if (challengeResult.observations.length === 0) {
      finishOnce(null, 'Challenge OCR returned no characters');
      return;
    }

    var points = matchHintPositions(hintChars, challengeResult.observations);
    if (points.length !== hintChars.length) {
      finishOnce(null, 'Challenge OCR did not match every hint character');
      return;
    }
    finishOnce(points, null);
  }

  $vision.recognizeText(hintB64, function (result) {
    hintResult = result;
    hintFinished = true;
    finishWhenReady();
  });

  $vision.recognizeText(challengeB64, function (result) {
    challengeResult = result;
    challengeFinished = true;
    finishWhenReady();
  });
}

function solveClickCaptcha(hintB64, challengeB64, callback) {
  if (typeof $vision === 'undefined' || typeof $vision.recognizeText !== 'function') {
    callback(null, 'Syncnext does not provide $vision.recognizeText');
    return;
  }

  visionRecognize(hintB64, challengeB64, callback);
}

// ── gate bypass orchestration ───────────────────────────────

function bypassGate(originalURL, callback) {
  if (bypassingGate) {
    bypassQueue.push(callback);
    return;
  }
  bypassingGate = true;

  var req = buildRequest(GATE_PAGE_URL, DDYS_HOST + '/');
  $http.fetch(req).then(function (res) {
    var fields = extractGateFields(res.body);

    if (!fields.formNonce || !fields.captchaToken) {
      finishBypass(callback, false, 'Failed to extract gate form fields');
      return;
    }

    var altchaReq = {
      url: CHALLENGE_API,
      method: 'GET',
      headers: {
        'User-Agent': DDYS_UA,
        Referer: DDYS_HOST + '/',
      },
    };

    $http.fetch(altchaReq).then(function (altchaRes) {
      var altchaData;
      try {
        altchaData = JSON.parse(altchaRes.body);
      } catch (e) {
        finishBypass(callback, false, 'ALTCHA challenge parse error');
        return;
      }

      var number;
      try {
        number = solveAltcha(altchaData);
      } catch (solveError) {
        finishBypass(callback, false, 'ALTCHA solve error: ' + String(solveError));
        return;
      }

      var altchaSolution = {
        algorithm: altchaData.algorithm || 'SHA-256',
        challenge: altchaData.challenge,
        number: number,
        salt: altchaData.salt,
        signature: altchaData.signature,
      };
      var altchaB64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(altchaSolution)));

      if (!fields.hintImage || !fields.challengeImage) {
        finishBypass(callback, false, 'Captcha images not found in gate page');
        return;
      }

      solveClickCaptcha(fields.hintImage, fields.challengeImage, function (points, ocrErr) {
        if (ocrErr) {
          finishBypass(callback, false, 'Click captcha OCR failed: ' + ocrErr);
          return;
        }

        var formData = urlEncodeForm({
          ddys_protect_password: 'ddys',
          ddys_protect_altcha_gate: altchaB64,
          ddys_protect_click_points: JSON.stringify(points),
          ddys_protect_action: 'gate_login',
          ddys_protect_nonce: fields.formNonce,
          ddys_protect_started: fields.started,
          ddys_protect_started_sig: fields.startedSig,
          ddys_protect_captcha_token: fields.captchaToken,
          redirect_to: DDYS_HOST + '/',
          _wp_http_referer: '/',
        });

        var submitReq = {
          url: GATE_PAGE_URL,
          method: 'POST',
          headers: {
            'User-Agent': DDYS_UA,
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer: DDYS_HOST + '/',
            Origin: DDYS_HOST,
          },
          body: formData,
        };

        $http.fetch(submitReq).then(function (submitRes) {
          var verifyReq = buildRequest(DDYS_HOST + '/wp-json/', DDYS_HOST + '/');
          $http.fetch(verifyReq).then(function (vRes) {
            if (isWPBlocked(vRes.body) || isGatePage(vRes.body)) {
              finishBypass(callback, false, 'Gate bypass failed: still blocked');
            } else {
              finishBypass(callback, true, null);
            }
          }).catch(function () {
            finishBypass(callback, false, 'Verification request failed');
          });
        }).catch(function (err) {
          finishBypass(callback, false, 'Gate form submission failed: ' + String(err));
        });
      });
    }).catch(function (err) {
      finishBypass(callback, false, 'ALTCHA challenge request failed: ' + String(err));
    });
  }).catch(function (err) {
    finishBypass(callback, false, 'Gate page request failed: ' + String(err));
  });
}

function finishBypass(primaryCallback, success, errorMessage) {
  if (success) {
    primaryCallback(true, null);
  } else {
    primaryCallback(false, errorMessage);
  }
  while (bypassQueue.length > 0) {
    var cb = bypassQueue.shift();
    if (success) {
      cb(true, null);
    } else {
      cb(false, errorMessage);
    }
  }
  bypassingGate = false;
}

// ── safe fetch wrapper ──────────────────────────────────────

function safeFetch(url, method, body, contentType, callback) {
  method = method || 'GET';
  var headers = {
    'User-Agent': DDYS_UA,
    Accept: 'application/json, text/html, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: DDYS_HOST + '/',
  };
  if (body && contentType) {
    headers['Content-Type'] = contentType;
  }

  loadRandomValidCookie(function (entry, cookieError) {
    if (cookieError) {
      callback(null, cookieError);
      return;
    }
    headers.Cookie = entry.cookie;
    var req = {
      url: url,
      method: method,
      headers: headers,
      body: body || null,
    };

    $http.fetch(req).then(function (res) {
      if (isGatePage(res.body) || isWPBlocked(res.body)) {
        callback(null, 'DDYS selected cookie was rejected by upstream');
        return;
      }
      callback(res, null);
    }).catch(function (err) {
      callback(null, err);
    });
  });
}

// ── WordPress REST API content parser ───────────────────────

function parseWPPosts(jsonText, keyword) {
  var keywordLower = String(keyword || '').trim().toLowerCase();
  var datas = [];
  var seen = {};
  var posts;

  try {
    posts = JSON.parse(jsonText);
  } catch (e) {
    return datas;
  }

  if (!Array.isArray(posts)) {
    return datas;
  }

  posts.forEach(function (post) {
    var id = String(post.id || '');
    if (!id || seen[id]) {
      return;
    }

    var title = '';
    if (post.title && post.title.rendered) {
      title = String(post.title.rendered || '').trim();
    }

    var descriptionText = '';
    if (post.excerpt && post.excerpt.rendered) {
      descriptionText = String(post.excerpt.rendered || '').replace(/<[^>]*>/g, ' ').trim();
    }

    var detailURLString = normalizeURL(post.link || '');

    var coverURLString = '';
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      var media = post._embedded['wp:featuredmedia'][0];
      if (media.source_url) {
        coverURLString = String(media.source_url).trim();
      }
    }

    if (!title) {
      return;
    }

    if (keywordLower && title.toLowerCase().indexOf(keywordLower) === -1) {
      return;
    }

    seen[id] = true;
    datas.push(buildMediaData(id, coverURLString, title, descriptionText, detailURLString));
  });

  return datas;
}

// ── main page functions ─────────────────────────────────────

function buildMedias(inputURL) {
  var url = normalizeURL(inputURL);
  safeFetch(url, 'GET', null, null, function (res, err) {
    if (err) {
      $next.emptyView('DDYS: ' + String(err));
      return;
    }

    var body = String(res.body || '');
    if (isGatePage(body) || isWPBlocked(body)) {
      $next.emptyView('DDYS: 無法通過驗證閘道');
      return;
    }

    var datas = parseWPPosts(body, '');
    if (datas.length === 0) {
      $next.emptyView('DDYS: 沒有內容');
      return;
    }
    $next.toMedias(JSON.stringify(datas));
  });
}

function Search(inputURL, key) {
  var url = normalizeURL(inputURL);
  var keyword = '';
  try {
    var match = inputURL.match(/search=([^&]+)/);
    if (match && match[1]) {
      keyword = decodeURIComponent(match[1]);
    }
  } catch (e) {
    keyword = '';
  }

  safeFetch(url, 'GET', null, null, function (res, err) {
    if (err) {
      $next.toSearchMedias(JSON.stringify([]), key);
      return;
    }

    var body = String(res.body || '');
    if (isGatePage(body) || isWPBlocked(body)) {
      $next.toSearchMedias(JSON.stringify([]), key);
      return;
    }

    var datas = parseWPPosts(body, keyword);
    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}

function Episodes(inputURL) {
  var url = normalizeURL(inputURL);
  safeFetch(url, 'GET', null, null, function (res, err) {
    if (err) {
      $next.emptyView('DDYS Episodes: ' + String(err));
      return;
    }

    var body = String(res.body || '');
    if (isGatePage(body) || isWPBlocked(body)) {
      $next.emptyView('DDYS Episodes: 需要驗證，請重新載入');
      return;
    }

    var html = body;
    var datas = [];
    var seen = {};

    tXml.getElementsByClassName(html, 'episode-link').forEach(function (el) {
      var href = (el.attributes && el.attributes.href) || '';
      var title = (tXml.toContentString(el) || '').trim();
      href = normalizeURL(href);
      if (href && !seen[href]) {
        seen[href] = true;
        datas.push(buildEpisodeData(href, title || 'Play', href));
      }
    });

    if (datas.length === 0) {
      var wpLinks = html.match(/href="([^"]+)"/g) || [];
      wpLinks.forEach(function (match) {
        var href = match.replace(/href="/, '').replace(/"$/, '');
        if (href.indexOf('/play/') >= 0 || href.indexOf('/episode/') >= 0 || href.indexOf('/video/') >= 0) {
          href = normalizeURL(href);
          if (href && !seen[href]) {
            seen[href] = true;
            datas.push(buildEpisodeData(href, 'Play', href));
          }
        }
      });
    }

    if (datas.length === 0) {
      datas.push(buildEpisodeData(url, 'Watch', url));
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function Player(inputURL) {
  var url = normalizeURL(inputURL);
  safeFetch(url, 'GET', null, null, function (res, err) {
    if (err) {
      $next.emptyView('DDYS Player: ' + String(err));
      return;
    }

    var body = String(res.body || '');

    var videoMatch = body.match(/<video[^>]*src="([^"]+)"/);
    if (videoMatch && videoMatch[1]) {
      var videoURL = normalizeURL(videoMatch[1]);
      var data = {
        url: videoURL,
        headers: {
          'User-Agent': DDYS_UA,
          Referer: DDYS_HOST + '/',
        },
      };
      $next.toPlayerByJSON(JSON.stringify(data));
      return;
    }

    var iframeMatch = body.match(/<iframe[^>]*src="([^"]+)"/);
    if (iframeMatch && iframeMatch[1]) {
      var iframeURL = normalizeURL(iframeMatch[1]);
      var iframeData = {
        url: iframeURL,
        headers: {
          'User-Agent': DDYS_UA,
          Referer: DDYS_HOST + '/',
        },
      };
      $next.toPlayerByJSON(JSON.stringify(iframeData));
      return;
    }

    var sourceMatch = body.match(/<source[^>]*src="([^"]+)"/);
    if (sourceMatch && sourceMatch[1]) {
      var srcURL = normalizeURL(sourceMatch[1]);
      var srcData = {
        url: srcURL,
        headers: {
          'User-Agent': DDYS_UA,
          Referer: DDYS_HOST + '/',
        },
      };
      $next.toPlayerByJSON(JSON.stringify(srcData));
      return;
    }

    $next.toPlayer(url);
  });
}
