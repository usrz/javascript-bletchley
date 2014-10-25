'use strict';

define([], function() {
  return function(module) {

    /*
     * Let's keep known empty hashes around here. This is *NOT* for speed, but
     * apparently M$IE11's subtle does not like to digest empty arrays, as it
     * neither fails, nor succeeds, and we wait forever on "onerror"/"oncomplete"
     */
    var emptyHashes = {
      'SHA-1':   new Uint8Array([0xDA, 0x39, 0xA3, 0xEE, 0x5E, 0x6B, 0x4B, 0x0D, 0x32, 0x55, 0xBF, 0xEF, 0x95, 0x60, 0x18, 0x90, 0xAF, 0xD8, 0x07, 0x09]),
      'SHA-224': new Uint8Array([0xD1, 0x4A, 0x02, 0x8C, 0x2A, 0x3A, 0x2B, 0xC9, 0x47, 0x61, 0x02, 0xBB, 0x28, 0x82, 0x34, 0xC4, 0x15, 0xA2, 0xB0, 0x1F, 0x82, 0x8E, 0xA6, 0x2A, 0xC5, 0xB3, 0xE4, 0x2F]),
      'SHA-256': new Uint8Array([0xE3, 0xB0, 0xC4, 0x42, 0x98, 0xFC, 0x1C, 0x14, 0x9A, 0xFB, 0xF4, 0xC8, 0x99, 0x6F, 0xB9, 0x24, 0x27, 0xAE, 0x41, 0xE4, 0x64, 0x9B, 0x93, 0x4C, 0xA4, 0x95, 0x99, 0x1B, 0x78, 0x52, 0xB8, 0x55]),
      'SHA-384': new Uint8Array([0x38, 0xB0, 0x60, 0xA7, 0x51, 0xAC, 0x96, 0x38, 0x4C, 0xD9, 0x32, 0x7E, 0xB1, 0xB1, 0xE3, 0x6A, 0x21, 0xFD, 0xB7, 0x11, 0x14, 0xBE, 0x07, 0x43, 0x4C, 0x0C, 0xC7, 0xBF, 0x63, 0xF6, 0xE1, 0xDA, 0x27, 0x4E, 0xDE, 0xBF, 0xE7, 0x6F, 0x65, 0xFB, 0xD5, 0x1A, 0xD2, 0xF1, 0x48, 0x98, 0xB9, 0x5B]),
      'SHA-512': new Uint8Array([0xCF, 0x83, 0xE1, 0x35, 0x7E, 0xEF, 0xB8, 0xBD, 0xF1, 0x54, 0x28, 0x50, 0xD6, 0x6D, 0x80, 0x07, 0xD6, 0x20, 0xE4, 0x05, 0x0B, 0x57, 0x15, 0xDC, 0x83, 0xF4, 0xA9, 0x21, 0xD3, 0x6C, 0xE9, 0xCE, 0x47, 0xD0, 0xD1, 0x3C, 0x5D, 0x85, 0xF2, 0xB0, 0xFF, 0x83, 0x18, 0xD2, 0x87, 0x7E, 0xEC, 0x2F, 0x63, 0xB9, 0x31, 0xBD, 0x47, 0x41, 0x7A, 0x81, 0xA5, 0x38, 0x32, 0x7A, 0xF9, 0x27, 0xDA, 0x3E])
    };

    module.factory('_hash', ['$rootScope', '$q', '_subtle', '_encoder', '_defer', function($rootScope, $q, _subtle, _encoder, _defer) {

      /* Defers and promises to load via "require()" */
      var sha1_defer     = $q.defer();
      var sha224_defer   = $q.defer();
      var sha256_defer   = $q.defer();
      var sha384_defer   = $q.defer();
      var sha512_defer   = $q.defer();

      var sha1_promise   = sha1_defer.promise;
      var sha224_promise = sha224_defer.promise;
      var sha256_promise = sha256_defer.promise;
      var sha384_promise = sha384_defer.promise;
      var sha512_promise = sha512_defer.promise;

      /* Load the native JS implementation asynchronously */
      require(["modules/hash/sha1",
               "modules/hash/sha-224",
               "modules/hash/sha-256",
               "modules/hash/sha-384",
               "modules/hash/sha-512"],
        function(sha1, sha224, sha256, sha384, sha512) {
          sha1_defer.resolve(sha1);
          sha224_defer.resolve(sha224);
          sha256_defer.resolve(sha256);
          sha384_defer.resolve(sha384);
          sha512_defer.resolve(sha512);
          $rootScope.$apply();
        });

      /* Main entry point for all hashing functions */
      function hash(algorithm, promise, message) {

          /* Always return a promise */
          return $q(function(resolve, reject) {

            /* Attempt to use the subtle crypto interface */
            try {
              _subtle.digest({ name: algorithm }, message)
                .then(function(success) {
                  /* Subtle crypto was successful, resolve */
                  resolve(success);
                }, function(failure) {
                  /* Subtle crypto failed, use javascript */
                  promise.then(function(hash) {
                    try {
                      resolve(hash(message));
                    } catch (error) {
                      reject(error);
                    }
                  });
                });

            } catch (error) {
              /* Subtle threw an error, use javascript (deferred) */
              _defer(function() {
                promise.then(function(hash) {
                  try {
                    resolve(hash(message));
                  } catch (error) {
                    reject(error);
                  }
                });
              });
            }

          });
      }

      return function(algorithm, data) {
        return $q.when(data)
          .then(function(data) {
            try {
              if (!data) throw new Error("No data to hash");
              if (data.buffer) data = data.buffer;

              /* Shortcut, plus M$ does not compute those (hangs forever) */
              if (data.byteLength == 0) switch (algorithm.toUpperCase()) {
                case "SHA-1":   return emptyHashes['SHA-1'  ];
                case "SHA-224": return emptyHashes['SHA-224'];
                case "SHA-256": return emptyHashes['SHA-256'];
                case "SHA-384": return emptyHashes['SHA-384'];
                case "SHA-512": return emptyHashes['SHA-512'];
                default: throw new Error("Unsupported hashing algorithm: " + algorithm);
              }

              switch (algorithm.toUpperCase()) {
                case "SHA-1":   return hash('SHA-1',   sha1_promise,   _encoder.toUint8Array(data));
                case "SHA-224": return hash('SHA-224', sha224_promise, _encoder.toUint8Array(data));
                case "SHA-256": return hash('SHA-256', sha256_promise, _encoder.toUint8Array(data));
                case "SHA-384": return hash('SHA-384', sha384_promise, _encoder.toUint8Array(data));
                case "SHA-512": return hash('SHA-512', sha512_promise, _encoder.toUint8Array(data));
                default: throw new Error("Unsupported hashing algorithm: " + algorithm);
              }

            } catch (error) {
              return $q.reject(error);
            }
          });
      }
    }]);
  }
});
