const HDRIP_CHANNELS = HDRIP_GROUPS.flatMap(group => group.channels);
let hdripSessionCookie;

function Channels() {
  return {
    defaultChannelId: HDRIP_DEFAULT_CHANNEL_ID,
    channels: HDRIP_CHANNELS,
    groups: HDRIP_GROUPS.map(({ id, title, channels }) => ({
      id, title, channelIds: channels.map(channel => channel.id)
    }))
  };
}

async function Player(channelID) {
  if (!HDRIP_CHANNELS.some(channel => channel.id === channelID)) {
    $next.emptyView("此 HD.Rip 插件未收錄該頻道。");
    return;
  }

  const host = __syncnextPrimaryHost.replace(/\/$/, "");
  const page = `${host}/?ch=${channelID}`;
  const userAgent = "Syncnext";

  try {
    if (!hdripSessionCookie) {
      const session = await $http.fetch({ url: page, method: "GET", headers: { "User-Agent": userAgent } });
      if (session.statusCode !== 200) {
        $next.emptyView(`HD.Rip 建立直播工作階段失敗（HTTP ${session.statusCode}）。`);
        return;
      }

      const setCookie = Object.entries(session.headers ?? {}).find(([key]) => key.toLowerCase() === "set-cookie")?.[1];
      hdripSessionCookie = /(?:^|,\s*)(hdrip_s=[^;,\s]+)/.exec(String(setCookie ?? ""))?.[1];
      if (!hdripSessionCookie) {
        $next.emptyView("HD.Rip 未建立直播工作階段。");
        return;
      }
    }

    // HD.Rip requires the same session cookie and user agent for signing and playback.
    const headers = { "User-Agent": userAgent, Referer: page, Cookie: hdripSessionCookie };
    const playback = await $http.fetch({ url: `${host}/api/play.php?id=${channelID}`, method: "GET", headers });
    if (playback.statusCode !== 200) {
      $next.emptyView(`HD.Rip 取流服務回覆 HTTP ${playback.statusCode}。`);
      return;
    }

    const url = JSON.parse(playback.body)?.url;
    if (typeof url !== "string" || !url.startsWith(`${host}/stream/`) || !/\/playlist\.m3u8\?[^#]+$/.test(url)) {
      $next.emptyView("HD.Rip 未提供有效的直播播放網址。");
      return;
    }

    const playlist = await $http.fetch({ url, method: "GET", headers });
    if (playlist.statusCode !== 200 || !/^#EXTM3U\s/.test(playlist.body.trimStart())) {
      $next.emptyView("HD.Rip 直播清單目前無法讀取。");
      return;
    }

    $next.toPlayerByJSON(JSON.stringify({ url, headers }));
  } catch (_) {
    $next.emptyView("無法取得 HD.Rip 直播資料。");
  }
}
