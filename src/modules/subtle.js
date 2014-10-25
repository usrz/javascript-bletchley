'use strict';

define([], function() {
  return function(module) {

    /* A list of known subtle crypto functions that can/should be wrapped */
    var functions = ['encrypt', 'decrypt', 'sign', 'verify', 'digest', 'deriveBits',
                     'generateKey', 'deriveKey', 'importKey', 'exportKey',
                     'wrapKey', 'unwrapKey'];

    /* A utility function to discover/return the subtle crypto instance */
    function getBrowserSubtle($window) {
      if (window.msCrypto && window.msCrypto.subtle) return window.msCrypto.subtle;
      if (window.crypto && window.crypto.webkitSubtle) return window.crypto.webkitSubtle;
      if (window.crypto && window.crypto.subtle) return window.crypto.subtle;
      return Object.freeze({});
    }

    /* Create the "_subtle" factory */
    module.factory("_subtle", ['$q', '$window', '$rootScope', '$exceptionHandler', function($q, $window, $rootScope, $exceptionHandler) {

      var browserSubtle = getBrowserSubtle($window);
      var subtle = {};

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
  }
});
