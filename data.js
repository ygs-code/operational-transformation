/*
 * @Date: 2022-03-09 11:02:51
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-23 12:02:57
 * @FilePath: /operational-transformation/data.js
 * @Description:
 */
let toArray = [1];
let odd = "at";
let newStr = "tff";
let table = {
  "0,0": { length: 0 },
  "1,0": { car: "ix", cdr: { length: 0 }, length: 1 },
  "2,0": {
    car: "ia",
    cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
    length: 2,
  },
  "3,0": {
    car: "ib",
    cdr: {
      car: "ia",
      cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
      length: 2,
    },
    length: 3,
  },
  "4,0": {
    car: "ic",
    cdr: {
      car: "ib",
      cdr: {
        car: "ia",
        cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
  "0,1": { car: "da", cdr: { length: 0 }, length: 1 },
  "0,2": {
    car: "db",
    cdr: { car: "da", cdr: { length: 0 }, length: 1 },
    length: 2,
  },
  "0,3": {
    car: "dc",
    cdr: {
      car: "db",
      cdr: { car: "da", cdr: { length: 0 }, length: 1 },
      length: 2,
    },
    length: 3,
  },
  "1,1": {
    car: "ix",
    cdr: { car: "da", cdr: { length: 0 }, length: 1 },
    length: 2,
  },
  "1,2": {
    car: "ix",
    cdr: {
      car: "db",
      cdr: { car: "da", cdr: { length: 0 }, length: 1 },
      length: 2,
    },
    length: 3,
  },
  "1,3": {
    car: "ix",
    cdr: {
      car: "dc",
      cdr: {
        car: "db",
        cdr: { car: "da", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
  "2,1": {
    car: "r1",
    cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
    length: 2,
  },
  "2,2": {
    car: "db",
    cdr: {
      car: "r1",
      cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
      length: 2,
    },
    length: 3,
  },
  "2,3": {
    car: "dc",
    cdr: {
      car: "db",
      cdr: {
        car: "r1",
        cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
  "3,1": {
    car: "ib",
    cdr: {
      car: "r1",
      cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
      length: 2,
    },
    length: 3,
  },
  "3,2": {
    car: "r1",
    cdr: {
      car: "r1",
      cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
      length: 2,
    },
    length: 3,
  },
  "3,3": {
    car: "dc",
    cdr: {
      car: "r1",
      cdr: {
        car: "r1",
        cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
  "4,1": {
    car: "ic",
    cdr: {
      car: "ib",
      cdr: {
        car: "r1",
        cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
  "4,2": {
    car: "ic",
    cdr: {
      car: "r1",
      cdr: {
        car: "r1",
        cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
  "4,3": {
    car: "r1",
    cdr: {
      car: "r1",
      cdr: {
        car: "r1",
        cdr: { car: "ix", cdr: { length: 0 }, length: 1 },
        length: 2,
      },
      length: 3,
    },
    length: 4,
  },
};

console.log(table);
debugger;
