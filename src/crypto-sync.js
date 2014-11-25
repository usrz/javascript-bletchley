'use strict';

Esquire.define('bletchley/crypto/sync', [ 'bletchley/crypto/Crypto',
                                          'bletchley/codecs',
                                          'bletchley/hashes',
                                          'bletchley/hmacs'],
  function(Crypto, codecs, hashes, hmacs) {
    return new Crypto(codecs, hashes, hmacs);
  }
);

