/*
 * @Date: 2011-05-02 09:43:09
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-09 15:02:50
 * @FilePath: /operational-transformation/tests/tests.js
 * @Description:
 */
var { operations: ops } = require("../operations");
var { xform } = require("../xform");
var { apply } = require("../apply");

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
    b// 新的文本
  );
  
  // ot 算法函数
  xform(operationsA, operationsB, function (ap, bp) {
    numTests++;
    try {
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
    } catch (e) {
      failed++;
      console.log("  ERROR: " + e.message);
    }
  });
}

test("at", "tff", "fat", "ft");
// test("nick", "Nick", "nick is cool", "Nick is cool");
// test("sudo", "sumo", "suo", "sumo");
// test("hello", "Hello", "Hello", "Hello");
// test("care", "are", "are", "are");
// test("air", "fair", "lair", "flair");

console.log(numTests - failed + " / " + numTests + " tests passed.");
