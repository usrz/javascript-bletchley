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

  /*
   * Let's keep known empty hashes around here. This is *NOT* for speed, but
   * apparently M$IE11's subtle does not like to digest empty arrays, as it
   * neither fails, nor succeeds, and we wait forever on "onerror"/"oncomplete"
   */
  var emptyHashes = {
   'SHA-1':   new Uint8Array([0xFB, 0xDB, 0x1D, 0x1B, 0x18, 0xAA, 0x6C, 0x08, 0x32, 0x4B, 0x7D, 0x64, 0xB7, 0x1F, 0xB7, 0x63, 0x70, 0x69, 0x0E, 0x1D]),
   'SHA-224': new Uint8Array([0x5C, 0xE1, 0x4F, 0x72, 0x89, 0x46, 0x62, 0x21, 0x3E, 0x27, 0x48, 0xD2, 0xA6, 0xBA, 0x23, 0x4B, 0x74, 0x26, 0x39, 0x10, 0xCE, 0xDD, 0xE2, 0xF5, 0xA9, 0x27, 0x15, 0x24]),
   'SHA-256': new Uint8Array([0xB6, 0x13, 0x67, 0x9A, 0x08, 0x14, 0xD9, 0xEC, 0x77, 0x2F, 0x95, 0xD7, 0x78, 0xC3, 0x5F, 0xC5, 0xFF, 0x16, 0x97, 0xC4, 0x93, 0x71, 0x56, 0x53, 0xC6, 0xC7, 0x12, 0x14, 0x42, 0x92, 0xC5, 0xAD]),
   'SHA-384': new Uint8Array([0x6C, 0x1F, 0x2E, 0xE9, 0x38, 0xFA, 0xD2, 0xE2, 0x4B, 0xD9, 0x12, 0x98, 0x47, 0x43, 0x82, 0xCA, 0x21, 0x8C, 0x75, 0xDB, 0x3D, 0x83, 0xE1, 0x14, 0xB3, 0xD4, 0x36, 0x77, 0x76, 0xD1, 0x4D, 0x35, 0x51, 0x28, 0x9E, 0x75, 0xE8, 0x20, 0x9C, 0xD4, 0xB7, 0x92, 0x30, 0x28, 0x40, 0x23, 0x4A, 0xDC]),
   'SHA-512': new Uint8Array([0xB9, 0x36, 0xCE, 0xE8, 0x6C, 0x9F, 0x87, 0xAA, 0x5D, 0x3C, 0x6F, 0x2E, 0x84, 0xCB, 0x5A, 0x42, 0x39, 0xA5, 0xFE, 0x50, 0x48, 0x0A, 0x6E, 0xC6, 0x6B, 0x70, 0xAB, 0x5B, 0x1F, 0x4A, 0xC6, 0x73, 0x0C, 0x6C, 0x51, 0x54, 0x21, 0xB3, 0x27, 0xEC, 0x1D, 0x69, 0x40, 0x2E, 0x53, 0xDF, 0xB4, 0x9A, 0xD7, 0x38, 0x1E, 0xB0, 0x67, 0xB3, 0x38, 0xFD, 0x7B, 0x0C, 0xB2, 0x22, 0x47, 0x22, 0x5D, 0x47])
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

      /* Shortcut, plus M$ does not compute those (hangs forever) */
      if ((salt.length == 0) && (secret.length == 0) && (emptyHashes[algorithm])) {
        deferred.resolve(emptyHashes[algorithm]);
        return;
      }

      /* Check for missing native support */
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
