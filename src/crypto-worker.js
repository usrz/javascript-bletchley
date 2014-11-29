'use strict';

Esquire.define('bletchley/crypto/worker', ['bletchley/crypto/AsyncCrypto', 'rodosha'], function(AsyncCrypto, rodosha) {

  return rodosha.create('bletchley/crypto/sync', false)
    .then(function(rodosha) {
      return rodosha.proxy('bletchley/crypto/sync');
    }).then(function(crypto) {
      return new AsyncCrypto(crypto);
    });

});

