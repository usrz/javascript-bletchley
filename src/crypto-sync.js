'use strict';

Esquire.define('bletchley/crypto/sync', ['bletchley/codecs', 'bletchley/hashes', 'bletchley/hmacs'], function(codecs, hashes, hmacs) {

  return {
    codecs: codecs.algorithms,
    encode: codecs.encode,
    decode: codecs.decode,
    hash: hashes.hash
  };

});

