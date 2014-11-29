'use strict';

/* Code adapted from CryptoJS <https://code.google.com/p/crypto-js/> */

Esquire.define('bletchley/hashes/sha256', ['bletchley/hashes/Hash'], function(Hash) {

  return new Hash("SHA-256", 64, function(message, h) {

    /* Initialize hash values */
    var h0 = h ? h[0] : 0x6a09e667;
    var h1 = h ? h[1] : 0xbb67ae85;
    var h2 = h ? h[2] : 0x3c6ef372;
    var h3 = h ? h[3] : 0xa54ff53a;
    var h4 = h ? h[4] : 0x510e527f;
    var h5 = h ? h[5] : 0x9b05688c;
    var h6 = h ? h[6] : 0x1f83d9ab;
    var h7 = h ? h[7] : 0x5be0cd19;

    /* Initialize array of round constants */
    var k = [ 0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
              0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
              0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
              0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
              0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
              0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
              0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
              0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2 ];

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

      /* Expand our 16 words into 64 */
      var words = new Array(64);

      for (var i = 0; i < 16; i ++) {
        words[i] = chunk.getUint32(i * 4, false);
      }

      for (var i = 16; i < 64; i ++) {
        var gamma0x = words[i - 15];
        var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                      ((gamma0x << 14) | (gamma0x >>> 18)) ^
                       (gamma0x >>> 3);

        var gamma1x = words[i - 2];
        var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                      ((gamma1x << 13) | (gamma1x >>> 19)) ^
                       (gamma1x >>> 10);

        words[i] = gamma0 + words[i - 7] + gamma1 + words[i - 16];
      }

      /* Initialize working variables to current hash value */
      var a = h0;
      var b = h1;
      var c = h2;
      var d = h3;
      var e = h4;
      var f = h5;
      var g = h6;
      var h = h7;

      /* Compression function main loop */
      for (var i = 0; i < 64; i ++) {
        var ch  = (e & f) ^ (~e & g);
        var maj = (a & b) ^ (a & c) ^ (b & c);

        var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
        var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

        var t1 = h + sigma1 + ch + k[i] + words[i];
        var t2 = sigma0 + maj;

        h = g;
        g = f;
        f = e;
        e = (d + t1) | 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) | 0;
      }

      /* Add the compressed chunk to the current hash value */
      h0 += a;
      h1 += b;
      h2 += c;
      h3 += d;
      h4 += e;
      h5 += f;
      h6 += g;
      h7 += h;

    }

    /* Put our results in an array */
    var hash = new ArrayBuffer(32);
    var hashView = new DataView(hash);
    hashView.setUint32( 0, h0, false);
    hashView.setUint32( 4, h1, false);
    hashView.setUint32( 8, h2, false);
    hashView.setUint32(12, h3, false);
    hashView.setUint32(16, h4, false);
    hashView.setUint32(20, h5, false);
    hashView.setUint32(24, h6, false);
    hashView.setUint32(28, h7, false);
    return hash;

  });

});
