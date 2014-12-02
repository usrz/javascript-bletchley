'use strict';

Esquire.define('bletchley/hashes/sha224', ['bletchley/hashes/HashSHA256'], function(HashSHA256) {

  /* Initialize hash values for SHA-224 */
  var h = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
           0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];

  return new HashSHA256("SHA-224", 28, h);

});
