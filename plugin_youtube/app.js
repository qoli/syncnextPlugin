"user script";

function requestJSON(url, receive) {
  $http.fetch({url: url, method: "GET", headers: {}}).then(function (response) {
    const result = JSON.parse(response.body);
    if (response.statusCode !== 200) {
      $next.emptyView(result.error && result.error.message
        ? result.error.message : "YouTube Mac 代理回應 HTTP " + response.statusCode);
      return;
    }
    receive(result);
  }).catch(function () {
    $next.emptyView("YouTube Mac 代理請求失敗，請確認 Mac 代理仍在執行。");
  });
}

function Medias(inputURL) {
  requestJSON(inputURL, function (result) {
    $next.toMedias(JSON.stringify(result));
  });
}

function Search(inputURL, pluginKey) {
  requestJSON(inputURL, function (result) {
    $next.toSearchMedias(JSON.stringify(result), pluginKey);
  });
}

function Episodes(inputURL) {
  requestJSON(inputURL, function (result) {
    $next.toEpisodes(JSON.stringify(result));
  });
}

function Player(inputURL) {
  requestJSON(inputURL, function (result) {
    const player = {url: result.url, headers: result.headers};
    if (result.subtitle) player.subtitle = result.subtitle;
    $next.toPlayerByJSON(JSON.stringify(player));
  });
}
