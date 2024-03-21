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

async function mianApp(inputURL) {
  const response = await fetch(inputURL);
  const data = await response.text();

  let returnDatas = [];

  let jsonObj = JSON.parse(data);
  let content = jsonObj.data.urls;

  for (var index = 0; index < content.length; index++) {
    let item = content[index];

    var href = item.url;
    var title = item.title;

    returnDatas.push(buildEpisodeData(href, title, href));
  }

  print(content[0]);
  print(returnDatas[0]);
}

mianApp(
  "https://api.olelive.com/v1/pub/vod/detail/42723/true?_vv=c5300095501101e477110df169d3c519"
);
