Esquire.define('bletchley/crypto/Crypto', [], function() {

  function Crypto(codecs, hashes, hmacs) {
    this.codecs = codecs.codecs;
    this.hashes = hashes.hashes;
    this.hmacs  = hmacs.hmacs;

    this.encode = codecs.encode;
    this.decode = codecs.decode;
    this.hash   = hashes.hash;
    this.hmac   = hmacs.hmac;

    Object.freeze(this);
  }

  Crypto.prototype = Object.create(Object.prototype);
  Crypto.prototype.constructor = Crypto;
  Crypto.prototype.name = "Crypto";

  return Crypto;

});
