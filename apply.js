/*
 * @Date: 2011-05-02 09:43:09
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-24 14:33:41
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

  return function (
    op, // op 字符串 数组
    doc // 旧的文档
  ) {
    var i,
      len,
      index = 0,
      newDoc = ""; // 新的文档
    console.log("doc==============", doc);
    for (i = 0, len = op.length; i < len; i += 1) {
      // 判断是否是删除 保留，插入
      switch (operations.type(op[i])) {
        case "retain":
          // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
          newDoc += doc.slice(
            0,
            // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
            operations.val(op[i])
          );

          doc = doc.slice(
            // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
            operations.val(op[i])
          );
          console.log("doc slice==============", doc);
          break;
        case "insert":
          // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
          newDoc += operations.val(op[i]);
          break;
        case "delete":
          if (
            doc.indexOf(
              // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
              operations.val(op[i])
            ) !== 0
          ) {
            throw new TypeError(
              "Expected '" +
                // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
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
