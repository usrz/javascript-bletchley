'use strict';

(function() {

  var module = angular.module('UZCrypto', [])

  require(['modules/decode',
           'modules/defer',
           'modules/encode',
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
