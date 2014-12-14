'use strict';

Esquire.define('bletchley/crypto/AsyncCrypto', ['$promise', 'bletchley/utils/BoundClass'], function(Promise, BoundClass) {

    function promise(functionName) {

      /* Create and return our function */
      return function() {

        /* Prepare an array of values/promises */
        var promises = [];
        for (var i = 0; i < arguments.length; i ++) {
          promises.push(arguments[i])
        };

        /* Resolve our promises */
        var crypto = this.$crypto;
        var fn = crypto[functionName];
        return Promise.all(promises).then(function(args) {
          return fn.apply(crypto, args);
        });
      };
    }

    function AsyncCrypto(crypto) {
      if (!crypto) throw new Error("Crypto instance to wrap unspecified");

      Object.defineProperty(this, "$crypto", { enumerable: false, configurable: false, value: crypto });

      /* Bind and lock our functions */
      BoundClass.call(this);
    };

    AsyncCrypto.prototype = Object.create(BoundClass.prototype);
    AsyncCrypto.prototype.constructor = AsyncCrypto;

    AsyncCrypto.prototype.stringify = promise("stringify");
    AsyncCrypto.prototype.encode    = promise("encode");
    AsyncCrypto.prototype.decode    = promise("decode");
    AsyncCrypto.prototype.encrypt   = promise("encrypt");
    AsyncCrypto.prototype.decrypt   = promise("decrypt");
    AsyncCrypto.prototype.hash      = promise("hash");
    AsyncCrypto.prototype.hmac      = promise("hmac");
    AsyncCrypto.prototype.kdf       = promise("kdf");

    return AsyncCrypto;
  }
);
