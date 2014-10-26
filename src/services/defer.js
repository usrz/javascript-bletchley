'use strict';

define(['crypto_module'], function(module) {

  /* ======================================================================== */
  /* UZCrypto's "_defer" service                                              */
  /* ======================================================================== */

  module.factory("_defer", ['$q', '$timeout', function($q, $timeout) {
    return function(what) {
      return $q(function(resolve, reject) {
        $timeout(function() {
          try {
            $q.when(typeof(what) == 'function' ? what() : what)
              .then(resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
    };
  }]);

});

