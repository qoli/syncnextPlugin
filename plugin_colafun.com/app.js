`user script`;

function print(params) {
  console.log(JSON.stringify(params));
}

function buildMediaData(
  id,
  coverURLString,
  title,
  descriptionText,
  detailURLString
) {
  var obj = {
    id: id,
    coverURLString: coverURLString,
    title: title,
    descriptionText: descriptionText,
    detailURLString: detailURLString,
  };

  return obj;
}

function buildEpisodeData(id, title, episodeDetailURL) {
  return {
    id: id,
    title: title,
    episodeDetailURL: episodeDetailURL,
  };
}

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = "https://m.colafun.com" + href;
  }
  return href;
}

function findAllByKey(obj, keyToFind) {
  return (
    Object.entries(obj).reduce(
      (acc, [key, value]) =>
        key === keyToFind
          ? acc.concat(value)
          : typeof value === "object" && value
          ? acc.concat(findAllByKey(value, keyToFind))
          : acc,
      []
    ) || []
  );
}

// Main

function buildMedias(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then(function (res) {
    var content = tXml.getElementsByClassName(res.body, "card shadow-sm");

    for (var index = 0; index < content.length; index++) {
      var dom = content[index];

      var title = findAllByKey(dom, "title")[0];
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-original")[0];
      var descriptionText = dom.children[1].children[1].children[0].children[0];

      href = buildURL(href);

      datas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    }

    $next.toMedias(JSON.stringify(datas));
  });
}

function Episodes(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then(function (res) {
    var content = tXml.getElementById(res.body, "item-url-0");

    for (var index = 0; index < content.children.length; index++) {
      var element = content.children[index];

      var href = element.attributes.href;
      var title = element.children[0];

      href = buildURL(href);

      datas.push(buildEpisodeData(href, title, href));
    }

    $next.toEpisodes(JSON.stringify(datas));
  });
}

function Player(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  $http.fetch(req).then(function (res) {
    var xml = res.body;
    var playBaseURL = tXml.getElementsByClassName(
      xml,
      "embed-responsive-item"
    )[0].attributes.src;

    var playAPIURL =
      "https://m.colafun.com/o.html?path=" + playBaseURL.match(/url=(.*)/)[1];

    var req = {
      url: playAPIURL,
    };

    $http.fetch(req).then(function (res) {
      // print(res.body);
      var url = JSON.parse(res.body).url;
      $next.toPlayer(url);
    });
  });
}
