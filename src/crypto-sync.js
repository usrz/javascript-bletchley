'use strict';

Esquire.define('bletchley/crypto/sync', [ 'bletchley/crypto/Crypto',
                                          'bletchley/codecs',
                                          'bletchley/hashes',
                                          'bletchley/hmacs',
                                          'bletchley/kdfs'],
  function(Crypto, codecs, hashes, hmacs, kdfs) {
    return new Crypto(codecs, hashes, hmacs, kdfs);
  }
);

