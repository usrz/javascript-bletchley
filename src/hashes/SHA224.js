'use strict';

Esquire.define('bletchley/hashes/SHA224', [ 'bletchley/hashes/SHA256' ],

  function(SHA256) {

    /* Initialize hash values for SHA-224 */
    var H = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
             0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];

    function SHA224() {
      SHA256.call(this, 28, H);
    };

    /* SHA224 extends SHA256 */
    return SHA256.$super(SHA224);

  }
);
