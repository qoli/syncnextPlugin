// https://github.com/TobiasNickel/tXml

var fetch = require("node-fetch");
const tXml = require("txml");

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

async function Search(inputURL) {
  let res = await fetch("https://m.colafun.com/search.html?name=生活");
  var xml = await res.text();

  let content = tXml.getElementsByClassName(xml, "card shadow-sm");

  let datas = [];

  for (let index = 0; index < content.length; index++) {
    // console.log("======================");
    const dom = content[index];
    // print(dom);

    let title = findAllByKey(dom, "title")[0];
    let href = findAllByKey(dom, "href")[0];
    let coverURLString = findAllByKey(dom, "data-original")[0];
    let descriptionText = dom.children[1].children[1].children[0].children[0];

    // console.log(title, href, coverURLString, descriptionText);

    var newData = buildMediaData(
      href,
      coverURLString,
      title,
      descriptionText,
      href
    );

    datas.push(newData);
  }

  print(datas);
}

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = "https://m.colafun.com" + href;
  }
  return href;
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

Search();
