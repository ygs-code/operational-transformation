/*
 * @Date: 2011-05-02 09:43:09
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-21 16:48:43
 * @FilePath: /operational-transformation/tests/tests.js
 * @Description:
 */

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory(
        require("../operations"),
        require("../xform"),
        require("../apply")
      ))
    : typeof define === "function" && define.amd
    ? define("tests", ["operations", "xform", "apply"], factory)
    : (global.tests = factory(global.operations, global.xform, global.apply));
})(this, function (ops, xform, apply) {
  "use strict";

  var numTests = 0;
  var failed = 0;

  function test(
    original, // 旧的文本，服务器文本
    a, // 文本a
    b, // 文本b
    expected // 合并后的预期文本
  ) {
    var operationsA = ops.operation(
      original, // 旧的文本，服务器文本
      a // 新的文本
    );
     return
    var operationsB = ops.operation(
      original, // 旧的文本，服务器文本
      b // 新的文本
    );

    // ot 算法函数
    xform(operationsA, operationsB, function (ap, bp) {
      numTests++;
      // try {
      console.log(original + " -< (" + a + ", " + b + ") >- " + expected);

      var docA = apply(operationsA, original);
      var finalA = apply(bp, docA);
      console.log("  " + original + " -> " + docA + " -> " + finalA);
      if (finalA !== expected) {
        throw new Error(finalA + " !== " + expected);
      }

      var docB = apply(operationsB, original);
      var finalB = apply(ap, docB);
      console.log("  " + original + " -> " + docB + " -> " + finalB);
      if (finalB !== expected) {
        throw new Error(finalB + " !== " + expected);
      }
      // } catch (e) {
      //   failed++;
      //   console.log("  ERROR: " + e.message);
      // }
    });
  }

  test("abc", "xabc", "ab", "xab");

  // // test("nick", "Nick", "nick is cool", "Nick is cool");
  // // test("sudo", "sumo", "suo", "sumo");
  // // test("hello", "Hello", "Hello", "Hello");
  // // test("care", "are", "are", "are");
  // // test("air", "fair", "lair", "flair");

  // // console.log(numTests - failed + " / " + numTests + " tests passed.");

  return test;
});
