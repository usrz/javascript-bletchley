'use strict';

Esquire.define('bletchley/crypto/async', ['bletchley/crypto/AsyncCrypto', 'bletchley/crypto/sync'], function(AsyncCrypto, crypto) {

  return new AsyncCrypto(crypto);

});

