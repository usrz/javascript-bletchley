'use strict';

Esquire.define('bletchley/crypto/worker', ['bletchley/crypto/Crypto', 'rodosha'], function(Crypto, rodosha) {

  return rodosha.create()
    .then(function(rodosha) {
      return rodosha.proxy('bletchley/crypto/sync');
    }).then(function(crypto) {
      return new Crypto.async(crypto);
    });

});

