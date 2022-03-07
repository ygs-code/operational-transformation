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

// 数组链表
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
function cons(
    car, 
    cdr
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
  console.log("new==", t);
  // 新的文本字符串的长度

  for (i = 1; i <= m; i += 1) {
    console.log("insert(t.charAt(i - 1)=", insert(t.charAt(i - 1)));
    console.log("get(table, i - 1, 0)=", get(table, i - 1, 0));
    console.log("cons=",    cons(
        // return "i" + chars;  从第0个开始
        insert(t.charAt(i - 1)), //返回 return "i" + chars;  从第0个开始
        get(table, i - 1, 0) // 获取上一个table缓存的数据
      ));
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
    console.log("del(t.charAt(j - 1)=", del(s.charAt(j - 1)));
    console.log("get(table, 0, j=", get(table, 0, j - 1));
    console.log("cons=",    cons(
        // return "i" + chars;  从第0个开始
        del(s.charAt(j - 1)), // 返回 return "d" + chars;  从第0个开始
        get(table, 0, j - 1) // 获取上一个table缓存的数据
      ));
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
  console.log('table========',table)
  // 返回链表 
  return table;
}

// 
function chooseCell(
    table, // 链表
    x,  //
    y, // 
    k // 回调函数
    ) {
   // 获取上一次编辑     
  var prevEdits = get(table, x, y - 1),
    min = prevEdits.length,
    direction = "up";
   console.log('prevEdits=',prevEdits)
  if (get(table, x - 1, y).length < min) {
    prevEdits = get(table, x - 1, y);
    min = prevEdits.length;
    direction = "left";
  }

  if (get(table, x - 1, y - 1).length < min) {
    prevEdits = get(table, x - 1, y - 1);
    min = prevEdits.length;
    direction = "diagonal";
  }

  return k(direction, prevEdits);
}

exports.operations = {
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
    //   两层嵌套 时间复杂度为 o(n^2)  空间复杂度为 o(2*long)
    for (i = 1; i <= m; i += 1) {
      for (j = 1; j <= n; j += 1) {
        chooseCell(edits, i, j, function (direction, prevEdits) {
          switch (direction) {
            case "left":
              put(edits, i, j, cons(insert(t.charAt(i - 1)), prevEdits));
              break;
            case "up":
              put(edits, i, j, cons(del(s.charAt(j - 1)), prevEdits));
              break;
            case "diagonal":
              if (s.charAt(j - 1) === t.charAt(i - 1)) {
                put(edits, i, j, cons(retain(1), prevEdits));
              } else {
                put(
                  edits,
                  i,
                  j,
                  cons(
                    insert(t.charAt(i - 1)),
                    cons(del(s.charAt(j - 1)), prevEdits)
                  )
                );
              }
              break;
            default:
              throw new TypeError("Unknown direction.");
          }
        });
      }
    }

    return get(edits, m, n).toArray().reverse();
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
