'use strict';

Esquire.define('bletchley/hashes/sha512', ['bletchley/hashes/HashSHA512'], function(HashSHA512) {

  /* Initialize hash values for SHA-512 */
  var h = [0x6a09e667, 0xf3bcc908,   0xbb67ae85, 0x84caa73b,
           0x3c6ef372, 0xfe94f82b,   0xa54ff53a, 0x5f1d36f1,
           0x510e527f, 0xade682d1,   0x9b05688c, 0x2b3e6c1f,
           0x1f83d9ab, 0xfb41bd6b,   0x5be0cd19, 0x137e2179];

  return new HashSHA512("SHA-512", 64, h);

});
