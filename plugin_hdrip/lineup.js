const HDRIP_DEFAULT_CHANNEL_ID = "114";
const HDRIP_GROUPS = [
  {
    id: "hong-kong",
    title: "香港",
    channels: [
      { id: "114", title: "香港電台 31" },
      { id: "115", title: "香港電台 32" },
      { id: "141", title: "無綫翡翠台（香港）" },
      { id: "110", title: "無綫明珠台" },
      { id: "91", title: "TVB Plus" },
      { id: "137", title: "ViuTV 99" },
      { id: "139", title: "ViuTVsix 96" }
    ]
  },
  {
    id: "taiwan",
    title: "台灣",
    channels: [
      { id: "52", title: "公視" },
      { id: "125", title: "臺視" },
      { id: "173", title: "華視CTS" },
      { id: "78", title: "民視" },
      { id: "148", title: "中視（來源 148）" },
      { id: "149", title: "中視（來源 149）" },
      { id: "189", title: "臺視綜合" },
      { id: "182", title: "民視臺灣台" },
      { id: "117", title: "三立臺灣台" },
      { id: "116", title: "三立都會臺" },
      { id: "119", title: "三立綜合" },
      { id: "50", title: "中天綜合臺" },
      { id: "178", title: "東森綜合" },
      { id: "158", title: "八大綜合" },
      { id: "14", title: "八大第一" },
      { id: "424", title: "緯來綜合" },
      { id: "60", title: "愛爾達綜合" },
      { id: "92", title: "無綫翡翠台（台灣）" },
      { id: "172", title: "中天亞洲" }
    ]
  },
  {
    id: "mainland-china",
    title: "中國大陸",
    channels: [
      { id: "429", title: "CCTV-4" },
      { id: "448", title: "中國大灣區衛視" },
      { id: "452", title: "中國廣東珠江頻道" },
      { id: "442", title: "中國北京衛視" },
      { id: "443", title: "中國東南衛視" },
      { id: "444", title: "中國廣西衛視" },
      { id: "445", title: "中國湖北衛視" },
      { id: "446", title: "中國湖南衛視" },
      { id: "447", title: "中國江蘇衛視" },
      { id: "449", title: "中國深圳衛視" },
      { id: "450", title: "中國四川衛視" },
      { id: "451", title: "中國浙江衛視" }
    ]
  },
  {
    id: "malaysia-singapore",
    title: "馬來西亞與新加坡",
    channels: [
      { id: "39", title: "Singapore Channel 8" },
      { id: "40", title: "Singapore Channel U" },
      { id: "250", title: "Singapore Suria" },
      { id: "133", title: "Singapore Vasantham" },
      { id: "251", title: "Malaysia TV1" },
      { id: "226", title: "Malaysia TV2" },
      { id: "213", title: "Malaysia TV3（來源 213）" },
      { id: "227", title: "Malaysia TV3（來源 227）" },
      { id: "377", title: "Malaysia TV3（來源 377）" },
      { id: "127", title: "Malaysia TV8" },
      { id: "228", title: "Malaysia TV9（來源 228）" },
      { id: "426", title: "Malaysia TV9（來源 426）" },
      { id: "223", title: "Astro Ria" },
      { id: "248", title: "Astro Prima" },
      { id: "326", title: "Astro AEC" },
      { id: "89", title: "Astro 歡喜臺" }
    ]
  },
  {
    id: "indonesia-thailand",
    title: "印尼與泰國",
    channels: [
      { id: "374", title: "Indonesia RCTI" },
      { id: "373", title: "Indonesia MDTV" },
      { id: "380", title: "TVRI National" },
      { id: "382", title: "Indonesia Trans 7" },
      { id: "383", title: "Indonesia TransTV" },
      { id: "413", title: "Indonesia MNC TV" },
      { id: "389", title: "Thailand Channel 3" },
      { id: "401", title: "PPTV Thailand1" },
      { id: "408", title: "Thailand TPTV" }
    ]
  },
  {
    id: "korea-south-asia",
    title: "韓國與南亞",
    channels: [
      { id: "155", title: "阿里郎 Arirang" },
      { id: "242", title: "KBS WORLD" },
      { id: "229", title: "tvN" },
      { id: "370", title: "Makkal TV" },
      { id: "376", title: "India Star Vijay" },
      { id: "387", title: "Zee TV HD" },
      { id: "388", title: "Asianet" }
    ]
  }
];
