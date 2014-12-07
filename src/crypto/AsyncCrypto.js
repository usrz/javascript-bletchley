'use strict';

Esquire.define('bletchley/crypto/AsyncCrypto', ['$promise', 'bletchley/crypto/Crypto'], function(Promise, Crypto) {

    function promise(functionName) {

      /* Create and return our function */
      return function() {

        /* Prepare an array of values/promises */
        var promises = [];
        for (var i = 0; i < arguments.length; i ++) {
          promises.push(arguments[i])
        };

        /* Resolve our promises */
        var fn = this.$crypto[functionName];
        return Promise.all(promises).then(function(args) {
          return fn.apply(crypto, args);
        });
      };
    }

    function AsyncCrypto(crypto) {
      if (!crypto) throw new Error("Crypto instance to wrap unspecified");

      Object.defineProperty(this, "$crypto", { enumerable: false, configurable: false, value: crypto });

      /* Bind and lock our functions */
      var factory = this;
      for (var i in factory) {
        (function(i, fn) {
          if (typeof(fn) !== 'function') return;

          /* Try to use native "bind" if possible */
          fn = typeof(fn.bind) !== 'function' ?
                      function() { return fn.apply(factory, arguments); } :
                      fn.bind(factory);

          /* Redefine and lock our function */
          Object.defineProperty(factory, i, {
            enumerable: factory.propertyIsEnumerable(i),
            configurable: false,
            value: fn
          });

        })(i, factory[i]);
      }


    };

    AsyncCrypto.prototype = Object.create(Crypto.prototype);
    AsyncCrypto.prototype.constructor = AsyncCrypto;

    AsyncCrypto.prototype.random    = promise("random");
    AsyncCrypto.prototype.stringify = promise("stringify");
    AsyncCrypto.prototype.encode    = promise("encode");
    AsyncCrypto.prototype.decode    = promise("decode");
    AsyncCrypto.prototype.hash      = promise("hash");
    AsyncCrypto.prototype.hmac      = promise("hmac");
    AsyncCrypto.prototype.kdf       = promise("kdf");


    return AsyncCrypto;
  }
);
