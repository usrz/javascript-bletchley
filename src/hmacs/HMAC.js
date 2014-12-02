'use strict';

Esquire.define('bletchley/hmacs/HMAC', [ 'bletchley/utils/helpers',
                                         'bletchley/utils/extend',
                                         'bletchley/utils/arrays' ],
  function(helpers, extend, arrays) {

    return extend(function(hash, innerPadding, outerPadding) {
      this.blockSize = hash.blockSize;
      this.digestSize = hash.digestSize;

      /* Inner hash and key hash can be reused */
      var innerHash = new Uint8Array(hash.digestSize);
      var keyHash = new Uint8Array(hash.digestSize);

      /* HMAC calculation */
      this.hmac = function(salt, secret, output) {
        salt = arrays.toUint8Array(salt);
        secret = arrays.toUint8Array(secret);

        /* Create the output, if we don't have it */
        if (!output) output = new Uint8Array(hash.digestSize);

        /* Let's try to get a key for the salt (expand or hash) */
        var key;
        if (salt.length == outerPadding.length) {
          /* Salt length is good */
          key = salt;
        } else if (salt.length < outerPadding.length) {
          /* Need to expand salt with zeroes */
          var expanded = new Uint8Array(outerPadding.length);
          expanded.set(salt, 0);
          key = expanded;
        } else if (salt.length > outerPadding.length) {
          /* Need to hash a long salt with the algorithm */
          key = hash.hash(salt, keyHash);
        }

        /* Calculate the inner key padding, and get the inner hash */
        var innerKeyPadding = arrays.xorUint8Arrays(innerPadding, key);
        hash.hash(arrays.concatUint8Arrays(innerKeyPadding, secret), innerHash);

        /* Calculare the outer key padding, slap result in the output and done */
        var outerKeyPadding = arrays.xorUint8Arrays(outerPadding, key);
        return hash.hash(arrays.concatUint8Arrays(outerKeyPadding, innerHash), output);
      }

      helpers.Helper.call(this, hash.algorithm);
    }, helpers.Helper, "HMAC");

  }
);
