'use strict';

/* Code adapted from CryptoJS <https://code.google.com/p/crypto-js/> */

Esquire.define('bletchley/hashes/sha1', ['bletchley/hashes/Hash'], function(Hash) {

  function compute(message) {

    /* Initialize our variables */
    var h0 = 0x67452301;
    var h1 = 0xEFCDAB89;
    var h2 = 0x98BADCFE;
    var h3 = 0x10325476;
    var h4 = 0xC3D2E1F0;

    /* The expanded message length is a multiple of 64 bytes (512 bits) */
    var computedLength = message.byteLength + 9; // 0x80 plus 64 bits of message length
    var finalChunkSize = computedLength % 64; // 512 bits chunks
    var expandedLength = computedLength + (finalChunkSize == 0 ? 0 : 64 - finalChunkSize);

    /* Prepare the real message array (message + 0x80 + ...(zeroes)... + bit length */
    var expanded = new ArrayBuffer(expandedLength);

    /* Copy the message */
    new Uint8Array(expanded).set(new Uint8Array(message, 0));

    /* Add an extra '1' bit (0x80) after the message, and set the length */
    var expandedView = new DataView(expanded);
    expandedView.setUint8(message.byteLength, 0x80);
    expandedView.setUint32(expanded.byteLength - 4, message.byteLength * 8, false);

    /* Process the message in 512-bits (64-bytes) chunks */
    for (var offset = 0; offset < expandedLength; offset += 64) {
      var chunk = new DataView(expanded, offset, 64);

      /* Expand our 16 words into 80 */
      var words = new Array(80);

      for (var i = 0; i < 16; i ++) {
        words[i] = chunk.getUint32(i * 4, false);
      }

      for (var i = 16; i < 80; i ++) {
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
      for (var i = 0; i < 80; i ++) {
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
    }

    /* Put our results in an array */
    var hash = new ArrayBuffer(20);
    var hashView = new DataView(hash);
    hashView.setUint32( 0, h0, false);
    hashView.setUint32( 4, h1, false);
    hashView.setUint32( 8, h2, false);
    hashView.setUint32(12, h3, false);
    hashView.setUint32(16, h4, false);

    /* Wrap the result in a Uint8Array */
    return new Uint8Array(hash);

  };

  return new Hash("SHA1", compute);

});
