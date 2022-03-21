/*
 * @Date: 2011-05-02 09:43:09
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-21 15:57:36
 * @FilePath: /operational-transformation/errors.js
 * @Description:
 */
// This module provides all of the custom errors defined by this library.

/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global define, setTimeout */

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory(require("util")))
    : typeof define === "function" && define.amd
    ? define("errors", ["util"], factory)
    : (global.errors = factory(
        (global.util = {
          inherits: () => {},
        })
      ));
})(this, function (util) {
  "use strict";

  var exports = {};

  function defineError(name, Parent) {
    Parent = Parent || Error;
    exports[name] = function (msg) {
      Parent.call(this, msg);
    };
    util.inherits(exports[name], Parent);
    exports[name].prototype.name = name;
  }

  defineError("BadRevision");
  defineError("NoSuchDocument");

  return exports;
});
