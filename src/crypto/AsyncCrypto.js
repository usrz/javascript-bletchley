'use strict';

Esquire.define('bletchley/crypto/AsyncCrypto', ['$promise', 'bletchley/crypto/Crypto'], function(Promise, Crypto) {

    function promise(crypto, functionName) {
      var fn = crypto[functionName];
      if (typeof(fn) !== 'function') {
        throw new Error("Invalid function '" + functionName + "'");
      }

      /* Create and return our function */
      return function() {

        /* Prepare an array of values/promises */
        var promises = [];
        for (var i = 0; i < arguments.length; i ++) {
          promises.push(arguments[i])
        };

        /* Resolve our promises */
        return Promise.all(promises).then(function(args) {
          return fn.apply(crypto, args);
        });
      };
    }

    function AsyncCrypto(crypto) {
      if (!crypto) throw new Error("Crypto instance to wrap unspecified");

      if (! this.random)    Object.defineProperty(this, "random",    { enumerable: true, configurable: false, value: promise(crypto, "random")    });
      if (! this.stringify) Object.defineProperty(this, "stringify", { enumerable: true, configurable: false, value: promise(crypto, "stringify") });
      if (! this.encode)    Object.defineProperty(this, "encode",    { enumerable: true, configurable: false, value: promise(crypto, "encode")    });
      if (! this.decode)    Object.defineProperty(this, "decode",    { enumerable: true, configurable: false, value: promise(crypto, "decode")    });
      if (! this.hash)      Object.defineProperty(this, "hash",      { enumerable: true, configurable: false, value: promise(crypto, "hash")      });
      if (! this.hmac)      Object.defineProperty(this, "hmac",      { enumerable: true, configurable: false, value: promise(crypto, "hmac")      });
      if (! this.kdf)       Object.defineProperty(this, "kdf",       { enumerable: true, configurable: false, value: promise(crypto, "kdf")       });
    }

    AsyncCrypto.prototype = Object.create(Crypto.prototype);
    AsyncCrypto.prototype.constructor = AsyncCrypto;
    AsyncCrypto.prototype.name = "AsyncCrypto";

    /* Return our function */
    return AsyncCrypto;

  }
);
