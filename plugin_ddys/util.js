function print(params) {
  params = params || '';
  if (typeof params === 'object' && Object.keys(params).length > 0) {
    try {
      console.log(JSON.stringify(params));
    } catch (e) {
      console.log(typeof params + ':' + params.length);
    }
  } else if (typeof params === 'object' && Object.keys(params).length < 1) {
    console.log('null object');
  } else {
    console.log(JSON.stringify(params));
  }
}

function buildMediaData(id, coverURLString, title, descriptionText, detailURLString) {
  return {
    id: id,
    coverURLString: coverURLString || '',
    title: title || '',
    descriptionText: descriptionText || '',
    detailURLString: detailURLString || '',
  };
}

function buildEpisodeData(id, title, episodeDetailURL) {
  return {
    id: id,
    title: title,
    episodeDetailURL: episodeDetailURL,
  };
}

function findAllByKey(obj, keyToFind) {
  return (
    Object.entries(obj).reduce(
      function (acc, kv) {
        var key = kv[0];
        var value = kv[1];
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

function buildURL(href, baseHost) {
  href = String(href || '').trim();
  if (!href) {
    return '';
  }
  if (href.indexOf('//') === 0) {
    href = 'https:' + href;
  } else if (href.indexOf('http') !== 0) {
    href = baseHost + (href.charAt(0) === '/' ? href : '/' + href);
  }
  return href;
}

function urlEncodeForm(data) {
  var parts = [];
  Object.keys(data).forEach(function (key) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(data[key])));
  });
  return parts.join('&');
}
