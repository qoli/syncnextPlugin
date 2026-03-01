`user script`;

var BASE_URL = "https://libvio.site";
var REFERER_URL = BASE_URL + "/";

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
    href = BASE_URL + href;
  }
  return href;
}

function buildAbsoluteURL(url) {
  if (!startsWithHttp(url)) {
    return BASE_URL + "/" + url.replace(/^\/+/, "");
  }
  return url;
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
    var content = tXml.getElementsByClassName(res.body, "stui-vodlist__box");

    for (var index = 0; index < content.length; index++) {
      var dom = content[index];

      var title = findAllByKey(dom, "title")[0];
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-original")[0];
      var descriptionText = "";

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
    var content = tXml.getElementsByClassName(
      res.body,
      "stui-content__playlist"
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

    var url = js.url;
    var from = js.from;
    var next = js.link_next;
    var id = js.id;
    var nid = js.nid;
    var paurl = BASE_URL + "/vid/ty3.php?url=";
    var req2 = {
      url: BASE_URL + "/static/player/" + from + ".js",
      method: "GET",
    };

    // print(from);

    switch (from) {
      case "kuake":
        print("未能支持網盤播放，請按返回");
        break;

      case "ty_new1":
        $http.fetch(req2).then(function (res) {
          paurl = res.body.match(/ src="(.*?)'/)[1];
          var paurl = BASE_URL + "/vid/ty4.php?url=";
          var playAPIURL = paurl + url;

          var req = {
            url: playAPIURL,
            headers: {
              Referer: REFERER_URL,
            },
          };

          $http.fetch(req).then(function (res) {
            var body = res.body;

            var url = body.match(/var .* = '(.*?)'/)[0];
            url = url.match(/'([^']*)'/)[0];
            url = url.substring(1, url.length - 1);

            gotoPlay(url);
          });
        });
        break;

      case "tweb":
        $http.fetch(req2).then(function (res) {
          paurl = res.body.match(/ src="(.*?)'/)[1];
          var playAPIURL = paurl + url;

          var req = {
            url: playAPIURL,
            headers: {
              Referer: REFERER_URL,
            },
          };

          $http.fetch(req).then(function (res) {
            const ifrwy = res.body;
            var code = ifrwy.match(/(?<={).+?(?=})/);

            code = "{" + code + "}";

            code = JSON.parse(code);

            code = code["data"];

            _0x3a1d23 = strRevers(code);

            _0x3a1d23 = htoStr(_0x3a1d23);

            gotoPlay(decodeStr(_0x3a1d23));
          });
        });
        break;

      default:
        // form 未命中的處理手段
        $http.fetch(req2).then(function (res) {
          paurl = res.body.match(/ src="(.*?)'/)[1];
          var playAPIURL =
            paurl + url + "&next=" + next + "&id=" + id + "&nid=" + nid;

          playAPIURL = buildAbsoluteURL(playAPIURL);

          var req = {
            url: playAPIURL,
            headers: {
              Referer: REFERER_URL,
            },
          };

          $http.fetch(req).then(function (res) {
            var body = res.body;
            var url = body.match(/var .* = '(.*?)'/)[0];
            url = url.match(/'([^']*)'/)[0];
            url = url.substring(1, url.length - 1);

            gotoPlay(url);
          });
        });
        break;
    }
  });
}

function gotoPlay(url) {
  try {
    let json = {
      url: url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
        Referer: REFERER_URL,
      },
    };

    $next.toPlayerByJSON(JSON.stringify(json));
  } catch (error) {
    print("請 Syncnext 更新到 1.116 或以上版本");
    $next.toPlayer(url);
  }
}

function Search(inputURL, key) {
  const req = {
    url: inputURL, //直接從網頁獲取搜索結果
    method: "GET",
  };
  $http.fetch(req).then((res) => {
    var content = tXml.getElementsByClassName(res.body, "stui-vodlist__box");

    let datas = [];
    for (var index = 0; index < content.length; index++) {
      var dom = content[index];

      var title = findAllByKey(dom, "title")[0];
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-original")[0];
      var descriptionText = "";

      href = buildURL(href);

      datas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    }

    $next.toSearchMedias(JSON.stringify(datas), key);
  });
}
function htoStr(_0x335e0c) {
  var _0x19492b = "";
  for (
    var _0x53a455 = 0;
    _0x53a455 < _0x335e0c.length;
    _0x53a455 = _0x53a455 + 2
  ) {
    var _0x4091f2 = _0x335e0c[_0x53a455] + _0x335e0c[_0x53a455 + 1];
    _0x4091f2 = parseInt(_0x4091f2, 16);
    _0x19492b += String.fromCharCode(_0x4091f2);
  }
  return _0x19492b;
}
function strRevers(_0x5d6b71) {
  return _0x5d6b71.split("").reverse();
}
function decodeStr(_0x267828) {
  var _0x5cd2b5 = (_0x267828.length - 7) / 2,
    _0x2191ed = _0x267828.substring(0, _0x5cd2b5),
    _0x35a256 = _0x267828.substring(_0x5cd2b5 + 7);
  return _0x2191ed + _0x35a256;
}

function startsWithHttp(str) {
  return str.startsWith("http");
}
