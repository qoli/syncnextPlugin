#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const sandbox = {
  console: { log: function () {} },
  JSON,
  String,
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + "/app.js", "utf8"), sandbox);

function probeAccepts(status, body) {
  const accept = sandbox.HostsProbeRequest().accept;
  const titleMatch = String(body).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "";
  const containsAny = function (text, markers) {
    const haystack = String(text).toLowerCase();
    return markers.some(function (marker) {
      return haystack.includes(String(marker).trim().toLowerCase());
    });
  };

  return (
    accept.statusCodes.includes(status) &&
    containsAny(body, accept.bodyIncludesAny) &&
    !containsAny(body, accept.bodyExcludesAny) &&
    !containsAny(title, accept.titleExcludesAny)
  );
}

assert.equal(
  probeAccepts(
    200,
    "<title>LIBVIO</title><div class='stui-vodlist__box'></div>" +
      "<footer>当前网址随时可能失效，请点击进入永久发布页收藏保存</footer>"
  ),
  true,
  "a valid home page must not be rejected by its footer publishing-page link"
);

assert.equal(
  probeAccepts(
    200,
    "<title>LIBVIO 发布页</title><div class='stui-vodlist__box'></div>"
  ),
  false,
  "a publishing landing page must still fail explicitly by title"
);

assert.equal(
  probeAccepts(
    200,
    "<title>LIBVIO</title><div class='stui-vodlist__box'></div><p>安全验证</p>"
  ),
  false,
  "an access-verification page must still fail explicitly"
);

assert.equal(
  probeAccepts(
    200,
    "<title>libvio — 域名暂时停止使用通知 / Domain Suspended</title>" +
      "<div class='stui-vodlist__box'></div>"
  ),
  false,
  "a suspended domain page must fail even when it contains a content marker"
);

console.log("plugin_libvio hosts probe contract test passed");
