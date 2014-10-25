'use strict';

define([], function() {
  return function(module) {

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

  }
});
