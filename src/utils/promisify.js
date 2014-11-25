'use strict';

Esquire.define('bletchley/utils/promisify', ['$promise'], function(Promise) {

  return function(context, fn) {
    if (typeof(fn) !== 'function') throw new Error("Can only promisify functions: ", fn);

    return function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(Promise.resolve(arguments[i]));
      };
      return Promise.all(args).then(function(args) {
        return fn.apply(context, args);
      });
    }
  }

});
