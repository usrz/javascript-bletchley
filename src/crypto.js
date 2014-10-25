'use strict';

(function() {

  var module = angular.module('UZCrypto', ['UZEncoder'])

  require(['modules/defer',
           'modules/hash',
           'modules/hmac',
           'modules/subtle'],
    function() {
      for (var i = 0; i < arguments.length; i++) {
        arguments[i](module);
      }
    }
  );

})();
