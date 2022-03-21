/*
 * @Date: 2011-05-02 09:43:09
 * @Author: Yao guan shou
 * @LastEditors: Yao guan shou
 * @LastEditTime: 2022-03-21 15:17:23
 * @FilePath: /operational-transformation/messages.js
 * @Description:
 */
// This modules loosely defines the message protocol used to pass operations and
// documents between the client and server. Mostly it is just a common
// abstraction both the client and server can use when creating, manipulating,
// and using messages.

/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global define */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define("messages", [], factory)
    : (global.messages = factory());
})(this, function () {
  "use strict";
  function defineGetSet(prop) {
    return function (obj, val) {
      return arguments.length === 2 ? (obj[prop] = val) : obj[prop];
    };
  }

  // exports.messages =
  return {
    // The 'document' attribute is only defined for server responses to a
    // client connect.
    document: defineGetSet("doc"),
    revision: defineGetSet("rev"),
    operation: defineGetSet("op"),
    id: defineGetSet("id"),
  };
});
