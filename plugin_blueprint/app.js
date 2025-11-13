'user script';

/**
 * Blueprint scaffold copied from plugin_colafun.
 * Replace all TODO sections with provider-specific logic, classes, and URLs.
 */

const BASE_URL = 'https://example.com'; // TODO: replace with provider host

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
    // headers: { 'User-Agent': '' }, // TODO: add headers if provider requires them
  };
  return $http
    .fetch(req)
    .then(function (res) {
      return res.body;
    })
    .catch(function (err) {
      print({ url: url, error: err });
      return '';
    });
}

/**
 * Home / Category list builder
 * `key` comes from config.json pages[].key
 */
function buildMedias(listURL, key) {
  fetchAndParse(listURL).then(function (html) {
    const datas = [];
    const cards = tXml.getElementsByClassName(html, 'TODO-card-class'); // TODO class selector

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];

      // TODO: Adjust DOM traversal to real layout
      const title = findAllByKey(card, 'title')[0] || 'TODO title';
      const href = buildURL(findAllByKey(card, 'href')[0] || '/placeholder');
      const coverURLString = findAllByKey(card, 'data-original')[0] || '';
      const descriptionText =
        (card.children &&
          card.children[1] &&
          card.children[1].children &&
          card.children[1].children[1] &&
          card.children[1].children[1].children &&
          card.children[1].children[1].children[0]) ||
        'TODO description';

      datas.push(buildMediaData(href, coverURLString, title, descriptionText, href));
    }

    $next.toMedias(JSON.stringify(datas), key);
  });
}

/**
 * Search results builder (usually identical to buildMedias)
 */
function buildSearchMedias(searchURL, key) {
  fetchAndParse(searchURL).then(function (html) {
    const datas = [];
    const cards = tXml.getElementsByClassName(html, 'TODO-card-class');

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];
      const title = findAllByKey(card, 'title')[0] || 'TODO title';
      const href = buildURL(findAllByKey(card, 'href')[0] || '/placeholder');
      const coverURLString = findAllByKey(card, 'data-original')[0] || '';
      const descriptionText = 'TODO description'; // TODO replace

      datas.push(buildMediaData(href, coverURLString, title, descriptionText, href));
    }

    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}

/**
 * Episodes builder
 */
function Episodes(detailURL) {
  fetchAndParse(detailURL).then(function (html) {
    const datas = [];
    const container = tXml.getElementById(html, 'TODO-episode-container-id'); // TODO id selector

    if (!container || !container.children) {
      $next.toEpisodes(JSON.stringify(datas));
      return;
    }

    for (let index = 0; index < container.children.length; index++) {
      const node = container.children[index];
      const href = buildURL(node.attributes && node.attributes.href ? node.attributes.href : '/placeholder');
      const title = node.children && node.children[0] ? node.children[0] : 'Episode ' + (index + 1);
      datas.push(buildEpisodeData(href, title, href));
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

/**
 * Player builder
 */
function Player(episodeURL) {
  fetchAndParse(episodeURL).then(function (html) {
    // TODO: adjust selectors to match provider embed
    const embedNode = tXml.getElementsByClassName(html, 'embed-responsive-item')[0];
    const iframeSrc = embedNode ? embedNode.attributes.src : '';

    // TODO: Sometimes another request is needed to exchange for real play url
    const playAPIURL = iframeSrc.startsWith('http') ? iframeSrc : BASE_URL + iframeSrc;

    fetchAndParse(playAPIURL).then(function (body) {
      // TODO: Replace with actual parsing logic. Some providers return JSON, others inline JS.
      let playURL = '';
      try {
        playURL = JSON.parse(body).url;
      } catch (error) {
        // fallback: attempt regex extraction
        const match = body.match(/https?:\/\/[^"'\\s]+/);
        if (match) {
          playURL = match[0];
        }
      }

      $next.toPlayer(playURL);
    });
  });
}

