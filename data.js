/*
 * @Date: 2022-03-09 11:02:51
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-09 14:57:02
 * @FilePath: /operational-transformation/data.js
 * @Description:
 */
let toArray = [1];
let odd = "at";
let newStr = "tff";
let table = {
  "0,0": { length: 0, toArray: [toArray] },
  "1,0": {
    car: "it",
    cdr: { length: 0, toArray: [toArray] },
    length: 1,
    toArray: [toArray],
  },
  "2,0": {
    car: "if",
    cdr: {
      car: "it",
      cdr: { length: 0, toArray: [toArray] },
      length: 1,
      toArray: [toArray],
    },
    length: 2,
    toArray: [toArray],
  },
  "3,0": {
    car: "if",
    cdr: {
      car: "if",
      cdr: {
        car: "it",
        cdr: { length: 0, toArray: [toArray] },
        length: 1,
        toArray: [toArray],
      },
      length: 2,
      toArray: [toArray],
    },
    length: 3,
    toArray: [toArray],
  },
  "0,1": {
    car: "da",
    cdr: { length: 0, toArray: [toArray] },
    length: 1,
    toArray: [toArray],
  },
  "0,2": {
    car: "dt",
    cdr: {
      car: "da",
      cdr: { length: 0, toArray: [toArray] },
      length: 1,
      toArray: [toArray],
    },
    length: 2,
    toArray: [toArray],
  },
};

console.log(table);
debugger
