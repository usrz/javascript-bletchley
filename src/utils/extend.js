'use strict';

Esquire.define('bletchley/utils/extend', [], function() {

  function extend(extendedClass, baseClass, prototypeName) {
    if (typeof(extendedClass) !== 'function') throw new Error("Extended class nota function");
    if (typeof(baseClass) !== 'function') throw new Error("Base class nota function");

    extendedClass.prototype = Object.create(baseClass.prototype);
    extendedClass.prototype.constructor = extendedClass;

    if (typeof(prototypeName) === 'undefined') prototypeName = extendedClass.name;
    if (prototypeName) extendedClass.prototype.name = prototypeName;

    return extendedClass;
  };

  // extend.promisify = function(what) {
  //   for (var member in what) {
  //     if (typeof(what[member]) === 'function') {
  //       what[member] = (function(member, fn) {
  //         return function() {
  //           var args = [];
  //           for (var i = 0; i < arguments.length; i++) {
  //             args.push(Promise.resolve(arguments[i]));
  //           };
  //           return Promise.all(args).then(function(args) {
  //             return fn.apply(what, args);
  //           });
  //         }
  //       })(member, what[member]);
  //     }
  //   }
  //   return what;
  // }

  // extend.solidify = function(what) {
  //   for (var member in what) {
  //     if (typeof(what[member]) === 'function') {
  //       what[member] = (function(member, fn) {
  //         return function() {
  //           return fn.apply(what, arguments)
  //         }
  //       })(member, what[member]);
  //     }
  //   }
  //   return what;
  // }

  return extend;

});
