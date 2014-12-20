'use strict';

Esquire.define('bletchley/hashes/SHA1', [ 'bletchley/hashes/BaseSHA',
                                          'bletchley/utils/arrays' ],

  function(BaseSHA, arrays) {

    /* Hash constants for SHA1 */
    var h = [ 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0 ];

    /* Digest and block size for SHA1 */
    var DIGEST_SIZE = 20;
    var BLOCK_SIZE = 64;
    var NUM_WORDS = 80;
    var LEN_BYTES = 8;

    /* Constructor function */
    function SHA1() {

      /* Initial values for H */
      var h0 = h[0]; var h1 = h[1]; var h2 = h[2]; var h3 = h[3]; var h4 = h[4];

      /* Words for compute cycle */
      var words = new Array(NUM_WORDS);

      Object.defineProperties(this, {

        "$reset": { configurable: true, enumerable: false, value: function() {
          h0 = h[0]; h1 = h[1]; h2 = h[2]; h3 = h[3]; h4 = h[4];
        }},

        "$hash": { configurable: true, enumerable: false, value: function(view) {
          view.setUint32( 0, h0, false);
          view.setUint32( 4, h1, false);
          view.setUint32( 8, h2, false);
          view.setUint32(12, h3, false);
          view.setUint32(16, h4, false);
        }},

        "$compute": { configurable: true, enumerable: false, value: function(view) {

          /* Copy as normal numbers (faster) */
          for (var i = 0; i < 16; i ++) {
            words[i] = view.getUint32((i * 4), false);
          }

          /* Expand our block */
          for (var i = 16; i < NUM_WORDS; i ++) {
            var n = words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
            words[i] = (n << 1) | (n >>> 31);
          }

          /* Initialize hash value for this chunk */
          var a = h0;
          var b = h1;
          var c = h2;
          var d = h3;
          var e = h4;

          /* Main loop */
          for (var i = 0; i < NUM_WORDS; i ++) {
            var temp = ((a << 5) | (a >>> 27)) + e + words[i];

            if (i < 20) {
                temp += ((b & c) | (~b & d)) + 0x5a827999;
            } else if (i < 40) {
                temp += (b ^ c ^ d) + 0x6ed9eba1;
            } else if (i < 60) {
                temp += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
            } else /* if (i < 80) */ {
                temp += (b ^ c ^ d) - 0x359d3e2a;
            }

            e = d;
            d = c;
            c = (b << 30) | (b >>> 2);
            b = a;
            a = temp;
          }

          /* Add this chunk's hash to result so far */
          h0 += a;
          h1 += b;
          h2 += c;
          h3 += d;
          h4 += e;

        }}
      });

      /* Super constructor */
      BaseSHA.call(this, BLOCK_SIZE, DIGEST_SIZE, LEN_BYTES);
    };

    /* SHA1 extends BaseSHA */
    return BaseSHA.$super(SHA1);

  }
);
