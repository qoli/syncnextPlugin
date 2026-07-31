const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = {
  console,
  $http: {},
  $next: {},
  __syncnextPrimaryHost: "https://www.4kcz.com",
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + "/txml.js", "utf8"), context);
vm.runInContext(fs.readFileSync(__dirname + "/app.js", "utf8"), context);

const html = `
<!doctype html>
<html lang=zh-CN data-for-verify-abcd=1234>
  <body>
    <ul class=bt_img hidden-safe=true>
      <li>
        <a href=/movie/24680.html title=測試影片>
          <img data-original=/upload/test.jpg alt=測試影片 src=/fallback.jpg>
          <span class=jidi>更新至第8集</span>
        </a>
      </li>
    </ul>
  </body>
</html>`;

const medias = context.parseMediaCardsFromHTML(html);

assert.deepStrictEqual(JSON.parse(JSON.stringify(medias)), [
  {
    id: "https://www.4kcz.com/movie/24680.html",
    coverURLString: "https://www.4kcz.com/upload/test.jpg",
    title: "測試影片",
    descriptionText: "更新至第8集",
    detailURLString: "https://www.4kcz.com/movie/24680.html",
  },
]);

const episodes = context.buildEpisodeList(`
  <div class=paly_list_btn data-for-verify-list=123>
    <a href=/v_play/test.html>立即播放 第 1 集</a>
  </div>
  <div class=ypbt_down_list>
    <a href=https://pan.quark.cn/s/example>夸克網盤</a>
  </div>`);

assert.deepStrictEqual(JSON.parse(JSON.stringify(episodes)), [
  {
    id: "https://www.4kcz.com/v_play/test.html",
    title: "第 1 集",
    episodeDetailURL: "https://www.4kcz.com/v_play/test.html",
  },
  {
    id: "https://pan.quark.cn/s/example",
    title: "[夸克] 夸克網盤",
    episodeDetailURL: "https://pan.quark.cn/s/example",
  },
]);

assert.strictEqual(
  context.extractIframeURL("<iframe src=/player/index.php?vid=abc hidden-safe=true>"),
  "/player/index.php?vid=abc"
);

console.log("plugin_czzy SafeLine HTML parser: PASS");
