'use strict';

Esquire.define('bletchley/hmacs/HMAC', [ 'bletchley/utils/Helper',
                                         'bletchley/utils/arrays' ],
  function(Helper, arrays) {

    function HMAC(hash) {

      /* Constants: inner and outer paddings, plus zero-filler */
      var innerPadding = arrays.createUint8Array(hash.blockSize, 0x36);
      var outerPadding = arrays.createUint8Array(hash.blockSize, 0x5c);
      var zeroesFiller = new Uint8Array(hash.blockSize);

      /* Inner hash, expandeds salt and padded keys can be reused */
      var innerHash = new Uint8Array(hash.digestSize);
      var expandedSalt = new Uint8Array(hash.blockSize);
      var innerKeyPadding = new Uint8Array(hash.blockSize);
      var outerKeyPadding = new Uint8Array(hash.blockSize);

      Object.defineProperties(this, {
        "blockSize":  { enumerable: true, configurable: false, value: hash.blockSize },
        "digestSize": { enumerable: true, configurable: false, value: hash.digestSize }
      });

      /* HMAC function to bind */
      this.hmac = function(salt, secret, output) {
        salt = arrays.toUint8Array(salt);
        secret = arrays.toUint8Array(secret);

        /* Create the output, if we don't have it */
        if (!output) output = new Uint8Array(hash.digestSize);

        /* Let's try to get a key for the salt (expand or hash) */
        if (salt.length == outerPadding.length) {

          /* Salt length matches, just overwrite */
          expandedSalt.set(salt, 0);

        } else if (salt.length < outerPadding.length) {

          /* Salt is short, expand with zeroes */
          expandedSalt.set(salt, 0);
          expandedSalt.set(zeroesFiller.subarray(salt.length), salt.length);

        } else if (salt.length > outerPadding.length) {

          /* Salt is long, hash and fill the rest with zeroes */
          hash.hash(salt, expandedSalt);
          expandedSalt.set(zeroesFiller.subarray(hash.digestSize), hash.digestSize);

        }

        /* Calculate the inner key padding, and get the inner hash */
        arrays.xorUint8Arrays(innerPadding, expandedSalt, innerKeyPadding);
        hash.reset().update(innerKeyPadding).update(secret).digest(innerHash);

        /* Calculare the outer key padding, slap result in the output and done */
        arrays.xorUint8Arrays(outerPadding, expandedSalt, outerKeyPadding);
        return hash.reset().update(outerKeyPadding).update(innerHash).digest(output);
      };

      Helper.call(this, hash.algorithm);
    };

    HMAC.prototype = Object.create(Helper.prototype);
    HMAC.prototype.constuctor = HMAC;

    return HMAC;
  }
);
