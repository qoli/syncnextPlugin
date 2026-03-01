'user script';

const BASE_URL = 'https://www.thanju.com';

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
  const raw = String(href || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  if (raw.startsWith('//')) return 'https:' + raw;
  if (raw.startsWith('/')) return BASE_URL + raw;
  return BASE_URL + '/' + raw;
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

function normalizeText(input) {
  return String(input || '').replace(/\s+/g, ' ').trim();
}

function fetchAndParse(url) {
  const req = {
    url: url,
    method: 'GET',
    headers: {
      Referer: BASE_URL + '/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    },
  };
  return $http.fetch(req).then(
    function (res) {
      return res.body || '';
    },
    function (err) {
      print({ url: url, error: err });
      return '';
    }
  );
}

function parseCardList(html, preferClassName) {
  let cards = tXml.getElementsByClassName(html, preferClassName);
  if (!cards || cards.length === 0) {
    cards = tXml.getElementsByClassName(html, 'myui-vodlist__media');
  }
  if (!cards || cards.length === 0) {
    cards = tXml.getElementsByClassName(html, 'myui-vodlist__box');
  }
  return cards || [];
}

function extractMediaFromCard(card) {
  const hrefCandidates = findAllByKey(card, 'href');
  let href = '';
  for (let i = 0; i < hrefCandidates.length; i++) {
    const text = String(hrefCandidates[i] || '');
    if (text.indexOf('/detail/') >= 0) {
      href = text;
      break;
    }
  }
  if (!href && hrefCandidates.length > 0) {
    href = hrefCandidates[0];
  }

  let title = normalizeText(findAllByKey(card, 'title')[0] || '');
  if (!title) {
    const text = findAllByKey(card, 'alt')[0] || '';
    title = normalizeText(text);
  }

  let cover = findAllByKey(card, 'data-original')[0] || '';
  if (!cover) {
    cover = findAllByKey(card, 'data-src')[0] || '';
  }
  if (!cover) {
    cover = findAllByKey(card, 'src')[0] || '';
  }

  let desc = '';
  const remarks = findAllByKey(card, 'class');
  for (let i = 0; i < remarks.length; i++) {
    if (String(remarks[i]).indexOf('pic-text') >= 0) {
      const textNodes = findAllByKey(card, 'children');
      if (textNodes && textNodes.length > 0) {
        desc = normalizeText(textNodes[0]);
      }
      break;
    }
  }
  if (!desc) {
    const statusList = findAllByKey(card, 'text');
    if (statusList && statusList.length > 0) {
      desc = normalizeText(statusList[0]);
    }
  }
  if (!desc) {
    desc = title;
  }

  return {
    title: title,
    href: buildURL(href),
    cover: buildURL(cover),
    desc: desc,
  };
}

function buildMedias(listURL, key) {
  fetchAndParse(listURL).then(function (html) {
    const datas = [];
    const cards = parseCardList(html, 'myui-vodlist__box');

    for (let index = 0; index < cards.length; index++) {
      const media = extractMediaFromCard(cards[index]);
      if (!media.href || !media.title) continue;
      datas.push(buildMediaData(media.href, media.cover, media.title, media.desc, media.href));
    }

    $next.toMedias(JSON.stringify(datas), key);
  });
}

function buildSearchMedias(searchURL, key) {
  fetchAndParse(searchURL).then(function (html) {
    const datas = [];
    const cards = parseCardList(html, 'myui-vodlist__media');

    for (let index = 0; index < cards.length; index++) {
      const media = extractMediaFromCard(cards[index]);
      if (!media.href || !media.title) continue;
      datas.push(buildMediaData(media.href, media.cover, media.title, media.desc, media.href));
    }

    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}

function Episodes(detailURL) {
  fetchAndParse(detailURL).then(function (html) {
    const datas = [];
    const allLinks = tXml.getElementsByClassName(html, 'sort-list') || [];

    for (let index = 0; index < allLinks.length; index++) {
      const hrefs = findAllByKey(allLinks[index], 'href') || [];
      const titles = findAllByKey(allLinks[index], 'title') || [];

      for (let i = 0; i < hrefs.length; i++) {
        const href = String(hrefs[i] || '');
        if (href.indexOf('/play/') < 0) continue;
        const full = buildURL(href);
        const title = normalizeText(titles[i] || ('第' + (i + 1) + '集'));
        datas.push(buildEpisodeData(full, title, full));
      }
    }

    if (datas.length === 0) {
      const fallback = /href="(\/play\/[^"]+\.html)"[^>]*>([^<]*)<\/a>/g;
      let match;
      let idx = 1;
      while ((match = fallback.exec(html)) !== null) {
        const full = buildURL(match[1]);
        const title = normalizeText(match[2] || ('第' + idx + '集'));
        datas.push(buildEpisodeData(full, title, full));
        idx += 1;
      }
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function Player(episodeURL) {
  fetchAndParse(episodeURL).then(function (html) {
    let playURL = '';

    const match = html.match(/var\s+cms_player\s*=\s*(\{[\s\S]*?\});/);
    if (match && match[1]) {
      try {
        const obj = JSON.parse(match[1]);
        playURL = String(obj.url || '').replace(/\\\//g, '/');
      } catch (error) {
        print({ stage: 'parse-cms_player', error: String(error) });
      }
    }

    if (!playURL) {
      const fallback = html.match(/https?:\\\/\\\/[^"'\\\s]+?\.(m3u8|mp4)[^"'\\\s]*/i);
      if (fallback && fallback[0]) {
        playURL = fallback[0].replace(/\\\//g, '/');
      }
    }

    $next.toPlayer(playURL);
  });
}
