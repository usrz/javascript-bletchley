'use strict';

Esquire.define('mocha/promises', ['$esquire', 'defers/Promise'], function($esquire, Promise) {

  function resolve() {
    return Promise.resolve.apply(Promise, arguments);
  }

  function promises(title, fn, extra) {
    var itname = extra ? "it." + extra : "it";
    var it = $esquire.require("$global/" + itname);
    if (typeof(it) !== 'function') throw new Error("Mocha's '" + itname + "' unavailable");

    return it(title, function(done) {
      var e;
      try {
        var promise = fn.call(this, resolve);
        if (promise && (typeof(promise.then) === 'function')) {
          promise.then(function(success) {
            //console.info("Resolved: ", success);
            done(e);
          }, function(failure) {
            console.warn("Rejected: ", failure);
            done(failure);
          })
        } else {
          var type = typeof(promise);
          if (type === 'object') {
            if (promise === null) {
              type = 'null';
            } else if (Array.isArray(promise)) {
              type = 'array';
            }
          }
          done(new Error("Test did not return a Promise but '" + type + "'"));
        }
      } catch (error) {
        console.warn("Failed:", error);
        done(e = error);
      }
    });
  };

  promises.skip = function(title, fn) {
    return promises(title, fn, 'skip');
  }

  promises.only = function(title, fn) {
    return promises(title, fn, 'only');
  }

  return promises;

  // function instrument(it) {
  //   //console.log("Instrumenting", it);
  //   it['promises'] = promises(it);
  //   for (var i in it) {
  //     var fn = promises(it[i]);
  //     it[i].promises = fn;
  //     it.promises[i] = fn;
  //   }
  //   return it;
  // }

  // instrument(it);

  // try {
  //   console.log('HERE');
  //   var ref = { it: global.it };
  //   Object.defineProperty(global, 'it', {
  //     set: function(it) { ref.it = instrument(it) },
  //     get: function() { return ref.it },
  //     configurable: false,
  //     enumerable: true,
  //   });
  // } catch (error) {
  //   console.warn("Error: " + error);
  // }

});

