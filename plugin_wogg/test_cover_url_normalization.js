const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const encodedURL =
  "https://gimg0.baidu.com/gimg/app=2001&amp;n=0&amp;g=0n&amp;fmt=jpeg&amp;src=img.picbf.com/upload/poster.webp";
const expectedURL =
  "https://gimg0.baidu.com/gimg/app=2001&n=0&g=0n&fmt=jpeg&src=img.picbf.com/upload/poster.webp";

const fixture = `
  <div class="module-item-cover">
    <a href="/voddetail/1.html" title="Fixture title"></a>
    <img data-src="${encodedURL}" alt="Fixture title">
  </div>
  <div class="module-item-text">Fixture description</div>
`;

async function main() {
  let emittedMedias;
  const context = {
    console,
    $http: {
      fetch: () => Promise.resolve({ body: fixture }),
    },
    $next: {
      toMedias: (medias) => {
        emittedMedias = JSON.parse(medias);
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(__dirname + "/txml.js", "utf8"), context);
  vm.runInContext(fs.readFileSync(__dirname + "/app.js", "utf8"), context);

  context.buildMedias("https://wogg.xxooo.cf?page=1");
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(context.normalizeCoverURL(encodedURL), expectedURL);
  assert.equal(emittedMedias.length, 1);
  assert.equal(emittedMedias[0].coverURLString, expectedURL);

  console.log("cover URL normalization: PASS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
