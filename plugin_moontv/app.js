`user script`;

function print(params) {
  console.log(JSON.stringify(params));
}

function buildMediaData(id, coverURLString, title, descriptionText, detailURLString) {
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

function buildURL(href) {
  if (!href.startsWith("http")) {
    href = "https://moon-tv-seven-beta-58.vercel.app" + href;
  }
  return href;
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

// 豆瓣分類數據獲取 - 根據真實 API 參數
function buildDoubanMedias(inputURL) {
  const params = inputURL.split("-");
  const kind = params[0].trim(); // movie/tv
  const category = params[1].trim(); // 热门 或 tv
  const type = params[2].trim(); // 全部 或 tv
  const start = (parseInt(params[3].trim()) - 1) * 25;

  let apiURL;
  let refererURL;

  if (kind === 'movie') {
    // 電影類別
    const encodedCategory = encodeURIComponent(category);
    const encodedType = encodeURIComponent(type);
    apiURL = `https://moon-tv-seven-beta-58.vercel.app/api/douban/categories?kind=movie&category=${encodedCategory}&type=${encodedType}&limit=25&start=${start}`;
    refererURL = 'https://moon-tv-seven-beta-58.vercel.app/douban?type=movie';
  } else {
    // 電視劇/綜藝類別
    if (category === 'show') {
      // 綜藝節目
      apiURL = `https://moon-tv-seven-beta-58.vercel.app/api/douban/categories?kind=tv&category=show&type=show&limit=25&start=${start}`;
    } else {
      // 電視劇
      apiURL = `https://moon-tv-seven-beta-58.vercel.app/api/douban/categories?kind=tv&category=tv&type=tv&limit=25&start=${start}`;
    }
    refererURL = 'https://moon-tv-seven-beta-58.vercel.app/douban?type=tv';
  }

  const req = {
    url: apiURL,
    method: "GET",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    }
  };

  $http.fetch(req).then((res) => {
    const data = JSON.parse(res.body);
    let datas = [];

    if (data.code === 200 && data.list) {
      data.list.forEach((item) => {
        const playUrl = buildURL(`/play?title=${item.title}&year=${item.year}&stype=${kind === 'movie' ? 'movie' : 'tv'}`);

        datas.push(buildMediaData(
          playUrl,
          item.poster || "",
          item.title,
          `${item.year} · ${item.rate || 'N/A'}`,
          playUrl
        ));
      });
    }

    $next.toMedias(JSON.stringify(datas));
  }).catch((error) => {
    print("Error fetching douban medias: " + error);
    $next.toMedias("[]");
  });
}

// 抽取標題參數
function getQueryParam(url, param) {
  const regex = new RegExp('[?&]' + param + '=([^&#]*)', 'i');
  const match = regex.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}

function Episodes(inputURL) {
  const year = getQueryParam(inputURL, 'year')
  const normalizeYear = (value) => {
    if (value === undefined || value === null) {
      return "";
    }
    const str = String(value).trim();
    if (!str || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") {
      return "";
    }
    const match = str.match(/\d{4}/);
    return match ? match[0] : "";
  };
  const targetYear = normalizeYear(year);

  const title = getQueryParam(inputURL, 'title');
  if (!title) {
    print("Episodes error: 缺少標題參數");
    return;
  }

  // 2. 請求搜索 API
  const searchURL = `https://moon-tv-seven-beta-58.vercel.app/api/search?q=${encodeURIComponent(title)}`;

  const req = {
    url: searchURL,
    method: "GET",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://moon-tv-seven-beta-58.vercel.app/',
      'Connection': 'keep-alive'
    }
  };

  $http.fetch(req).then((res) => {
    const data = JSON.parse(res.body);

    // 3. 找到標題完全匹配的結果
    let matchedResults = [];
    if (data.results && data.results.length > 0) {
      for (let i = 0; i < data.results.length; i++) {
        // 追加匹配邏輯，讓年份相同的內容進行匹配
        const result = data.results[i];
        const resultYear = normalizeYear(result.year);
        const isYearMatched = !targetYear || (resultYear && resultYear === targetYear);
        if (result.title === title && isYearMatched) {
          matchedResults.push(result);
        }
      }
    }

    if (matchedResults.length === 0) {
      print("Episodes error: 未找到匹配的內容");
      $next.toEpisodes("[]");
      return;
    }

    // 4. 統計劇集數量，找出最常見的數量作為完整內容
    let episodeCountMap = {};
    matchedResults.forEach(result => {
      const count = result.episodes ? result.episodes.length : 0;
      episodeCountMap[count] = (episodeCountMap[count] || 0) + 1;
    });

    // 找出出現最多次的劇集數量
    let maxCount = 0;
    let mostCommonEpisodeCount = 0;
    for (const [count, frequency] of Object.entries(episodeCountMap)) {
      if (frequency > maxCount) {
        maxCount = frequency;
        mostCommonEpisodeCount = parseInt(count);
      }
    }

    // 5. 只保留劇集數量等於最常見數量的結果
    const validResults = matchedResults.filter(result =>
      result.episodes && result.episodes.length === mostCommonEpisodeCount
    );

    // 6. 構建 toEpisodesCandidates 格式
    const candidatesData = validResults.map(result => {
      const episodes = result.episodes.map((episodeUrl, index) => ({
        id: `${result.source}_ep${index + 1}`,
        title: `第 ${index + 1} 集`,
        episodeDetailURL: episodeUrl
      }));

      return {
        source: result.source_name || result.source || 'Unknown',
        episodes: episodes
      };
    });

    // 7. 調用 toEpisodesCandidates
    $next.toEpisodesCandidates(JSON.stringify(candidatesData));
  }).catch((error) => {
    print("Error in Episodes: " + error);
    $next.toEpisodes("[]");
  });
}

function Player(inputURL) {
  // 使用 toEpisodesCandidates 後，Player 函數直接接收播放 URL
  // 直接轉發播放 URL 到播放器
  $next.toPlayer(inputURL);
}

function buildMedias(inputURL) {
  // 判斷是否為豆瓣分類請求
  if (inputURL.includes('-')) {
    buildDoubanMedias(inputURL);
  } else {
    // 其他類型的媒體列表請求
    $next.toMedias("[]");
  }
}

function Search(inputURL) {
  const req = {
    url: inputURL,
    method: "GET",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://moon-tv-seven-beta-58.vercel.app/',
      'Connection': 'keep-alive'
    }
  };

  $http.fetch(req).then((res) => {
    const data = JSON.parse(res.body);
    let datas = [];

    if (data.results) {
      // 限制搜索結果數量
      const maxResults = Math.min(data.results.length, 50);

      for (let i = 0; i < maxResults; i++) {
        const item = data.results[i];

        // 根據真實API數據結構調整
        const stype = item.type_name === '电影' || item.type === 'movie' ? 'movie' : 'tv';
        const playUrl = buildURL(`/play?title=${item.title}&year=${item.year}&stype=${stype}`);

        datas.push(buildMediaData(
          playUrl,
          item.poster || item.cover || "",
          item.title,
          `${item.year} · ${item.type_name || item.type} · ${item.source_name || item.source || 'Unknown'}`,
          playUrl
        ));
      }
    }

    $next.toMedias(JSON.stringify(datas));
  }).catch((error) => {
    print("Error searching: " + error);
    $next.toMedias("[]");
  });
}
