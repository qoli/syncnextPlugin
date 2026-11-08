const VIUTV_CHANNELS = [
  { id: "99", title: "ViuTV 99" },
  { id: "96", title: "ViuTVsix 96" }
];

const VIUTV_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Origin: "https://viu.tv",
  Referer: "https://viu.tv/"
};

function Channels() {
  return { defaultChannelId: "99", channels: VIUTV_CHANNELS };
}

function Player(channelID) {
  if (!VIUTV_CHANNELS.some(channel => channel.id === channelID)) {
    $next.emptyView("ViuTV 不支援此直播頻道。");
    return;
  }

  const channel = "0" + channelID;
  const deviceId = Array.from({ length: 18 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const hongKongTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const callerReferenceNo = hongKongTime.toISOString().slice(0, 19).replace(/\D/g, "");
  $http.fetch({
    url: __syncnextPrimaryHost.replace(/\/$/, "") + "/p8/3/getLiveURL",
    method: "POST",
    headers: { ...VIUTV_HEADERS, "Content-Type": "text/plain" },
    body: JSON.stringify({
      callerReferenceNo,
      channelno: channel,
      contentId: channel,
      contentType: "Channel",
      mode: "prod",
      cookie: deviceId,
      deviceId,
      deviceType: "IOS_WEB",
      format: "HLS"
    })
  }).then(response => {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      $next.emptyView(`ViuTV 取流服務回覆 HTTP ${response.statusCode}。`);
      return;
    }

    let data;
    try {
      data = JSON.parse(response.body);
    } catch (_) {
      $next.emptyView("ViuTV 取流回應格式錯誤。");
      return;
    }

    if (data?.responseCode === "GEO_CHECK_FAIL") {
      $next.emptyView("ViuTV 拒絕目前的播放地區。請確認 Apple TV 的網路出口。");
      return;
    }
    if (data?.responseCode !== "SUCCESS") {
      $next.emptyView("ViuTV 官方服務未接受這次取流要求。");
      return;
    }

    const url = Array.isArray(data.asset) ? data.asset[0] : null;
    if (typeof url !== "string" || !/^https?:\/\//i.test(url) ||
        typeof data.drmToken !== "string" || !data.drmToken) {
      $next.emptyView("ViuTV 播放資料不完整。");
      return;
    }

    $http.fetch({ url, method: "GET" }).then(playlist => {
      if (playlist.statusCode < 200 || playlist.statusCode >= 300 || !playlist.body.trim().startsWith("#EXTM3U")) {
        $next.emptyView("ViuTV 直播串流目前無法讀取。");
        return;
      }

      $next.toPlayerByJSON(JSON.stringify({
        url,
        headers: {},
        drm: {
          type: "fairplay",
          contentID: "skdSuffix",
          certificate: {
            url: "https://static.viu.tv/drm/fairplay-now.cer",
            headers: VIUTV_HEADERS
          },
          license: {
            url: "https://fwp.nowe.com/wrapperFP",
            headers: VIUTV_HEADERS,
            jsonBody: {
              rawLicenseRequestBase64: "${spcBase64}",
              contentKID: "${contentID}",
              drmToken: data.drmToken
            },
            responseEncoding: "base64"
          }
        }
      }));
    }).catch(() => $next.emptyView("無法連線至 ViuTV 直播串流。"));
  }).catch(() => $next.emptyView("無法連線至 ViuTV 取流服務。"));
}
