'use strict';

Esquire.define('bletchley/crypto/SubtleCrypto', [ '$deferred',
                                                  '$promise',
                                                  '$global',
                                                  '$global/crypto.subtle',
                                                  'bletchley/utils/arrays',
                                                  'bletchley/keys/RSAKey',
                                                  'bletchley/keys/RSAKeyFactory',
                                                  'bletchley/crypto/AsyncCrypto' ],
function(Deferred, Promise, global, subtle, arrays, RSAKey, RSAKeyFactory, AsyncCrypto) {

  /* ======================================================================== *
   * SUBTLE CRYPTO WRAPPER: detect available functions and wrap returned M$   *
   * style CryptoOperation(s) as Promise(s)                                   *
   * ======================================================================== */

  /* If we don't have a subtle crypto, just return our AsyncCrypto class */
  if (! subtle) return AsyncCrypto;

  /* We *need* to know if this is a M$ web crypto, as it times our in some calls */
  var msCrypto = subtle && (subtle === (global.msCrypto && global.msCrypto.subtle)) || false;

  /* If we have a M$ crypto, we have to wrap its CryptoOperations into poromises */
  if (msCrypto) {
    var msSubtle = subtle;
    var wrapper = new Object();
    for (var i in subtle) (function(i) {
      if (typeof(subtle[i]) === 'function') {

        var method = subtle[i];
        wrapper[i] = function() {
          var operation;

          /* Call the method, and reject on error */
          try {
            operation = method.apply(msSubtle, arguments);
          } catch (error) {
            return Promise.reject(error);
          }

          if (operation) {

            /* Standard W3C Crypto returning promises? Maybe M$IE12 */
            if (typeof(operation.then) === 'function') return operation;

            /* M$ Crypto implementation returning CryptoOperations */
            if (typeof(operation.addEventListener) === 'function') {
              var deferred = new Deferred();

              operation.addEventListener('complete', function(event) {
                try {
                  deferred.resolve(event.target.result);
                } catch (error) {
                  deferred.reject(error);
                }
              });

              operation.addEventListener('error', function(event) {
                deferred.reject(new Error("Crypto operation '" + i + "' failed"));
              });

              operation.addEventListener('abort', function(event) {
                var error = new Error("Crypto operation '" + i + "' aborted");
                error.event = event;
                deferred.reject(error);
              });

              return deferred.promise;
            }
          }

          /* Dunno what to return */
          var error = new Error("Unknown crypto operation result from '" + i + "'");
          error.result = operation;
          return Promise.reject(error);
        }
      }
    })(i);

    /* Replace our subtle with our wrapper */
    subtle = wrapper;
  }

  /* ======================================================================== *
   * RSA KEYS FROM/TO SUBTLE                                                  *
   * ======================================================================== */

  var rsaFactory = new RSAKeyFactory();

  function SubtleRSAKey(crypto, key) {
    console.warn("OK");


  };

  /* ======================================================================== *
   * SUBTLE CRYPTO: our implementation of the AsyncCrypto class               *
   * ======================================================================== */

  function SubtleCrypto(crypto) {
    AsyncCrypto.call(this, crypto);
  };

  SubtleCrypto.prototype = Object.create(AsyncCrypto.prototype);
  SubtleCrypto.prototype.constructor = SubtleCrypto;

  /* ======================================================================== *
   * HASHING WITH SUBTLE CRYPTO                                               *
   * ======================================================================== */

  if (subtle.digest) {
    SubtleCrypto.prototype.hash = function(algorithm, message) {
      var crypto = this.$crypto;
      return Promise.all([algorithm, message]).then(function(result) {
        var algorithm = result[0];
        var message = arrays.toUint8Array(result[1]);

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

  /* ======================================================================== *
   * HMAC WITH SUBTLE CRYPTO                                                  *
   * ======================================================================== */

  if (subtle.importKey && subtle.sign) {
    SubtleCrypto.prototype.hmac = function(algorithm, salt, secret) {
      var crypto = this.$crypto;
      return Promise.all([algorithm, salt, secret]).then(function(result) {
        var algorithm = result[0];
        var salt = arrays.toUint8Array(result[1]);
        var secret = arrays.toUint8Array(result[2]);

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

  /* ======================================================================== *
   * GENERATE KEY WITH SUBTLE CRYPTO                                          *
   * ======================================================================== */

  if (subtle.generateKey) {
    SubtleCrypto.prototype.generateKey = function(algorithm, bits, params) {
      var crypto = this.$crypto;
      return Promise.all([algorithm, bits, params]).then(function(result) {
        var algorithm = result[0];
        var bits = result[1];
        var params = result[2];

        /* Generation of an RSA key */
        if (algorithm === 'RSA') {

          /* Our "e" Uint8Array */
          var e = (params && params.e);
          if (!e) e = new Uint8Array([0x01, 0x00, 0x01]);
          else if (typeof(e) === 'number') e = BigInteger.fromInt(e).toUint8Array();
          else if (e instanceof BigInteger) e = e.toUint8Array();
          else throw new Error("Public exponent must be a number");

          /* Use RSASSA-PKCS1-v1_5 in order to have the correct OID in ASN.1 */
          return subtle.generateKey({ name: "RSASSA-PKCS1-v1_5",
                                      modulusLength: bits,
                                      publicExponent: e,
                                      hash: {name: "SHA-256"} }, // SHA-256 is known by most (all?) browsers
                                      true,
                                      ['sign', 'verify']) // sign and verify, generate both public and private

          /* Export the private and public keys in PKCS#8 and X.509 */
          .then(function(result) {
            return Promise.all([
              subtle.exportKey('pkcs8', result.privateKey),
              subtle.exportKey('spki', result.publicKey)
            ]);
          })

          .then(function(result) {
            var key = rsaFactory.importKey(result[0]);
            var pub = rsaFactory.importKey(result[1]);

            /* In case the private key lacks exponent */
            if (key.e == null) {
              key = new RSAKey(key.n, pub.e, key.d, key.p, key.q, key.dmp1, key.dmq1, key.coeff);
            }

            /* Wrap our RSA key */
            return new SubtleRSAKey(crypto, key);

          })
        }

        throw new Error("FOO");
      });
    }
  }

  /* ======================================================================== *
   * IMPORT KEY WITH SUBTLE CRYPTO                                            *
   * ======================================================================== */

  if (subtle.importKey) {
    SubtleCrypto.prototype.importKey = function(algorithm, data, params) {
      var crypto = this.$crypto;
      return Promise.all([algorithm, data, params]).then(function(result) {
        var algorithm = result[0];
        var data = arrays.toUint8Array(result[1]);
        var params = result[2];

        /* Generation of an RSA key */
        if (algorithm === 'RSA') {
          return new SubtleRSAKey(crypto, rsaFactory.importKey(data));
        }

        throw new Error("FOO");
      });
    }
  }

  /* ======================================================================== *
   * ENCRYPT WITH SUBTLE CRYPTO                                               *
   * ======================================================================== */

  if (subtle.encrypt) {
    SubtleCrypto.prototype.encrypt = function(algorithm, data, params) {
      var crypto = this.$crypto;
      return Promise.all([algorithm, data, params]).then(function(result) {
        var algorithm = result[0];
        var data = arrays.toUint8Array(result[1]);
        var params = result[2];

        /* Generation of an RSA key */
        if (algorithm === 'RSA') {
          return new SubtleRSAKey(crypto, rsaFactory.importKey(data));
        }

        throw new Error("FOO");
      });
    }

  }




  // if (subtle.importKey) {
  //   SubtleCrypto.prototype.importKey = function(algorithm, data, params) {
  //     var crypto = this.$crypto;
  //     return Promise.all([algorithm, data, params]).then(function(result) {
  //       throw new Error("FOO");
  //     });
  //   }
  // }

  /* ======================================================================== */

  return SubtleCrypto;


});
