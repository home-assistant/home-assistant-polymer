import objAssign from "es6-object-assign";
import "mdn-polyfills/Array.prototype.includes";
import "regenerator-runtime/runtime";
import "unfetch/polyfill";
// To use comlink under ES5
import "proxy-polyfill";

objAssign.polyfill();

if (Object.values === undefined) {
  Object.values = (target) => {
    return Object.keys(target).map((key) => target[key]);
  };
}

/* eslint-disable */
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength >>= 0; // truncate if number, or convert non-number to 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length >= targetLength) {
      return String(this);
    }
    targetLength -= this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
    }
    return padString.slice(0, targetLength) + String(this);
  };
}
/* eslint-enable */
