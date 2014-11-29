'use strict';

Esquire.define('bletchley/crypto/AsyncCrypto', ['$promise', 'bletchley/crypto/Crypto'], function(Promise, Crypto) {

  function promise(crypto, functionName) {
    return function() {
      if (!(typeof(arguments[0]) === 'string')) {
        throw new TypeError("Algorithm must be a string");
      }

      /* Prepare an array of values/promises */
      var promises = [ crypto, arguments[0] ];
      for (var i = 1; i < arguments.length; i ++) {
        promises.push(arguments[i])
      };

      /* Resolve our promises */
      return Promise.all(promises).then(function(args) {
        var crypto = args.splice(0, 1)[0];

        if (typeof(crypto[functionName]) === 'function') {
          return crypto[functionName].apply(crypto, args);
        } else {
          throw new TypeError("'" + functionName + "' is not a function");
        }

      });
    };
  }

  function AsyncCrypto(crypto) {

    this.stringify = function(array) {
      return Promise.resolve(array).then(function(array) {
        return crypto.stringify(array);
      })
    };

    this.encode = promise(crypto, "encode");
    this.decode = promise(crypto, "decode");
    this.hash   = promise(crypto, "hash");
    this.hmac   = promise(crypto, "hmac");

    Object.freeze(this);
  }

  AsyncCrypto.prototype = Object.create(Crypto.prototype);
  AsyncCrypto.prototype.constructor = AsyncCrypto;
  AsyncCrypto.prototype.name = "AsyncCrypto";

  /* Return our function */
  return AsyncCrypto;

});
