/*
 * @Date: 2011-05-02 09:43:09
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-21 16:41:42
 * @FilePath: /operational-transformation/apply.js
 * @Description:
 */
// This module defines a function which applies a set of operations which span a
// document, to that document. The resulting document is returned.

/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global define */
 

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory(require("./operations")))
    : typeof define === "function" && define.amd
    ? define("apply", ["operations"], factory)
    : (global.apply = factory(global.operations));
})(this, function (operations) {
  "use strict";
  
  return function (op, doc) {
    var i,
      len,
      index = 0,
      newDoc = "";
    for (i = 0, len = op.length; i < len; i += 1) {
      switch (operations.type(op[i])) {
        case "retain":
          newDoc += doc.slice(0, operations.val(op[i]));
          doc = doc.slice(operations.val(op[i]));
          break;
        case "insert":
          newDoc += operations.val(op[i]);
          break;
        case "delete":
          if (doc.indexOf(operations.val(op[i])) !== 0) {
            throw new TypeError(
              "Expected '" +
                operations.val(op[i]) +
                "' to delete, found '" +
                doc.slice(0, 10) +
                "'"
            );
          } else {
            doc = doc.slice(operations.val(op[i]).length);
          }
          break;
        default:
          throw new TypeError("Unknown operation: " + operations.type(op[i]));
      }
    }
    return newDoc;
  };
});

 