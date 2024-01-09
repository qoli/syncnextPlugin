// https://github.com/TobiasNickel/tXml

var fetch = require("node-fetch");
var tXml = require("txml");

function buildMediaData(
  id,
  coverURLString,
  title,
  descriptionText,
  detailURLString
) {
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

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
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

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = "https://wogg.link" + href;
  }

  if (href.includes("vodplay")) {
    return href.replace(/\/vodplay\/(\d+)-1-1\.html/, "/voddetail/$1.html");
  }

  return href;
}

async function mianApp(inputURL) {
  const response = await fetch(inputURL);
  const data = await response.text();

  let returnDatas = [];

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

  print(content[0]);
  print(returnDatas[0]);
  print(returnDatas.length);
}

async function mianApp2(inputURL) {
  const response = await fetch(inputURL);
  const data = await response.text();

  print(data);

  const regex = new RegExp("(https://www.alipan.com/s/.*?)");
  let matches = data.match(regex);
  print(matches);
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

    var content = tXml.getElementsByClassName(data, "module-item-cover");
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

mianApp("https://wogg.link/index.php/vodsearch/-------------.html?wd=4k");
// mianApp("https://wogg.link/index.php/vodtype/1.html");
