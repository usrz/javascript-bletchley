'use strict';

/* Code adapted from CryptoJS <https://code.google.com/p/crypto-js/> */

Esquire.define('bletchley/hashes/sha384', ['bletchley/hashes/sha512', 'bletchley/hashes/Hash'], function(sha512, Hash) {

  /* Initialize hash values for SHA-384 */
  var h = [0xcbbb9d5d, 0xc1059ed8, 0x629a292a, 0x367cd507, 0x9159015a, 0x3070dd17, 0x152fecd8, 0xf70e5939,
           0x67332667, 0xffc00b31, 0x8eb44a87, 0x68581511, 0xdb0c2e0d, 0x64f98fa7, 0x47b5481d, 0xbefa4fa4];

  return new Hash("SHA-384", function(message) {

    var hash = sha512.compute(message, h);
    var result = new Uint8Array(48);
    result.set(hash.subarray(0, 48));
    return result;

  });

});
