'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/random',
                                            'bletchley/codecs',
                                            'bletchley/hashes',
                                            'bletchley/hmacs',
                                            'bletchley/kdfs' ],
  function(random, codecs, hashes, hmacs, kdfs) {

    function Crypto() {
      this.random    = random.random;
      this.stringify = codecs.stringify;
      this.encode    = codecs.encode;
      this.decode    = codecs.decode;
      this.hash      = hashes.hash;
      this.hmac      = hmacs.hmac;
      this.kdf       = kdfs.kdf;

      Object.freeze(this);
    }

    Crypto.prototype = Object.create(Object.prototype);
    Crypto.prototype.constructor = Crypto;
    Crypto.prototype.name = "Crypto";

    /* Return our function */
    return Crypto;

  }
);
