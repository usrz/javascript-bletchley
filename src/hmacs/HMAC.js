'use strict';

Esquire.define('bletchley/hmacs/HMAC', [ 'bletchley/utils/helpers',
                                         'bletchley/utils/extend',
                                         'bletchley/utils/arrays' ],
  function(helpers, extend, arrays) {

    /* XOR two Uint8Arrays */
    function xor(array1, array2) {
      var array = new Uint8Array(array1.length);
      for (var i = 0; i < array.length; i ++) {
        array[i] = array1[i] ^ array2[i];
      }
      return array;
    }

    return extend(function(hash, innerPadding, outerPadding) {

      this.hmac = function(salt, secret) {
        salt = arrays.toUint8Array(salt);
        secret = arrays.toUint8Array(secret);

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
          key = new Uint8Array(hash.hash(salt));
        }

        var innerKeyPadding = xor(innerPadding, key);
        var innerHash = hash.hash(arrays.concatUint8Arrays(innerKeyPadding, secret));

        var outerKeyPadding = xor(outerPadding, key);
        return hash.hash(arrays.concatUint8Arrays(outerKeyPadding, innerHash));
      }

      helpers.Helper.call(this, hash.algorithm);
    }, helpers.Helper, "HMAC");

  }
);
