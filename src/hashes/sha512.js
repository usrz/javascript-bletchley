'use strict';

/* Code adapted from CryptoJS <https://code.google.com/p/crypto-js/> */

Esquire.define('bletchley/hashes/sha512', ['bletchley/hashes/Hash'], function(Hash) {

  /* Words, don't reallocate */
  var words = new Array(160);

  /* Array of round constants (high bits then low bits) */
  var k = [0x428a2f98, 0xd728ae22,    0x71374491, 0x23ef65cd,    0xb5c0fbcf, 0xec4d3b2f,    0xe9b5dba5, 0x8189dbbc,    0x3956c25b, 0xf348b538,
           0x59f111f1, 0xb605d019,    0x923f82a4, 0xaf194f9b,    0xab1c5ed5, 0xda6d8118,    0xd807aa98, 0xa3030242,    0x12835b01, 0x45706fbe,
           0x243185be, 0x4ee4b28c,    0x550c7dc3, 0xd5ffb4e2,    0x72be5d74, 0xf27b896f,    0x80deb1fe, 0x3b1696b1,    0x9bdc06a7, 0x25c71235,
           0xc19bf174, 0xcf692694,    0xe49b69c1, 0x9ef14ad2,    0xefbe4786, 0x384f25e3,    0x0fc19dc6, 0x8b8cd5b5,    0x240ca1cc, 0x77ac9c65,
           0x2de92c6f, 0x592b0275,    0x4a7484aa, 0x6ea6e483,    0x5cb0a9dc, 0xbd41fbd4,    0x76f988da, 0x831153b5,    0x983e5152, 0xee66dfab,
           0xa831c66d, 0x2db43210,    0xb00327c8, 0x98fb213f,    0xbf597fc7, 0xbeef0ee4,    0xc6e00bf3, 0x3da88fc2,    0xd5a79147, 0x930aa725,
           0x06ca6351, 0xe003826f,    0x14292967, 0x0a0e6e70,    0x27b70a85, 0x46d22ffc,    0x2e1b2138, 0x5c26c926,    0x4d2c6dfc, 0x5ac42aed,
           0x53380d13, 0x9d95b3df,    0x650a7354, 0x8baf63de,    0x766a0abb, 0x3c77b2a8,    0x81c2c92e, 0x47edaee6,    0x92722c85, 0x1482353b,
           0xa2bfe8a1, 0x4cf10364,    0xa81a664b, 0xbc423001,    0xc24b8b70, 0xd0f89791,    0xc76c51a3, 0x0654be30,    0xd192e819, 0xd6ef5218,
           0xd6990624, 0x5565a910,    0xf40e3585, 0x5771202a,    0x106aa070, 0x32bbd1b8,    0x19a4c116, 0xb8d2d0c8,    0x1e376c08, 0x5141ab53,
           0x2748774c, 0xdf8eeb99,    0x34b0bcb5, 0xe19b48a8,    0x391c0cb3, 0xc5c95a63,    0x4ed8aa4a, 0xe3418acb,    0x5b9cca4f, 0x7763e373,
           0x682e6ff3, 0xd6b2b8a3,    0x748f82ee, 0x5defb2fc,    0x78a5636f, 0x43172f60,    0x84c87814, 0xa1f0ab72,    0x8cc70208, 0x1a6439ec,
           0x90befffa, 0x23631e28,    0xa4506ceb, 0xde82bde9,    0xbef9a3f7, 0xb2c67915,    0xc67178f2, 0xe372532b,    0xca273ece, 0xea26619c,
           0xd186b8c7, 0x21c0c207,    0xeada7dd6, 0xcde0eb1e,    0xf57d4f7f, 0xee6ed178,    0x06f067aa, 0x72176fba,    0x0a637dc5, 0xa2c898a6,
           0x113f9804, 0xbef90dae,    0x1b710b35, 0x131c471b,    0x28db77f5, 0x23047d84,    0x32caab7b, 0x40c72493,    0x3c9ebe0a, 0x15c9bebc,
           0x431d67c4, 0x9c100d4c,    0x4cc5d4be, 0xcb3e42b6,    0x597f299c, 0xfc657e2a,    0x5fcb6fab, 0x3ad6faec,    0x6c44198c, 0x4a475817];

  return new Hash("SHA-512", 128, 64, function(message, h) {

    var h0h, h0l, h1h, h1l, h2h, h2l, h3h, h3l, h4h, h4l, h5h, h5l, h6h, h6l, h7h, h7l;

    /* Initialize hash values */
    if (h) {
      h0h = h[ 0]; h0l = h[ 1]; h1h = h[ 2]; h1l = h[ 3];
      h2h = h[ 4]; h2l = h[ 5]; h3h = h[ 6]; h3l = h[ 7];
      h4h = h[ 8]; h4l = h[ 9]; h5h = h[10]; h5l = h[11];
      h6h = h[12]; h6l = h[13]; h7h = h[14]; h7l = h[15];
    } else {
      h0h = 0x6a09e667; h0l = 0xf3bcc908; h1h = 0xbb67ae85; h1l = 0x84caa73b;
      h2h = 0x3c6ef372; h2l = 0xfe94f82b; h3h = 0xa54ff53a; h3l = 0x5f1d36f1;
      h4h = 0x510e527f; h4l = 0xade682d1; h5h = 0x9b05688c; h5l = 0x2b3e6c1f;
      h6h = 0x1f83d9ab; h6l = 0xfb41bd6b; h7h = 0x5be0cd19; h7l = 0x137e2179;
    }

    /* The expanded message length is a multiple of 128 bytes (1024 bits) */
    var computedLength = message.byteLength + 9; // 0x80 plus 64 bits of message length
    var finalChunkSize = computedLength % 128; // 1024 bits chunks
    var expandedLength = computedLength + (finalChunkSize == 0 ? 0 : 128 - finalChunkSize);

    /* Prepare the real message array (message + 0x80 + ...(zeroes)... + bit length */
    var expanded = new ArrayBuffer(expandedLength);

    /* Copy the message */
    new Uint8Array(expanded).set(message, 0);

    /* Add an extra '1' bit (0x80) after the message, and set the length */
    var expandedView = new DataView(expanded);
    expandedView.setUint8(message.byteLength, 0x80);
    expandedView.setUint32(expanded.byteLength - 4, message.byteLength * 8, false);

    /* Process the message in 1024-bits (128-bytes) chunks */
    for (var offset = 0; offset < expandedLength; offset += 128) {
      for (var i = 0; i < 32; i ++) {
        words[i] = expandedView.getUint32(offset + (i * 4), false);
      }

      for (var i = 32; i < 160; i += 2) {
        // Gamma0
        var gamma0xh = words[i - 30];
        var gamma0xl = words[i - 29];
        var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
        var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

        // Gamma1
        var gamma1xh = words[i - 4];
        var gamma1xl = words[i - 3];
        var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
        var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
        var Wi7h = words[i - 14];
        var Wi7l = words[i - 13];

        var Wi16h = words[i - 32];
        var Wi16l = words[i - 31];

        var Wil = gamma0l + Wi7l;
        var Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
        var Wil = Wil + gamma1l;
        var Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
        var Wil = Wil + Wi16l;
        var Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

        words[i]     = Wih;
        words[i + 1] = Wil;
      }

      /* Initialize working variables to current hash value */
      var ah = h0h; var al = h0l;
      var bh = h1h; var bl = h1l;
      var ch = h2h; var cl = h2l;
      var dh = h3h; var dl = h3l;
      var eh = h4h; var el = h4l;
      var fh = h5h; var fl = h5l;
      var gh = h6h; var gl = h6l;
      var hh = h7h; var hl = h7l;

      /* Compression function main loop */
      for (var i = 0; i < 80; i ++) {
        var chh  = (eh & fh) ^ (~eh & gh);
        var chl  = (el & fl) ^ (~el & gl);
        var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
        var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

        var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
        var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
        var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
        var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

        // t1 = h + sigma1 + ch + K[i] + W[i]
        var hoff = i * 2;
        var loff = hoff + 1;
        var Kih = k[hoff];
        var Kil = k[loff];

        var Wih = words[hoff];
        var Wil = words[loff];

        var t1l = hl + sigma1l;
        var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
        var t1l = t1l + chl;
        var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
        var t1l = t1l + Kil;
        var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
        var t1l = t1l + Wil;
        var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

        // t2 = sigma0 + maj
        var t2l = sigma0l + majl;
        var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

        // Update working variables
        hh = gh;
        hl = gl;
        gh = fh;
        gl = fl;
        fh = eh;
        fl = el;
        el = (dl + t1l);
        eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0));
        dh = ch;
        dl = cl;
        ch = bh;
        cl = bl;
        bh = ah;
        bl = al;
        al = (t1l + t2l);
        ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0));
      }

      /* Add the compressed chunk to the current hash value */
      h0l = (h0l + al);
      h0h = (h0h + ah + ((h0l >>> 0) < (al >>> 0) ? 1 : 0));
      h1l = (h1l + bl);
      h1h = (h1h + bh + ((h1l >>> 0) < (bl >>> 0) ? 1 : 0));
      h2l = (h2l + cl);
      h2h = (h2h + ch + ((h2l >>> 0) < (cl >>> 0) ? 1 : 0));
      h3l = (h3l + dl);
      h3h = (h3h + dh + ((h3l >>> 0) < (dl >>> 0) ? 1 : 0));
      h4l = (h4l + el);
      h4h = (h4h + eh + ((h4l >>> 0) < (el >>> 0) ? 1 : 0));
      h5l = (h5l + fl);
      h5h = (h5h + fh + ((h5l >>> 0) < (fl >>> 0) ? 1 : 0));
      h6l = (h6l + gl);
      h6h = (h6h + gh + ((h6l >>> 0) < (gl >>> 0) ? 1 : 0));
      h7l = (h7l + hl);
      h7h = (h7h + hh + ((h7l >>> 0) < (hl >>> 0) ? 1 : 0));

      /* Remember, Javascript numbers are 64-bits doubles... */
      h0l &= 0x0FFFFFFFF; h0h &= 0x0FFFFFFFF;
      h1l &= 0x0FFFFFFFF; h1h &= 0x0FFFFFFFF;
      h2l &= 0x0FFFFFFFF; h2h &= 0x0FFFFFFFF;
      h3l &= 0x0FFFFFFFF; h3h &= 0x0FFFFFFFF;
      h4l &= 0x0FFFFFFFF; h4h &= 0x0FFFFFFFF;
      h5l &= 0x0FFFFFFFF; h5h &= 0x0FFFFFFFF;
      h6l &= 0x0FFFFFFFF; h6h &= 0x0FFFFFFFF;
      h7l &= 0x0FFFFFFFF; h7h &= 0x0FFFFFFFF;

    }

    /* Put our results in an array */
    var hash = new ArrayBuffer(64);
    var hashView = new DataView(hash);
    hashView.setUint32( 0, h0h, false); hashView.setUint32( 4, h0l, false);
    hashView.setUint32( 8, h1h, false); hashView.setUint32(12, h1l, false);
    hashView.setUint32(16, h2h, false); hashView.setUint32(20, h2l, false);
    hashView.setUint32(24, h3h, false); hashView.setUint32(28, h3l, false);
    hashView.setUint32(32, h4h, false); hashView.setUint32(36, h4l, false);
    hashView.setUint32(40, h5h, false); hashView.setUint32(44, h5l, false);
    hashView.setUint32(48, h6h, false); hashView.setUint32(52, h6l, false);
    hashView.setUint32(56, h7h, false); hashView.setUint32(60, h7l, false);
    return new Uint8Array(hash);

  });


});
