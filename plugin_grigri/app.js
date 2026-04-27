`user script`;

var HOST =
  typeof __syncnextPrimaryHost === "string" && __syncnextPrimaryHost.trim()
    ? __syncnextPrimaryHost.trim().replace(/\/+$/, "")
    : "https://bgm.girigirilove.com";

var DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  Referer: HOST + "/",
};

var SEARCH_API_HOST = "https://m3u8.girigirilove.com";
var SEARCH_API_HEADERS = {
  "User-Agent": "Girigiri/1.0 (https://github.com/MareDevi/girigiri)",
  Referer: HOST + "/",
  Accept: "application/json, text/plain, */*",
};

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

function HostsProbeRequest() {
  return {
    url: HOST + "/show/2--------1---/",
    method: "GET",
    headers: DEFAULT_HEADERS,
    accept: {
      statusCodes: [200],
      bodyIncludesAny: ["public-list-div", "girigiri"],
      bodyExcludesAny: [
        "访问验证",
        "訪問驗證",
        "安全验证",
        "安全驗證",
        "Just a moment",
        "403 Forbidden",
        "cf-browser-verification",
        "captcha",
      ],
      titleExcludesAny: ["403 Forbidden", "Just a moment"],
    },
  };
}

// Main

function buildMedias(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
    headers: DEFAULT_HEADERS,
  };

  let datas = [];

  $http.fetch(req).then(
    function (res) {
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
    },
    function () {
      $next.toMedias(JSON.stringify([]));
    }
  );
}

function buildURL(href) {
  if (typeof href !== "string") {
    throw new TypeError("Expected a string as href");
  }

  var value = href.trim();
  if (value.startsWith("//")) {
    return rebaseSiteURL("https:" + value);
  }

  if (value.startsWith("http")) {
    return rebaseSiteURL(value);
  }

  if (!value.startsWith("/")) {
    value = "/" + value;
  }

  return HOST + value;
}

function rebaseSiteURL(url) {
  return url.replace(
    /^https?:\/\/(anime|bgm)\.girigirilove\.com(?=\/|$)/i,
    HOST
  );
}

function Episodes(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
    headers: DEFAULT_HEADERS,
  };

  let datas = [];

  $http.fetch(req).then(
    function (res) {
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
    },
    function () {
      $next.toEpisodes(JSON.stringify([]));
    }
  );
}
function Player(inputURL) {
  var req = {
    url: inputURL,
    method: "GET",
    headers: DEFAULT_HEADERS,
  };

  $http.fetch(req).then(
    function (res) {
      var xml = res.body;
      var html = xml.match(/r player_.*?=(.*?)</)[1];

      var js = JSON.parse(html);
      var urlEncode = base64Decode(js.url);
      var url = decodeURIComponent(urlEncode);
      $next.toPlayer(url);
    },
    function () {
      $next.toPlayer("");
    }
  );
}

function Search(inputURL, key) {
  const req = {
    url: buildSearchAPIURL(inputURL),
    method: "GET",
    headers: SEARCH_API_HEADERS,
  };

  let datas = [];

  $http.fetch(req).then(
    function (res) {
      var json;
      try {
        json = JSON.parse(res.body);
      } catch (e) {
        $next.toSearchMedias(JSON.stringify([]), key);
        return;
      }

      var items = Array.isArray(json.list) ? json.list : [];

      for (var index = 0; index < items.length; index++) {
        var item = items[index];
        var href = buildURL("/GV" + item.vod_id + "/");
        var coverURLString = item.vod_pic || buildURL(item.vod_pic_thumb || "");
        var title = item.vod_name || "";
        var descriptionText = item.vod_remarks || item.vod_blurb || "";
        datas.push(
          buildMediaData(
            href,
            coverURLString,
            title,
            stripHTML(descriptionText),
            href
          )
        );
      }

      $next.toSearchMedias(JSON.stringify(datas), key);
    },
    function () {
      $next.toSearchMedias(JSON.stringify([]), key);
    }
  );
}

function buildSearchAPIURL(inputURL) {
  if (typeof inputURL !== "string") {
    return SEARCH_API_HOST + "/api.php/provide/vod/";
  }

  return inputURL.replace(
    /^https?:\/\/[^/]+(?=\/api\.php\/provide\/vod\/)/i,
    SEARCH_API_HOST
  );
}

function stripHTML(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
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
