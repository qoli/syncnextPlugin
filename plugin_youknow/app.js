'user script';

const BASE_URL = 'https://www.youknow.tv';

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

function buildURL(href) {
  if (!href) {
    return '';
  }
  if (!href.startsWith('http')) {
    href = BASE_URL + href;
  }
  return href;
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

function fetchAndParse(url) {
  const req = {
    url: url,
    method: 'GET',
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

function buildMedias(listURL, key) {
  fetchAndParse(listURL).then(function (html) {
    const datas = [];

    if (key === 'index') {
      const cards = tXml.getElementsByClassName(html, 'module-card-item');

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const href = findAllByKey(card, 'href')[0] || '';
        const detailURLString = buildURL(href);
        const img = findAllByKey(card, 'data-original')[0] || '';
        const coverURLString = img || '';
        const titleNode = findAllByKey(card, 'strong')[0];
        const title = typeof titleNode === 'string' ? titleNode : findAllByKey(card, 'alt')[0] || '';

        let descriptionText = '';
        const noteNodes = tXml.getElementsByClassName(card, 'module-item-note');
        if (noteNodes && noteNodes[0] && noteNodes[0].children && noteNodes[0].children[0]) {
          descriptionText = noteNodes[0].children[0];
        }

        datas.push(
          buildMediaData(detailURLString, coverURLString, title, descriptionText, detailURLString)
        );
      }
    } else {
      const cards = tXml.getElementsByClassName(html, 'module-poster-item');

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const href = card.attributes && card.attributes.href ? card.attributes.href : '';
        const detailURLString = buildURL(href);

        const img = findAllByKey(card, 'data-original')[0] || '';
        const coverURLString = img || '';

        let title = '';
        const titleNodes = tXml.getElementsByClassName(card, 'module-poster-item-title');
        if (titleNodes && titleNodes[0] && titleNodes[0].children && titleNodes[0].children[0]) {
          title = titleNodes[0].children[0];
        }

        let descriptionText = '';
        const noteNodes = tXml.getElementsByClassName(card, 'module-item-note');
        if (noteNodes && noteNodes[0] && noteNodes[0].children && noteNodes[0].children[0]) {
          descriptionText = noteNodes[0].children[0];
        }

        datas.push(
          buildMediaData(detailURLString, coverURLString, title, descriptionText, detailURLString)
        );
      }
    }

    $next.toMedias(JSON.stringify(datas), key);
  });
}

function Episodes(detailURL) {
  // TODO: 根據 /d/xxxxxx 詳情頁的實際 HTML 結構，填寫正確的分集列表 selector。
  fetchAndParse(detailURL).then(function (html) {
    const datas = [];
    const container = tXml.getElementById(html, 'TODO-episode-container-id');

    if (!container || !container.children) {
      $next.toEpisodes(JSON.stringify(datas));
      return;
    }

    for (let i = 0; i < container.children.length; i++) {
      const node = container.children[i];
      const href =
        node.attributes && node.attributes.href ? node.attributes.href : '';
      const episodeURL = buildURL(href);
      const title =
        node.children && node.children[0]
          ? node.children[0]
          : 'Episode ' + (i + 1);

      datas.push(buildEpisodeData(episodeURL, title, episodeURL));
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function decodeEncrypt2(enc) {
  function safeDecodeURIComponent(str) {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  }

  let s1 = safeDecodeURIComponent(enc);
  let s2 = safeDecodeURIComponent(s1);

  function tryBase64(str) {
    try {
      return atob(str);
    } catch (e) {
      return null;
    }
  }

  let decoded = tryBase64(s2);
  if (!decoded) {
    const s3 = safeDecodeURIComponent(s2);
    decoded = tryBase64(s3);
  }

  if (!decoded) {
    return null;
  }
  return safeDecodeURIComponent(decoded);
}

function Player(episodeURL) {
  // TODO: 根據 youknow.tv 播放頁實際的 script / player_aaaa 結構補完解析邏輯。
  fetchAndParse(episodeURL).then(function (html) {
    // 目前僅占位：直接嘗試從頁面中以正則抓取 player_aaaa.url 字串並解碼。
    const match = html.match(/\"encrypt\"\\s*:\\s*2[^}]*\"url\"\\s*:\\s*\"([^\"]+)\"/);
    if (!match) {
      print({ playerParseError: 'encrypt=2 url not found' });
      $next.toPlayer('');
      return;
    }

    const enc = match[1];
    const finalURL = decodeEncrypt2(enc) || '';
    $next.toPlayer(finalURL);
  });
}

