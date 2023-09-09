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

async function Medias(inputURL) {
  let res = await fetch("https://m.colafun.com/0-0-0-0-1-0.html");
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

async function Episodes(inputURL) {
  let datas = [];
  let res = await fetch("https://m.colafun.com/867.html");
  var xml = await res.text();

  let content = tXml.getElementById(xml, "item-url-1");

  // print(content);

  for (let index = 0; index < content.children.length; index++) {
    const element = content.children[index];

    let href = element.attributes.href;
    let title = element.children[0];

    href = buildURL(href);

    datas.push(buildEpisodeData(href, title, href));
  }

  print(datas);
}

async function Player(inputURL) {
  let datas = [];
  let res = await fetch("https://m.colafun.com/1042-1-1.html");
  var xml = await res.text();

  let playBaseURL = tXml.getElementsByClassName(xml, "embed-responsive-item")[0]
    .attributes.src;

  print(content);

  // print(content);

  // for (let index = 0; index < content.children.length; index++) {
  //   const element = content.children[index];

  //   let href = element.attributes.href;
  //   let title = element.children[0];

  //   href = buildURL(href);

  //   datas.push(buildEpisodeData(href, title, href));
  // }

  // print(datas);
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

Player();
