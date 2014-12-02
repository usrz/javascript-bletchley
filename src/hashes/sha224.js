'use strict';

/* Code adapted from CryptoJS <https://code.google.com/p/crypto-js/> */

Esquire.define('bletchley/hashes/sha224', ['bletchley/hashes/sha256', 'bletchley/hashes/Hash'], function(sha256, Hash) {

  /* Initialize hash values for SHA-224 */
  var h = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
           0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];

  return new Hash("SHA-224", sha256.blockSize, 28, function(message) {
    console.warn("XTOR", Object.getPrototypeOf(sha256).constructor);

    return sha256.hash(message, h).subarray(0, 28);

  });

});
