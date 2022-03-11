/*
 * @Date: 2022-03-09 15:11:33
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-09 17:49:05
 * @FilePath: /operational-transformation/cdn_ot.js
 * @Description:
 */

function client(op, doc) {
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
}

function errors() {
  var exports = {};
  var util = {
    inherits: () => {},
  };
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
}

function messages() {
  function defineGetSet(prop) {
    return function (obj, val) {
      return arguments.length === 2 ? (obj[prop] = val) : obj[prop];
    };
  }

  return {
    // The 'document' attribute is only defined for server responses to a
    // client connect.
    document: defineGetSet("doc"),
    revision: defineGetSet("rev"),
    operation: defineGetSet("op"),
    id: defineGetSet("id"),
  };
}

// Operations are a stream of individual edits which span the whole document
// from start to finish. Edits have a type which is one of retain, insert, or
// delete, and have associated data based on their type.

/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global define */

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

// 如果是保留
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

//  链表变成数组
// 循环链表 key cdr 取值到car字符串
function toArray() {
  var node = this,
    ary = [];
  while (node !== theEmptyList) {
    ary.push(node.car);
    node = node.cdr;
  }
  return ary;
}

//连接上一个和下一个对象
// cons(retain(1), prevEdits))
function cons(
  car, // 字符串
  cdr // 子对象
) {
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

// 添加到table中
function put(table, x, y, edits) {
  //
  return (table[String(x) + "," + String(y)] = edits);
}

// 获取table数据
function get(table, x, y) {
  // console.log('x===',x)
  // console.log('y===', y)
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

  put(table, 0, 0, theEmptyList);
  // console.log("new==", t);
  // 新的文本字符串的长度

  for (i = 1; i <= m; i += 1) {
    // console.log("insert(t.charAt(i - 1)=", insert(t.charAt(i - 1)));
    // console.log("get(table, i - 1, 0)=", get(table, i - 1, 0));
    // console.log(
    //   "cons=",
    //   cons(
    //     // return "i" + chars;  从第0个开始
    //     insert(t.charAt(i - 1)), //返回 return "i" + chars;  从第0个开始
    //     get(table, i - 1, 0) // 获取上一个table缓存的数据
    //   )
    // );
    put(
      table, // 把字符串缓存成对象数组
      i, // 索引
      0,
      cons(
        // return "i" + chars;  从第0个开始
        insert(t.charAt(i - 1)), //返回 return "i" + chars;  从第0个开始
        get(table, i - 1, 0) // 获取上一个table缓存的数据
      )
    );
  }
  console.log(" odd ==", s);
  // 旧的文本，服务器文本字符串的长度
  for (j = 1; j <= n; j += 1) {
    // console.log("del(t.charAt(j - 1)=", del(s.charAt(j - 1)));
    // console.log("get(table, 0, j=", get(table, 0, j - 1));
    // console.log(
    //   "cons=",
    //   cons(
    //     // return "i" + chars;  从第0个开始
    //     del(s.charAt(j - 1)), // 返回 return "d" + chars;  从第0个开始
    //     get(table, 0, j - 1) // 获取上一个table缓存的数据
    //   )
    // );
    put(
      table, // 把字符串缓存成对象数组
      0, //
      j,
      cons(
        del(s.charAt(j - 1)), //
        get(table, 0, j - 1)
      )
    );
  }
  // console.log("table========", table);
  // 返回链表
  return table;
}

//选择单元格
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
  console.log("left=", "x - 1=", x - 1, "y=", y);
  console.log("diagonal=", "x - 1=", x - 1, " y - 1=", y - 1);

  debugger;
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
    debugger;
  }
  // console.log()
  return k(direction, prevEdits);
}

let operations = {
  // Constructor for operations (which are a stream of edits). Uses
  // variation of Levenshtein Distance.
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
    //  新的"tff"
    for (i = 1; i <= m; i += 1) {
      // 旧的字符串"at"
      for (j = 1; j <= n; j += 1) {
        // console.log('i=',i)
        // console.log('j=',j)

        //
        chooseCell(
          edits,
          i, // 新的字符串索引
          j, //   旧的字符串索引
          function (direction, prevEdits) {
            // 在插入新的字符串
            switch (direction) {
              case "left":  // 插入
                debugger;
                put(edits, i, j, cons(insert(t.charAt(i - 1)), prevEdits));
                break;
              case "up":   // 删除
                debugger;
                put(edits, i, j, cons(del(s.charAt(j - 1)), prevEdits));
                break;
              case "diagonal": // 删除或者保留
                debugger;
                // 判断新的文本和旧的文本是否相同 d r i 等元素
                if (
                  s.charAt(j - 1) === // 旧的字符串"at"
                  t.charAt(i - 1) //  新的"tff"
                ) {
                  console.log("j - 1=", j - 1);
                  console.log("i - 1=", i - 1);
                  console.log("s=", s, "t=", t);
                  debugger;
                  // 如果是相同则保留
                  put(edits, i, j, cons(retain(1), prevEdits));
                } else {
                  debugger;
                  // 如果不相同则记录需要删除
                  put(
                    edits,
                    i,
                    j,
                    cons(
                      insert(t.charAt(i - 1)), // 插入新的文本
                      cons(del(s.charAt(j - 1)), prevEdits) // 删除旧的文本
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
    console.log('edits=================',edits)
    console.log('m========',m)
    console.log('n========',n)
    return get(edits, m, n).toArray().reverse();  // 翻转
  },

  insert: insert,
  del: del,
  retain: retain,
  type: type,
  val: val,

  isDelete: function (edit) {
    return typeof edit === "object" && type(edit) === "delete";
  },

  isRetain: function (edit) {
    return typeof edit === "object" && type(edit) === "retain";
  },

  isInsert: function (edit) {
    return typeof edit === "object" && type(edit) === "insert";
  },
};

// var events = require("events");
// var { messages } = require("./messages");
// var { apply } = require("./apply");
// var { errors } = require("./errors");

function nop() {}

function error(msg) {
  throw new Error(msg);
}

function ot(opts) {
  var store = opts.store || error("store is required"),
    manager = new events.EventEmitter();

  manager.newDocument = function (callback) {
    callback = callback || nop;
    store.newDocument(
      function (err, doc) {
        if (err) {
          this.emit("error", err);
          return callback(err, null);
        } else {
          this.emit("new", doc);
          return callback(null, doc);
        }
      }.bind(this)
    );
  };

  manager.applyOperation = function (message) {
    var id = messages.id(message),
      newRev = messages.revision(message),
      op = messages.operation(message),
      emit = this.emit.bind(this);

    store.getDocument(id, function (err, doc) {
      if (err) {
        emit("error", err);
      } else {
        if (newRev === doc.rev + 1) {
          try {
            doc.doc = apply(op, doc.doc);
          } catch (e) {
            emit("error", e);
            return;
          }

          doc.rev++;
          store.saveDocument(doc, function (err, doc) {
            var msg;
            if (err) {
              // Bad revisions aren't considered an error at this
              // level, just ignored.
              if (!(err instanceof errors.BadRevision)) {
                emit("error", err);
              }
            } else {
              msg = {};
              messages.revision(msg, doc.rev);
              messages.id(msg, doc.id);
              messages.operation(msg, op);
              messages.document(msg, doc.doc);
              emit("update", msg);
            }
          });
        }
      }
    });
  };

  return manager;
}

var xformTable = {};

function join(a, b) {
  return a + "," + b;
}

// Define a transformation function for when we are comparing two edits of
// typeA and typeB.
function defXformer(typeA, typeB, xformer) {
  xformTable[join(typeA, typeB)] = xformer;
}

// Assumptions currently made by all of the xformer functions: that all of
// the individual edits only deal with one character at a time.

defXformer("retain", "retain", function (editA, editB, indexA, indexB, k) {
  k(editA, editB, indexA + 1, indexB + 1);
});

defXformer("delete", "delete", function (editA, editB, indexA, indexB, k) {
  if (operations.val(editA) === operations.val(editB)) {
    k(null, null, indexA + 1, indexB + 1);
  } else {
    throw new TypeError(
      "Document state mismatch: delete(" +
        operations.val(editA) +
        ") !== delete(" +
        operations.val(editB) +
        ")"
    );
  }
});

defXformer("insert", "insert", function (editA, editB, indexA, indexB, k) {
  if (operations.val(editA) === operations.val(editB)) {
    k(operations.retain(1), operations.retain(1), indexA + 1, indexB + 1);
  } else {
    k(editA, operations.retain(1), indexA + 1, indexB);
  }
});

defXformer("retain", "delete", function (editA, editB, indexA, indexB, k) {
  k(null, editB, indexA + 1, indexB + 1);
});

defXformer("delete", "retain", function (editA, editB, indexA, indexB, k) {
  k(editA, null, indexA + 1, indexB + 1);
});

defXformer("insert", "retain", function (editA, editB, indexA, indexB, k) {
  k(editA, editB, indexA + 1, indexB);
});

defXformer("retain", "insert", function (editA, editB, indexA, indexB, k) {
  k(editA, editB, indexA, indexB + 1);
});

defXformer("insert", "delete", function (editA, editB, indexA, indexB, k) {
  k(editA, operations.retain(1), indexA + 1, indexB);
});

defXformer("delete", "insert", function (editA, editB, indexA, indexB, k) {
  k(operations.retain(1), editB, indexA, indexB + 1);
});

function xform(operationA, operationB, k) {
  var operationAPrime = [],
    operationBPrime = [],
    lenA = operationA.length,
    lenB = operationB.length,
    indexA = 0,
    indexB = 0,
    editA,
    editB,
    xformer;

  // Continuation for the xformer.
  function kk(aPrime, bPrime, newIndexA, newIndexB) {
    indexA = newIndexA;
    indexB = newIndexB;
    if (aPrime) {
      operationAPrime.push(aPrime);
    }
    if (bPrime) {
      operationBPrime.push(bPrime);
    }
  }

  while (indexA < lenA && indexB < lenB) {
    editA = operationA[indexA];
    editB = operationB[indexB];
    xformer = xformTable[join(operations.type(editA), operations.type(editB))];
    console.log('xformer=',xformer)
    if (xformer) {
      xformer(editA, editB, indexA, indexB, kk);
    } else {
      throw new TypeError(
        "Unknown combination to transform: " +
          join(operations.type(editA), operations.type(editB))
      );
    }
  }

  // If either operation contains more edits than the other, we just
  // pass them on to the prime version.

  for (; indexA < lenA; indexA++) {
    operationAPrime.push(operationA[indexA]);
    operationBPrime.push(operations.retain(1));
  }

  for (; indexB < lenB; indexB++) {
    operationBPrime.push(operationB[indexB]);
    operationAPrime.push(operations.retain(1));
  }

  return k(operationAPrime, operationBPrime);
}

var numTests = 0;
var failed = 0;
function test(
  original, // 旧的文本，服务器文本
  a, // 文本a
  b, // 文本b
  expected // 合并后的预期文本
) {
  var operationsA = operations.operation(
    original, // 旧的文本，服务器文本
    a // 新的文本
  );
  console.log('operationsA=',operationsA)
//   return;
  var operationsB = operations.operation(
    original, // 旧的文本，服务器文本
    b // 新的文本
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
