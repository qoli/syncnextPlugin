function playURL(input) {
  var path = input.match(/url=(.*)/)[1];
  var outputUrl = "https://m.colafun.com/a.html?path=" + path;
  return outputUrl;
}

function addressParse(jsonText) {
  var json = JSON.parse(jsonText);
  const url = json.quality.find((item) => item.name === "HD").url;
  return url;
}
