'use strict';

(function() {

  var module = angular.module('UZCrypto', ['UZEncoder', 'UZDefer']);

  require(['modules/crypto_hash', 'modules/crypto_subtle'], function() {
    for (var i = 0; i < arguments.length; i++) {
      arguments[i](module);
    }
  });

})();
