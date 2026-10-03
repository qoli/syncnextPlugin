const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const calls = [];
let responseBody = "";
let thrownError = null;

const sandbox = {
  console: { log: function () {} },
  $http: {
    fetch: function () {
      return {
        then: function (resolve) {
          try {
            resolve({ body: responseBody });
          } catch (error) {
            thrownError = error;
          }
        },
      };
    },
  },
  $next: {
    toSearchMedias: function (data, key) {
      calls.push([JSON.parse(data), key]);
    },
  },
};

vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(__dirname + "/crypto-js.min.js", "utf8"),
  sandbox
);
vm.runInContext(fs.readFileSync(__dirname + "/main.js", "utf8"), sandbox);

responseBody = JSON.stringify({
  data: {
    data: [
      {
        list: [
          {
            id: 83916,
            name: "当妈妈开始较真的时候",
            pic: "upload/vod/example.jpg",
            remarks: "高清",
          },
          {
            id: 84966,
            name: "死亡赌局",
            pic: "upload/vod/death-game.jpg",
            remarks: "超清",
          },
          {
            id: 82861,
            name: "功夫女足",
            pic: "upload/vod/kung-fu-soccer.jpg",
            remarks: "超清",
          },
          {
            id: 82724,
            name: "森中有林",
            pic: "upload/vod/forest.jpg",
            remarks: "超清",
          },
        ],
      },
    ],
  },
});
sandbox.Search("https://api.example/search", "plugin-key");
assert.equal(thrownError, null);
assert.equal(calls.length, 1);
assert.equal(calls[0][0].length, 4);
assert.equal(calls[0][0][0].id, "83916");
assert.equal(calls[0][0][0].title, "当妈妈开始较真的时候");
assert.equal(calls[0][1], "plugin-key");
assert.deepEqual(
  calls[0][0].slice(1),
  [
    ["84966", "死亡赌局", "death-game.jpg"],
    ["82861", "功夫女足", "kung-fu-soccer.jpg"],
    ["82724", "森中有林", "forest.jpg"],
  ].map(function ([id, title, image]) {
    return {
      id: id,
      coverURLString: "https://static.olelive.com/upload/vod/" + image,
      title: title,
      descriptionText: "超清",
      detailURLString: "https://api.olelive.com/v1/pub/vod/detail/" + id + "/true",
    };
  })
);

responseBody = JSON.stringify({ data: { data: [{ list: null }] } });
sandbox.Search("https://api.example/search", "plugin-key");
assert.equal(thrownError, null);
assert.deepEqual(calls[1], [[], "plugin-key"]);

responseBody = JSON.stringify({ data: { data: [{}] } });
sandbox.Search("https://api.example/search", "plugin-key");
assert.ok(thrownError);
assert.equal(thrownError.name, "Error");
assert.equal(
  thrownError.message,
  "invalid search response: data.data[0].list must be an array or null"
);
assert.equal(calls.length, 2);

console.log("plugin_olevod search contract tests passed");
