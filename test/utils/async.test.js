'use strict';

Esquire.define('test/async', ['$promise'], function(Promise) {

  return function(async) {

    if (async) {
      return function(fn) {
        var promise = (typeof(fn) === 'function') ? fn() : fn;
        if (promise && (typeof(promise.then) === 'function')) {
          return promise;
        } else {
          throw new Error("Should return a promise instead of " + typeof(promise));
        }
      }
    } else {
      return function(fn) {
        var result;
        try {
          result = (typeof(fn) === 'function') ? fn() : fn;
        } catch (error) {
          return Promise.reject(error);
        }
        if (result && (typeof(result.then) === 'function')) {
          throw new Error("Should not return a promise in synchronous test");
        } else {
          return Promise.resolve(result);
        }
      }
    }
  };

});
