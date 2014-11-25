Esquire.define('bletchley/crypto/Crypto', ['$promise', 'bletchley/utils/promisify'], function(Promise, promisify) {

  function Crypto(codecs, hashes, hmacs) {
    hashes = hashes || codecs;
    hmacs  = hmacs  || codecs;

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

  /* Wrapper for asynchronous */
  Crypto.async = function(crypto) {

    /* If the instance is a promise, we want it resolved */
    return Promise.resolve(crypto)

    /* Here we have the resolved crypto to wrap */
    .then(function(crypto) {
      /* Codecs, Hashes and HMACs array can be promises (e.g. Rodosha) */
      return Promise.all([
        crypto,
        crypto.codecs,
        crypto.hashes,
        crypto.hmacs
      ]);
    })

    /* We have definitely resolved our constants */
    .then(function(success) {
      var crypto = success[0];
      var codecs = success[1];
      var hashes = success[2];
      var hmacs  = success[3];

      return new Crypto({
        codecs: codecs,
        hashes: hashes,
        hmacs:  hmacs,

        encode: promisify(crypto, crypto.encode),
        decode: promisify(crypto, crypto.decode),
        hash:   promisify(crypto, crypto.hash),
        hmac:   promisify(crypto, crypto.hmac),

      })
    });

  };

  /* Return our function */
  return Crypto;

});
