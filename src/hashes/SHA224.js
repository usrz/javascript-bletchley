'use strict';

Esquire.define('bletchley/hashes/SHA224', ['bletchley/hashes/SHA256', 'bletchley/utils/extend'], function(SHA256, extend) {

  /* Initialize hash values for SHA-224 */
  var H = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
           0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];

  return extend(function SHA224(algorithm, digestSize, h) {
    SHA256.call(this, "SHA-224", 28, H);
  }, SHA256, "SHA256");

});
