var CryptoJS = require("crypto-js");

function C(input) {
  return CryptoJS.MD5(input).toString();
}

function he(e) {
  let t = [],
    r = e.split("");
  for (var i = 0; i < r.length; i++) {
    0 != i && t.push(" ");
    let e = r[i].charCodeAt().toString(2);
    t.push(e);
  }
  return t.join("");
}

function t(e) {
  let t = e.toString(),
    r = [[], [], [], []];
  for (var i = 0; i < t.length; i++) {
    let e = he(t[i]);
    (r[0] += e.slice(2, 3)),
      (r[1] += e.slice(3, 4)),
      (r[2] += e.slice(4, 5)),
      (r[3] += e.slice(5));
  }
  let a = [];
  for (i = 0; i < r.length; i++) {
    let e = parseInt(r[i], 2).toString(16);
    2 == e.length && (e = "0" + e),
      1 == e.length && (e = "00" + e),
      0 == e.length && (e = "000"),
      (a[i] = e);
  }
  let n = C(t);
  return (
    n.slice(0, 3) +
    a[0] +
    n.slice(6, 11) +
    a[1] +
    n.slice(14, 19) +
    a[2] +
    n.slice(22, 27) +
    a[3] +
    n.slice(30)
  );
}

function signature() {
  return t(Date.parse(new Date()) / 1e3);
}

console.log(signature());
