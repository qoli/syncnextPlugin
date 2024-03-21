`user script`;
// signature // Start ...

function C(input) {
  return CryptoJS.MD5(input).toString();
}

function he(e) {
  let t = [],
    r = e.split("");
  for (var i = 0; i < r.length; i++) {
    0 != i && t.push(" ");
    let e = r[i].charCodeAt().toString(2);
    t.push(e);
  }
  return t.join("");
}

function t(e) {
  let t = e.toString(),
    r = [[], [], [], []];
  for (var i = 0; i < t.length; i++) {
    let e = he(t[i]);
    (r[0] += e.slice(2, 3)),
      (r[1] += e.slice(3, 4)),
      (r[2] += e.slice(4, 5)),
      (r[3] += e.slice(5));
  }
  let a = [];
  for (i = 0; i < r.length; i++) {
    let e = parseInt(r[i], 2).toString(16);
    2 == e.length && (e = "0" + e),
      1 == e.length && (e = "00" + e),
      0 == e.length && (e = "000"),
      (a[i] = e);
  }
  let n = C(t);
  return (
    n.slice(0, 3) +
    a[0] +
    n.slice(6, 11) +
    a[1] +
    n.slice(14, 19) +
    a[2] +
    n.slice(22, 27) +
    a[3] +
    n.slice(30)
  );
}

function signature() {
  return t(Date.parse(new Date()) / 1e3);
}

// signature // End ...

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

function buildDetailsURL(href) {
  // https://api.olelive.com/v1/pub/vod/detail/42723/true?_vv=c5300095501101e477110df169d3c519
  if (!href.startsWith("http")) {
    href = "https://api.olelive.com/v1/pub/vod/detail/" + href + "/true";
  }

  return href;
}

function buildImageURL(params) {
  // https://static.olelive.com/upload/vod/20240318-1/714994f723a3fa5f3b9ef25ee704e134.jpg

  if (!params.startsWith("http")) {
    return "https://static.olelive.com/" + params;
  }

  return params;
}
// Main
function buildMedias(inputURL) {
  let newURL = inputURL + "?_vv=" + signature();
  var req = {
    url: newURL,
    method: "GET",
  };

  let returnDatas = [];

  // 使用 Syncnext 內置 http 以請求內容
  $http.fetch(req).then(function (res) {
    let jsonObj = JSON.parse(res.body);
    let content = jsonObj.data.list;

    for (var index = 0; index < content.length; index++) {
      let item = content[index];

      let href = buildDetailsURL(item.id.toString());
      let coverURLString = buildImageURL(item.pic);
      let title = item.name;
      let descriptionText = item.remarks;

      returnDatas.push(
        buildMediaData(
          item.id.toString(),
          coverURLString,
          title,
          descriptionText,
          href
        )
      );
    }

    // 向 Syncnext 返回封面牆數據
    $next.toMedias(JSON.stringify(returnDatas));
  });
}

function getEpisodes(inputURL) {
  var req = {
    url: inputURL + "?_vv=" + signature(),
    method: "GET",
  };

  let returnDatas = [];

  $http.fetch(req).then(function (res) {
    let jsonObj = JSON.parse(res.body);
    let content = jsonObj.data.urls;

    for (var index = 0; index < content.length; index++) {
      let item = content[index];

      var href = item.url;
      var title = item.title;

      returnDatas.push(buildEpisodeData(href, title, href));
    }

    $next.toEpisodes(JSON.stringify(returnDatas));
  });
}

function Search(inputURL, key) {
  let newURL = inputURL + "?_vv=" + signature();
  var req = {
    url: newURL,
    method: "GET",
  };

  let returnDatas = [];

  // 使用 Syncnext 內置 http 以請求內容
  $http.fetch(req).then(function (res) {
    let jsonObj = JSON.parse(res.body);
    let content = jsonObj.data.data[0].list;

    for (var index = 0; index < content.length; index++) {
      let item = content[index];

      let href = buildDetailsURL(item.id.toString());
      let coverURLString = buildImageURL(item.pic);
      let title = item.name;
      let descriptionText = item.remarks;

      returnDatas.push(
        buildMediaData(
          item.id.toString(),
          coverURLString,
          title,
          descriptionText,
          href
        )
      );
    }

    // 向 Syncnext 返回封面牆數據
    $next.toSearchMedias(JSON.stringify(returnDatas), key);
  });
}

function Player(input) {
  $next.toPlayer(input);
}
