'use strict';

Esquire.define('bletchley/crypto/Crypto', ['$global/crypto', 'bletchley/utils/random'], function(crypto, random) {

  function Crypto(codecs, hashes, hmacs, kdfs) {
    if (! codecs) throw new Error("Codecs not specified");
    if (! hashes) throw new Error("Hashes not specified");
    if (! hmacs)  throw new Error("HMACs not specified");

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

});
