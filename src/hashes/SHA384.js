'use strict';

Esquire.define('bletchley/hashes/SHA384', ['bletchley/hashes/SHA512', 'bletchley/utils/extend'], function(SHA512, extend) {

  /* Initialize hash values for SHA-384 */
  var H = [ 0xcbbb9d5d, 0xc1059ed8,   0x629a292a, 0x367cd507,
            0x9159015a, 0x3070dd17,   0x152fecd8, 0xf70e5939,
            0x67332667, 0xffc00b31,   0x8eb44a87, 0x68581511,
            0xdb0c2e0d, 0x64f98fa7,   0x47b5481d, 0xbefa4fa4 ];

  return extend("SHA384", SHA512, function(algorithm, digestSize, h) {
    SHA512.call(this, "SHA-384", 48, H);
  });

});
