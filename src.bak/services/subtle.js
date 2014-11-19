'use strict';

define(['crypto_module', 'utils/has'], function(module, has) {

  /* A list of known subtle crypto functions that can/should be wrapped */
  var functions = ['encrypt', 'decrypt', 'sign', 'verify', 'digest', 'deriveBits',
                   'generateKey', 'deriveKey', 'importKey', 'exportKey',
                   'wrapKey', 'unwrapKey'];

  /* ======================================================================== */
  /* UZCrypto's "_subtle" service                                             */
  /* ======================================================================== */

  module.factory("_subtle", ['$q', '$window', '$rootScope', '$exceptionHandler', function($q, $window, $rootScope, $exceptionHandler) {

    var type = "none";
    var browserSubtle = has(window, 'window.msCrypto.subtle',
                                    'window.crypto.webkitSubtle',
                                    'window.crypto.subtle') || {};
    has(window, "window.msCrypto.subtle") && (type = "ms");
    has(window, "window.crypto.webkitSubtle") && (type = "webkit");
    has(window, "window.crypto.subtle") && (type = "standard");

    var subtle = { "$type": type };

    for (var i in functions) {
      if (browserSubtle[functions[i]]) {
        subtle[functions[i]] = (function(functionName) {
          return function() {
            var promise;
            try {
              promise = browserSubtle[functionName].apply(browserSubtle, arguments);
            } catch (error) {
              return $q.reject(error);
            }

            /* This is a THEN-able (DOM) promise, wrap it and notify */
            if (promise.then) {
              var deferred = $q.defer();

              promise.then(function(success) {
                try {
                  deferred.resolve(success);
                  $rootScope.$apply();
                } catch(error) {
                  $exceptionHandler(error);
                }
              }, function(failure) {
                try {
                  deferred.reject(failure);
                  $rootScope.$apply();
                } catch(error) {
                  $exceptionHandler(error);
                }
              });

              return deferred.promise;
            }

            /* This is a Microsoft-style CryptoOperation, remember to apply */
            if (promise.addEventListener) {
              var deferred = $q.defer();

              promise.addEventListener('complete', function(event) {
                try {
                  deferred.resolve(event.target.result);
                  $rootScope.$apply();
                } catch(error) {
                  $exceptionHandler(error);
                }
              });

              promise.addEventListener('error', function(event) {
                try {
                  var error = new Error("Error invoking '" + functionName + "'");
                  error.event = event;
                  deferred.reject(error);
                  $rootScope.$apply();
                } catch(error) {
                  $exceptionHandler(error);
                }
              });

              return deferred.promise;
            }

            /* How the heck are we supposed to wrap this schtuff??? */
            return $q.reject("Unknown promise returned by '" + functionName + "': " + promise);

          };
        })(functions[i]);
      }
    }

    return subtle;

  }]);

});
