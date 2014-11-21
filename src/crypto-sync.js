'use strict';

Esquire.define('bletchley/crypto/sync', ['bletchley/codecs', 'bletchley/hashes'], function(codecs, hashes) {

  return {
    encode: codecs.encode,
    decode: codecs.decode,
    hash: hashes.hash
  };

});

