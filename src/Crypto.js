'use strict';

Esquire.define('bletchley/crypto/Crypto', [], function() {

  function Crypto(codecs, hashes, hmacs) {
    if (! codecs) throw new Error("Codecs not specified");
    if (! hashes) throw new Error("Hashes not specified");
    if (! hmacs)  throw new Error("HMACs not specified");

    this.stringify = codecs.stringify;
    this.encode    = codecs.encode;
    this.decode    = codecs.decode;
    this.hash      = hashes.hash;
    this.hmac      = hmacs.hmac;

    Object.freeze(this);
  }

  Crypto.prototype = Object.create(Object.prototype);
  Crypto.prototype.constructor = Crypto;
  Crypto.prototype.name = "Crypto";

  /* Return our function */
  return Crypto;

});
