'use strict';

Esquire.define('bletchley', [ 'bletchley/crypto/Crypto',
                              'bletchley/crypto/WorkerCrypto',
                              'bletchley/crypto/SubtleCrypto' ],
  function(Crypto, WorkerCrypto, SubtleCrypto) {

    return WorkerCrypto.newInstance()
      .then(function(crypto) {
        return new SubtleCrypto(crypto);
      }, function(error) {
        console.warn("Unable to create WorkerCrypto instance", error);
        return new SubtleCrypto(new Crypto());
      });

  }
);

