'use strict';

Esquire.define('bletchley/crypto/SubtleCrypto', [ '$deferred',
                                                  '$promise',
                                                  '$global',
                                                  '$global/crypto.subtle',
                                                  'bletchley/utils/arrays',
                                                  'bletchley/crypto/AsyncCrypto' ],
function(Deferred, Promise, global, subtle, arrays, AsyncCrypto, kdfs) {

  var msCrypto = subtle && (subtle === (global.msCrypto && global.msCrypto.subtle)) || false;

  var wrapper = {};
  if (subtle) {
    for (var i in subtle) {
      (function(i) {
        if (typeof(subtle[i]) === 'function') {
          var method = subtle[i];
          wrapper[i] = function() {
            var promise;

            try {
              promise = method.apply(subtle, arguments);
            } catch (error) {
              return Promise.reject(error);
            }

            if (promise) {

              /* Standard W3C Crypto returning promises */
              if (typeof(promise.then) === 'function') {
                return promise;
              }

              /* M$ Crypto implementation returning CryptoOperations */
              if (typeof(promise.addEventListener) === 'function') {
                var deferred = new Deferred();

                promise.addEventListener('complete', function(event) {
                  try {
                    deferred.resolve(event.target.result);
                  } catch (error) {
                    deferred.reject(error);
                  }
                });

                promise.addEventListener('error', function(event) {
                  deferred.reject(new Error("Crypto operation '" + i + "' failed"));
                });

                promise.addEventListener('abort', function(event) {
                  var error = new Error("Crypto operation '" + i + "' aborted");
                  error.event = event;
                  deferred.reject(error);
                });

                return deferred.promise;
              }
            }

            /* Dunno what to return */
            var error = new Error("Unknown crypto operation result from '" + i + "'");
            error.result = promise;
            return Promise.reject(error);
          }
        }
      })(i);

    }
  }

  function SubtleCrypto(crypto) {

    /* Must have an asynchronous crypto */
    if (!(crypto instanceof AsyncCrypto)) crypto = new AsyncCrypto(crypto);

    /* Simple pass-through of methods */
    this.random    = crypto.random;
    this.stringify = crypto.stringify;
    this.encode    = crypto.encode;
    this.decode    = crypto.decode;
    this.kdf       = crypto.kdf;

    this.hash = function(algorithm, message) {
      if (!(wrapper.digest)) return crypto.hash.apply(crypto, arguments);

      return Promise.resolve(message).then(function(message) {

        message = arrays.toUint8Array(message);

        /* Remember, MSIE does not trigger failures, just hangs forever */
        if (msCrypto && (message.length === 0)) {
          return crypto.hash(algorithm, message);
        }

        return wrapper.digest({ name: algorithm }, message)
        .then(function(result) {
          return arrays.toUint8Array(result);
        }, function(error) {
          return crypto.hash(algorithm, message)
            .catch(function(failure) { throw error });
        });
      });
    };

    this.hmac = function(algorithm, salt, secret) {
      if (!(wrapper.importKey)) return crypto.hmac.apply(crypto, arguments);
      if (!(wrapper.sign))      return crypto.hmac.apply(crypto, arguments);

      return Promise.all([salt, secret]).then(function(result) {
        var salt = arrays.toUint8Array(result[0]);
        var secret = arrays.toUint8Array(result[1]);

        /* Remember, MSIE does not trigger failures, just hangs forever */
       if (msCrypto && (secret.length === 0)) {
         return crypto.hmac(algorithm, salt, secret);
       }

        /* Parameters, HMAC with our algorithm */
        var parameters = { name: "HMAC", hash: { name: algorithm } };

        /* Need to use two promises: the first is for importing the salt */
        return wrapper.importKey("raw", salt, parameters, false, [ "sign" ])
        .then(function(saltKey) {
          return wrapper.sign(parameters, saltKey, secret);
        }).then(function(signature) {
          return arrays.toUint8Array(signature);
        }, function(error) {
          return crypto.hmac(algorithm, salt, secret)
            .catch(function(failure) { throw error });
        });
      });
    }

    Object.freeze(this);
  }

  SubtleCrypto.prototype = Object.create(AsyncCrypto.prototype);
  SubtleCrypto.prototype.constructor = SubtleCrypto;
  SubtleCrypto.prototype.name = "SubtleCrypto";

  /* Return our function */
  return SubtleCrypto;

});
