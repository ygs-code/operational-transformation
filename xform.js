// This module defines the `xform` function which is at the heart of OT.

/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global define */
// var { operations: ops } = require("./operations");

// Pattern match on two edits by looking up their transforming function in
// the `xformTable`. Each function in the table should take arguments like
// the following:
//
//     xformer(editA, editB, indexA, indexB, continuation)
//
// and should return the results by calling the continuation
//
//     return continuation(editAPrime || null, editBPrime || null, newIndexA, newIndexB);

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory(require("./operations")))
    : typeof define === "function" && define.amd
    ? define("xform", ["operations"], factory)
    : (global.xform = factory(global.operations));
})(this, function (ops) {
  "use strict";

  var xformTable = {};

  function join(a, b) {
    return a + "," + b;
  }

  // Define a transformation function for when we are comparing two edits of
  // typeA and typeB.
  //定义一个转换函数for当我们比较两个编辑
  //类型a和类型b。
  function defXformer(typeA, typeB, xformer) {
    xformTable[join(typeA, typeB)] = xformer;
  }

  // // 插入
  // insert: insert,
  // // 删除
  // del: del,
  // // 保留
  // retain: retain,
  // // 判断是否是删除 保留，插入
  // type: type,
  // // 判断是否是保留如果是保留 则返回数字 否则返回字符串
  // val: val,

  // Assumptions currently made by all of the xformer functions: that all of
  // the individual edits only deal with one character at a time.
  //假设当前所有的xformer函数
  //单个编辑一次只处理一个字符。
  // 保留 保留
  defXformer("retain", "retain", function (editA, editB, indexA, indexB, k) {
    k(editA, editB, indexA + 1, indexB + 1);
  });
  // 删除  删除
  defXformer("delete", "delete", function (editA, editB, indexA, indexB, k) {
    if (ops.val(editA) === ops.val(editB)) {
      k(null, null, indexA + 1, indexB + 1);
    } else {
      throw new TypeError(
        "Document state mismatch: delete(" +
          ops.val(editA) +
          ") !== delete(" +
          ops.val(editB) +
          ")"
      );
    }
  });
  //  // 保留
  //  function retain(n) {
  //   return "r" + String(n);
  // }
  // 插入  插入
  defXformer("insert", "insert", function (editA, editB, indexA, indexB, k) {
    if (
      // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
      ops.val(editA) ===
      // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
      ops.val(editB)
    ) {
      k(
        // 保留
        ops.retain(1),
        // 保留
        ops.retain(1),
        indexA + 1,
        indexB + 1
      );
    } else {
      k(
        editA,
        // 保留
        ops.retain(1),
        indexA + 1,
        indexB
      );
    }
  });
  // 保留 删除
  defXformer("retain", "delete", function (editA, editB, indexA, indexB, k) {
    k(null, editB, indexA + 1, indexB + 1);
  });
  // 删除 保留
  defXformer("delete", "retain", function (editA, editB, indexA, indexB, k) {
    k(editA, null, indexA + 1, indexB + 1);
  });
  // 插入 保留
  defXformer("insert", "retain", function (editA, editB, indexA, indexB, k) {
    k(editA, editB, indexA + 1, indexB);
  });
  //保留  插入
  defXformer("retain", "insert", function (editA, editB, indexA, indexB, k) {
    k(editA, editB, indexA, indexB + 1);
  });
  //  插入   删除
  defXformer("insert", "delete", function (editA, editB, indexA, indexB, k) {
    k(
      editA,
      // 保留
      ops.retain(1),
      indexA + 1,
      indexB
    );
  });
  //删除  插入
  defXformer("delete", "insert", function (editA, editB, indexA, indexB, k) {
    k(
      // 保留
      ops.retain(1),
      editB,
      indexA,
      indexB + 1
    );
  });

  // exports.xform =
  return function (operationA, operationB, k) {
    var operationAPrime = [],
      operationBPrime = [],
      lenA = operationA.length, // 用户a字符串
      lenB = operationB.length, // 用户b字符串
      indexA = 0,
      indexB = 0,
      editA,
      editB,
      xformer;
    // Continuation for the xformer.
    // xformer的延续。
    function kk(
      aPrime, //编辑a文本
      bPrime, // 编辑b文本
      newIndexA, //编辑a索引
      newIndexB // 编辑b索引
    ) {
      indexA = newIndexA;
      indexB = newIndexB;
      if (aPrime) {
        operationAPrime.push(aPrime);
      }
      if (bPrime) {
        operationBPrime.push(bPrime);
      }
    }

    // // 判断是否是删除 保留，插入
    // function type(edit) {
    //   switch (edit.charAt(0)) {
    //     case "r":
    //       return "retain";
    //     case "d":
    //       return "delete";
    //     case "i":
    //       return "insert";
    //     default:
    //       throw new TypeError("Unknown type of edit: ", edit);
    //   }

    // 循环 a字符串 和b字符串
    while (indexA < lenA && indexB < lenB) {
      editA = operationA[indexA];
      editB = operationB[indexB];

      xformer =
        xformTable[
          join(
            // 判断是否是删除 保留，插入
            ops.type(editA),
            // 判断是否是删除 保留，插入
            ops.type(editB)
          )
        ];
      if (xformer) {
        //执行相应的函数
        xformer(
          editA, //编辑a文本
          editB, // 编辑b文本
          indexA, //编辑a索引
          indexB, // 编辑b索引
          kk // 回调函数
        );
      } else {
        throw new TypeError(
          "Unknown combination to transform: " +
            join(
              // 判断是否是删除 保留，插入
              ops.type(editA),
              // 判断是否是删除 保留，插入
              ops.type(editB)
            )
        );
      }
    }

    // If either operation contains more edits than the other, we just
    // pass them on to the prime version.

    for (; indexA < lenA; indexA++) {
      operationAPrime.push(operationA[indexA]);
      operationBPrime.push(
        // 保留
        ops.retain(1)
      );
    }

    for (; indexB < lenB; indexB++) {
      operationBPrime.push(operationB[indexB]);
      operationAPrime.push(
        // 保留
        ops.retain(1)
      );
    }
    console.log("operationAPrime=", operationAPrime);
    console.log("operationBPrime=", operationBPrime);
    return k(operationAPrime, operationBPrime);
  };
});
