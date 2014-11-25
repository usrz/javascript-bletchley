'use strict';

Esquire.define('bletchley/crypto/async', ['bletchley/crypto/Crypto', 'bletchley/crypto/sync'], function(Crypto, crypto) {

  return new Crypto.async(crypto);

});

