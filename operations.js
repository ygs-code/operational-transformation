// Operations are a stream of individual edits which span the whole document
// from start to finish. Edits have a type which is one of retain, insert, or
// delete, and have associated data based on their type.

/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global define */

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define("operations", [], factory)
    : (global.operations = factory());
})(this, function () {
  "use strict";

  // Simple edit constructors.
  // 插入
  function insert(chars) {
    return "i" + chars;
  }

  // 删除
  function del(chars) {
    return "d" + chars;
  }

  // 保留
  function retain(n) {
    return "r" + String(n);
  }

  // 判断是否是删除 保留，插入
  function type(edit) {
    switch (edit.charAt(0)) {
      case "r":
        return "retain";
      case "d":
        return "delete";
      case "i":
        return "insert";
      default:
        throw new TypeError("Unknown type of edit: ", edit);
    }
  }

  // 如果是保留则返回数字 获取字符串 从第一个开始去掉前面的
  function val(edit) {
    return type(edit) === "r" ? Number(edit.slice(1)) : edit.slice(1);
  }

  // We don't want to copy arrays all the time, aren't mutating lists, and
  // only need O(1) prepend and length, we can get away with a custom singly
  // linked list implementation.

  // TODO: keep track of number of non-retain edits and use this instead of
  // length when choosing which path to take.
  //我们不希望总是复制数组，不是可变的列表，和
  //只需要O(1)前置和长度，我们可以单独定制
  //链表实现。

  // TODO:跟踪非保留编辑的数量，并使用这个代替
  //选择路径时的长度。

  var theEmptyList = {
    length: 0,
    toArray: function () {
      return [];
    },
  };

  // 链表转换数组
  function toArray() {
    var node = this,
      ary = [];
    // 如果当前节点不是头节点一直向上找
    while (node !== theEmptyList) {
      ary.push(node.car);
      node = node.cdr;
    }
    return ary;
  }

  //连接上一个和下一个对象 形成一个链表
  function cons(car, cdr) {
    return {
      car: car, //返回 return    "i" + chars;    "d" + chars;   "r" + chars;
      cdr: cdr, // 获取上一个table缓存的数据 把他变成一个链表连接起来
      length: 1 + cdr.length, // 添加长度
      toArray: toArray,
    };
  }

  //抽象出表，如果我想编辑实现到
  //数组的数组之类的。
  // Abstract out the table in case I want to edit the implementation to
  // arrays of arrays or something.

  // 添加到把对象edits添加到table对象中
  function put(table, x, y, edits) {
    //
    return (table[String(x) + "," + String(y)] = edits);
  }

  // 获取table数据
  function get(table, x, y) {
    var edits = table[String(x) + "," + String(y)];
    if (edits) {
      return edits;
    } else {
      throw new TypeError("No operation at " + String(x) + "," + String(y));
    }
  }

  //编辑表 返回链表数据
  function makeEditsTable(
    s, // 旧的文本，服务器文本
    t // 新的文本
  ) {
    var table = {},
      n = s.length, // 旧的文本，服务器文本字符串的长度
      m = t.length, // 新的文本字符串的长度
      i,
      j;
    // 添加到把对象edits添加到table对象中
    // 添加一个初始化对象
    put(table, 0, 0, theEmptyList);
    console.log("new==", t);
    // 循环新的文本字符串的长度
    for (i = 1; i <= m; i += 1) {
      // 添加到把对象edits添加到table对象中
      put(
        table, // 把字符串缓存成对象数组
        i, // 索引
        0,
        cons(
          // return "i" + chars;  从第0个开始
          insert(t.charAt(i - 1)), //返回 return "i" + chars;  从第0个开始
          get(table, i - 1, 0) // 获取上一个table缓存的数据 把上一级的字符串链表插入到子链表中
        )
      );
    }

    console.log(" odd ==", s);
    // 旧的文本，服务器文本字符串的长度
    for (j = 1; j <= n; j += 1) {
      console.log("del(t.charAt(j - 1)=", del(s.charAt(j - 1)));
      console.log("get(table, 0, j=", get(table, 0, j - 1));
      console.log(
        "cons=",
        cons(
          // return "i" + chars;  从第0个开
          del(s.charAt(j - 1)), // 返回 return "d" + chars;  从第0个开始
          get(table, 0, j - 1) // 获取上一个table缓存的数据
        )
      );
      // 添加到把对象edits添加到table对象中
      put(
        table, // 把字符串缓存成对象数组
        0, //
        j, // 索引
        cons(
          del(s.charAt(j - 1)), //
          get(table, 0, j - 1)
        )
      );
    }

    console.log("table========", table);

    // 返回链表
    return table;
  }

  //选择单元格对比上面和左边对比算出下一个table格的数据，这里用到的类似动态规划算法
  function chooseCell(
    table, // 链表
    x, //   新的文本字符串指针
    y, //  旧的文本字符串指针
    k // 回调函数
  ) {
    // 获取上一次编辑
    var prevEdits = get(
        table,
        x, //   新的文本字符串指针
        y - 1 //  旧的文本字符串指针
      ),
      min = prevEdits.length,
      direction = "up";

    console.log("table=", table);
    console.log("prevEdits=", prevEdits);
    console.log("prevEdits x y=", "x=", x, "y-1=", y - 1);
    console.log("up=", "x=", x, "y - 1 =", y - 1);
    console.log("left=", "x - 1=", x - 1, "y=", y);
    console.log("diagonal=", "x - 1=", x - 1, " y - 1=", y - 1);
    console.log("add=", "x=", x, " y =", y);

    if (
      get(
        table,
        x - 1, //   新的文本字符串指针
        y //  旧的文本字符串指针
      ).length < min
    ) {
      prevEdits = get(
        table,
        x - 1, //   新的文本字符串指针
        y //  旧的文本字符串指针
      );
      min = prevEdits.length;
      direction = "left";
      debugger;
    }

    if (
      get(
        table,
        x - 1, //   新的文本字符串指针
        y - 1 //  旧的文本字符串指针
      ).length < min
    ) {
      prevEdits = get(
        table,
        x - 1, //   新的文本字符串指针
        y - 1 //  旧的文本字符串指针
      );
      min = prevEdits.length;
      direction = "diagonal";
    }
    console.log("direction=", direction);
    debugger;
    // console.log()
    return k(direction, prevEdits);
  }

  return {
    // Constructor for operations (which are a stream of edits). Uses
    // variation of Levenshtein Distance.
    // 通过动态规划算法 获取到 字符串是 保留还是新增还是删除
    operation: function (
      s, // 旧的文本，服务器文本
      t // 新的文本
    ) {
      var n = s.length, //旧的文本，服务器文本字符串的长度
        m = t.length, // 新的文本字符串的长度
        i,
        j,
        // 返回链表
        edits = makeEditsTable(
          s, // 旧的文本，服务器文本
          t // 新的文本
        );
      // console.log("edits makeEditsTable=======", edits);
      // console.log("m=======", m);
      // console.log("n=======", n);
      //   两层嵌套 时间复杂度为 o(n^2)  空间复杂度为 o(2*long)
      //  新的"abc"
      for (i = 1; i <= m; i += 1) {
        // 旧的字符串"xabc"
        for (j = 1; j <= n; j += 1) {
          // console.log('i=',i)
          // console.log('j=',j)

          //选择单元格对比上面和左边对比算出下一个table格的数据，这里用到的类似动态规划算法
          chooseCell(
            edits, //  链表
            i, // 新的字符串索引
            j, //   旧的字符串索引 j先 开始增长 再到  i 增长 所以开始 1,1->1,2->1,3
            function (direction, prevEdits) {
              // 在插入新的字符串
              switch (direction) {
                case "left": // 插入
                  put(edits, i, j, cons(insert(t.charAt(i - 1)), prevEdits));
                  console.log("edits1========", edits);
                  debugger;
                  break;
                case "up": // 删除
                  debugger;
                  put(edits, i, j, cons(del(s.charAt(j - 1)), prevEdits));
                  break;
                case "diagonal": // 删除或者保留
                  // 判断新的文本和旧的文本是否相同
                  if (
                    s.charAt(j - 1) === // 旧的字符串"abc"
                    t.charAt(i - 1) //  新的"xabc"
                  ) {
                    console.log("j - 1=", j - 1);
                    console.log("i - 1=", i - 1);
                    console.log("s=", s, "t=", t);

                    // 如果是相同则保留
                    put(
                      edits,
                      i,
                      j,
                      cons(
                        retain(1), //保留字符串比如 xabc , abc     第一个a r1为 2,1
                        prevEdits
                      )
                    );
                    console.log("edits==========", edits);
                    debugger;
                  } else {
                    debugger;
                    // 如果不相同则记录需要删除
                    put(
                      // 链表
                      edits,
                      i,
                      j,
                      cons(
                        insert(t.charAt(i - 1)), // 插入新的文本
                        cons(
                          //
                          del(s.charAt(j - 1)), // 删除旧的文本
                          prevEdits
                        )
                      )
                    );
                  }
                  break;
                default:
                  throw new TypeError("Unknown direction.");
              }
            }
          );
        }
      }
      console.log("edits=================", JSON.stringify(edits));
      console.log("m========", m);
      console.log("n========", n);
      console.log(
        "get(edits, m, n).toArray().reverse()========",
        get(edits, m, n).toArray().reverse()
      );
      return get(edits, m, n).toArray().reverse(); // 翻转
    },
    // 插入
    insert: insert,
    // 删除
    del: del,
    // 保留
    retain: retain,
    // 判断是否是删除 保留，插入
    type: type,
    // 判断是否是保留如果是保留 则返回数字 否则返回字符串
    val: val,
    // 判断是否是删除
    isDelete: function (edit) {
      return typeof edit === "object" && type(edit) === "delete";
    },
    // 判断是否保留
    isRetain: function (edit) {
      return typeof edit === "object" && type(edit) === "retain";
    },
    // 判断是否插入
    isInsert: function (edit) {
      return typeof edit === "object" && type(edit) === "insert";
    },
  };
});
