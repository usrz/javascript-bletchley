'use strict';

define(['crypto_module', 'utils/uint8'], function(module, uint8) {

  /* ======================================================================== */
  /* UZCrypto's "_hmac" service                                               */
  /* ======================================================================== */

  /* Prepare inner and outer paddings */
  var opad_512 =  uint8.createUint8Array(64,  0x5c);
  var ipad_512 =  uint8.createUint8Array(64,  0x36);
  var opad_1024 = uint8.createUint8Array(128, 0x5c);
  var ipad_1024 = uint8.createUint8Array(128, 0x36);

  /* Constants for our algorithms */
  var constants = {
    "SHA-1":   { outerPadding: opad_512,  innerPadding: ipad_512  },
    "SHA-224": { outerPadding: opad_512,  innerPadding: ipad_512  },
    "SHA-256": { outerPadding: opad_512,  innerPadding: ipad_512  },
    "SHA-384": { outerPadding: opad_1024, innerPadding: ipad_1024 },
    "SHA-512": { outerPadding: opad_1024, innerPadding: ipad_1024 },
  };

  /* Constants for our algorithms */
  var warnings = {};

  /* XOR two Uint8Arrays */
  function xor(array1, array2) {
    var array = new Uint8Array(array1.length);
    for (var i = 0; i < array.length; i ++) {
      array[i] = array1[i] ^ array2[i];
    }
    return array;
  }

  module.factory('_hmac', ['$q', '_subtle', '_hash', function($q, _subtle, _hash) {
    var importKey = _subtle.importKey;
    var sign = _subtle.sign;

    function fallback(deferred, algorithm, salt, secret, failure) {
      if (failure && (! warnings[algorithm])) {
        console.warn(failure);
        console.warn("Using non-native HMAC-" + algorithm + " operation");
        warnings[algorithm] = true;
      }

      /* Check our constants */
      var c = constants[algorithm.toUpperCase()];
      if (! c) {
        deferred.reject(new Error("Unsupported algorithm " + algorithm));
        return;
      }

      /* Calculate the key as a promise */
      var keyPromise = null;
      if (salt.length == c.outerPadding.length) {
        /* Salt length is good */
        keyPromise = $q.when(salt);
      } else if (salt.length < c.outerPadding.length) {
        /* Need to expand salt with zeroes */
        var expanded = new Uint8Array(c.outerPadding.length);
        expanded.set(salt, 0);
        keyPromise = $q.when(expanded);
      } else if (salt.length > c.outerPadding.length) {
        /* Need to hash a long salt with the algorithm */
        keyPromise = _hash(algorithm, salt);
      } else {
        throw new Error("WTF?? " + salt + " / " + c.outerPadding);
      }

      /* After expanding/compressing the key we XOR it with the paddings */
      keyPromise.then(function(key) {
        var outerKeyPadding = xor(c.outerPadding, key);
        var innerKeyPadding = xor(c.innerPadding, key);

        /* We now have the key paddings, calculate the hash for the inner part */
        _hash(algorithm, uint8.concatUint8Arrays(innerKeyPadding, secret))
          .then(function(innerHash) {
            /* As we have the inner, now calculate the final with outer padding */
            _hash(algorithm, uint8.concatUint8Arrays(outerKeyPadding, innerHash))
              .then(function(success) {
                deferred.resolve(success);
              }, function(failure) {
                deferred.reject(failure);
              });
          }, function(failure) {
            deferred.reject(failure);
          });
      }, function(failure) {
        deferred.reject(failure);
      })


    };


    function hmac(deferred, algorithm, salt, secret) {
      if (! importKey) {
        fallback(deferred, algorithm, salt, secret, new Error('Subtle crypto does not support "importKey(...)"'));
      } else if (! sign) {
        fallback(deferred, algorithm, salt, secret, new Error('Subtle crypto does not support "sign(...)"'));
      } else {

        /* Parameters, HMAC with our algorithm */
        var importParameters = { name: "HMAC", hash: { name: algorithm } };

        /* Need to use two promises: the first is for importing the salt */
        importKey("raw", salt, importParameters, false, [ "sign" ])

          .then(function(saltKey) {

            /* Parameters for signing */
            var signParameters = { name: "HMAC", hash: { name: algorithm } };

            /* The salt was imported correctly, now sign */
            sign(signParameters, saltKey, secret)
              .then(function(hash) {

                /* Signature was successful */
                deferred.resolve(uint8.toUint8Array(hash));

              }, function(failure) {

                /* Failed signing, use fallback */
                fallback(deferred, algorithm, salt, secret, failure);

              });

          }, function(failure) {

            /* Failed importing salt, use fallback */
            fallback(deferred, algorithm, salt, secret, failure);

          });
      }
    };

    /* Our basic function */
    return function(algorithm, salt, secret) {
      var deferred = $q.defer();

      $q.all([$q.when(salt), $q.when(secret)])
        .then(function(success) {
          try {
            hmac(deferred, algorithm, uint8.toUint8Array(salt), uint8.toUint8Array(secret));
          } catch (error) {
            deferred.reject(error);
          }
        }, function (failure) {
          deferred.reject(failure);
        });

      return deferred.promise;
    };
  }]);

});
