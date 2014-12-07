'use strict';

Esquire.define('bletchley/crypto/SubtleCrypto', [ '$deferred',
                                                  '$promise',
                                                  '$global',
                                                  '$global/crypto.subtle',
                                                  'bletchley/utils/arrays',
                                                  'bletchley/crypto/AsyncCrypto' ],
function(Deferred, Promise, global, subtle, arrays, AsyncCrypto) {

  /* If we don't have a subtle crypto, just return our AsyncCrypto class */
  if (! subtle) return AsyncCrypto;

  /* We *need* to know if this is a M$ web crypto, as it times our in some calls */
  var msCrypto = subtle && (subtle === (global.msCrypto && global.msCrypto.subtle)) || false;

  /* If we have a M$ crypto, we have to wrap its CryptoOperations into poromises */
  if (msCrypto) {
    var wrapper = new Object();
    for (var i in subtle) (function(i) {
      if (typeof(subtle[i]) === 'function') {

        var method = subtle[i];
        wrapper[i] = function() {
          var operation;

          /* Call the method, and reject on error */
          try {
            operation = method.apply(subtle, arguments);
          } catch (error) {
            return Promise.reject(error);
          }

          if (operation) {

            /* Standard W3C Crypto returning promises? Maybe M$IE12 */
            if (typeof(promise.then) === 'function') return promise;

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

    /* Replace our subtle with our wrapper */
    subtle = wrapper;
  }

  /* ======================================================================== */

  function SubtleCrypto(crypto) {
    AsyncCrypto.call(this, crypto);
  };

  SubtleCrypto.prototype = Object.create(AsyncCrypto.prototype);
  SubtleCrypto.prototype.constructor = SubtleCrypto;

  /* ======================================================================== */

  if (subtle.digest) {
    SubtleCrypto.prototype.hash = function(algorithm, message) {
      var crypto = this.$crypto;
      return Promise.resolve(message).then(function(message) {
        message = arrays.toUint8Array(message);

        /* Remember, MSIE does not trigger failures, just hangs forever */
        if (msCrypto && (message.length === 0)) {
          return crypto.hash(algorithm, message);
        }

        try {
          return subtle.digest({ name: algorithm }, message)
          .then(function(result) {
            return arrays.toUint8Array(result);
          }, function(error) {
            return crypto.hash(algorithm, message)
              .catch(function() { throw error });
          })
        } catch (error) {
          return crypto.hash(algorithm, message)
            .catch(function() { throw error });
        }
      });
    }
  }

  if (subtle.importKey && subtle.sign) {
    SubtleCrypto.prototype.hmac = function(algorithm, salt, secret) {
      var crypto = this.$crypto;
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
        try {
          return subtle.importKey("raw", salt, parameters, false, [ "sign" ])
          .then(function(saltKey) {
            return subtle.sign(parameters, saltKey, secret);
          }).then(function(signature) {
            return arrays.toUint8Array(signature);
          }, function(error) {
            return crypto.hmac(algorithm, salt, secret)
              .catch(function() { throw error });
          })
        } catch (error) {
          return crypto.hmac(algorithm, salt, secret)
            .catch(function() { throw error });
        }
      });
    }
  }

  /* ======================================================================== */

  return SubtleCrypto;


});
