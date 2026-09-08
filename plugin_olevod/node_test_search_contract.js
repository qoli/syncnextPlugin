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
        ],
      },
    ],
  },
});
sandbox.Search("https://api.example/search", "plugin-key");
assert.equal(thrownError, null);
assert.equal(calls.length, 1);
assert.equal(calls[0][0].length, 1);
assert.equal(calls[0][0][0].id, "83916");
assert.equal(calls[0][0][0].title, "当妈妈开始较真的时候");
assert.equal(calls[0][1], "plugin-key");

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
