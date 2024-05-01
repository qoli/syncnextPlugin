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

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = "https://tvfan.xxooo.cf" + href;
  }

  if (href.includes("vodplay")) {
    return href.replace(/\/vodplay\/(\d+)-1-1\.html/, "/voddetail/$1.html");
  }

  return href;
}

function buildMedias_index(inputURL) {
  let page = inputURL.replace("https://tvfan.xxooo.cf?page=", "");

  if (page >= 2) {
    print("玩偶首頁不支持翻頁，請切換到分類");
    return;
  }

  buildMedias(inputURL);
}

function buildMedias(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let returnDatas = [];

  // 使用 Syncnext 內置 http 以請求內容
  $http.fetch(req).then(function (res) {
    let data = res.body;

    var content = tXml.getElementsByClassName(data, "module-item-cover");
    var contentText = tXml.getElementsByClassName(data, "module-item-text");

    for (var index = 0; index < content.length; index++) {
      var dom = content[index];

      var title = findAllByKey(dom, "title")[0].replace("立刻播放", "");
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-src")[0];

      href = buildURL(href);

      var descriptionText = "";

      if (contentText.length > 0) {
        descriptionText = contentText[index].children[0];
      }

      returnDatas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    }

    // 向 Syncnext 返回封面牆數據
    $next.toMedias(JSON.stringify(returnDatas));
  });
}

function getEpisodes(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  $http.fetch(req).then(function (res) {
    let regex = /https:\/\/www\.(alipan|aliyundrive)\.com\/s\/[A-Za-z0-9]+/;
    let matches = res.body.match(regex);

    if (matches) {
      $next.aliLink(matches[0]);
    } else {
      $next.emptyView("找不到可用的阿里雲盤分享地址，請更換資源查看");
    }
  });
}

function Search(inputURL, key) {
  var req = {
    url: inputURL,
    method: "GET",
  };

  let returnDatas = [];

  // 使用 Syncnext 內置 http 以請求內容
  $http.fetch(req).then(function (res) {
    let data = res.body;

    var content = tXml.getElementsByClassName(data, "module-search-item");
    var contentText = tXml.getElementsByClassName(data, "video-serial");

    for (var index = 0; index < content.length; index++) {
      var dom = content[index];

      var title = findAllByKey(dom, "alt")[0];
      var href = findAllByKey(dom, "href")[0];
      var coverURLString = findAllByKey(dom, "data-src")[0];

      href = buildURL(href);

      var descriptionText = "";

      if (contentText.length > 0) {
        descriptionText = contentText[index].children[0];
      }

      returnDatas.push(
        buildMediaData(href, coverURLString, title, descriptionText, href)
      );
    }

    // 向 Syncnext 返回封面牆數據
    $next.toSearchMedias(JSON.stringify(returnDatas), key);
  });
}

function Player(input) {
  $next.aliPlay(input);
}
