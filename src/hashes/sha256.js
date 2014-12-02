'use strict';

Esquire.define('bletchley/hashes/sha256', ['bletchley/hashes/HashSHA256'], function(HashSHA256) {

  /* Initialize hash values for SHA-256 */
  var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
           0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  return new HashSHA256("SHA-256", 32, h);

});
