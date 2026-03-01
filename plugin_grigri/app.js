`user script`;

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
// Main

function buildMedias(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then(function (res) {
    //print(res.body)
    var content = tXml.getElementsByClassName(res.body, "public-list-div");
    //print(content)
    for (var index = 0; index < content.length; index++) {
      var dom = content[index];
      //print(content.length)

      var title = findAllByKey(dom, "title")[0];
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-src")[0];
      var descriptionText = findAllByKey(dom, "public-list-prb")[0];

      href = buildURL(href);
      coverURLString = buildURL(coverURLString);

      datas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    }

    $next.toMedias(JSON.stringify(datas));
  });
}

function buildURL(href) {
  if (typeof href !== "string") {
    throw new TypeError("Expected a string as href");
  }

  if (!href.startsWith("http")) {
    href = "https://anime.girigirilove.com" + href;
  }

  return href;
}

function Episodes(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then(function (res) {
    var content = tXml.getElementsByClassName(
      res.body,
      "anthology-list-play"
    )[0];
    //print(content.children.length);

    for (var index = 0; index < content.children.length; index++) {
      var element = content.children[index].children[0];
      //print(element);

      var href = element.attributes ? element.attributes.href : "";
      var title = element.children.toString();

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
    html = xml.match(/r player_.*?=(.*?)</)[1];

    var js = JSON.parse(html);
    urlEncode = base64Decode(js.url);
    url = decodeURIComponent(urlEncode);
    $next.toPlayer(url);
  });
}

function Search(inputURL, key) {
  const req = {
    url: inputURL, //直接從網頁獲取搜索結果
    method: "GET",
  };

  let datas = [];

  $http.fetch(req).then((res) => {
    //print(res.body)
    var content = tXml.getElementsByClassName(res.body, "search-box");
    //print(content)
    for (var index = 0; index < content.length; index++) {
      var dom = content[index];

      var title = findAllByKey(dom, "alt")[0];
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-src")[0];
      var descriptionText = findAllByKey(dom, "children")[2]["children"]["1"][
        "children"
      ][0];

      href = buildURL(href);
      coverURLString = buildURL(coverURLString);

      title = title.replace("封面图", "");

      datas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    }

    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}

function findAllByKey(obj, keyToFind) {
  // 如果 obj 不是对象，则尝试将其解析为 JSON 对象
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      console.error("提供的字符串无法解析为 JSON:", e);
      return [];
    }
  }

  // 如果 obj 依然不是对象，返回空数组
  if (typeof obj !== "object" || obj === null) {
    return [];
  }

  // 递归查找指定键
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (key === keyToFind) {
      return acc.concat(value);
    }

    if (typeof value === "object") {
      return acc.concat(findAllByKey(value, keyToFind));
    }

    return acc;
  }, []);
}

function print(params) {
  console.log(JSON.stringify(params));
}
