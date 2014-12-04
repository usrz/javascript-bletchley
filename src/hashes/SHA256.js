'use strict';

Esquire.define('bletchley/hashes/SHA256', ['bletchley/hashes/Hash', 'bletchley/utils/extend', 'bletchley/utils/arrays'], function(Hash, extend, arrays) {

  /* Round constants */
  var K = [ 0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2 ];

  /* Hash constants for SHA-256 */
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
           0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  /* Digest and block size for SHA-256 */
  var DIGEST_SIZE = 32;
  var BLOCK_SIZE = 64;
  var NUM_WORDS = 64;

  /* Constructor function */
  return extend(function SHA256(algorithm, digestSize, h) {

    /* Initial values for H */
    if (!h) h = H;
    var h0 = h[0]; var h1 = h[1]; var h2 = h[2]; var h3 = h[3];
    var h4 = h[4]; var h5 = h[5]; var h6 = h[6]; var h7 = h[7];

    /* Final block for updates */
    var final = new Uint8Array(BLOCK_SIZE);
    var fview = new DataView(final.buffer);

    /* Current block, its view and position */
    var block = new Uint8Array(BLOCK_SIZE);
    var bview = new DataView(block.buffer);
    var pos = 0;

    /* Words for compute cycle */
    var words = new Array(NUM_WORDS);

    /* Total digest length */
    var len = 0;

    /* Compute a 64-bytes block */
    function compute(bview) {

      /* Copy as normal numbers (faster) */
      for (var i = 0; i < 16; i ++) {
        words[i] = bview.getUint32(i * 4, false);
      }

      /* Expand our block */
      for (var i = 16; i < NUM_WORDS; i ++) {
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
      for (var i = 0; i < NUM_WORDS; i ++) {
        var ch  = (e & f) ^ (~e & g);
        var maj = (a & b) ^ (a & c) ^ (b & c);

        var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
        var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

        var t1 = h + sigma1 + ch + K[i] + words[i];
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

    };

    Object.defineProperties(this, {

      /* Reset H to their default values */
      "reset": { enumerable: true, configurable: false, value: function() {
        h0 = h[0]; h1 = h[1]; h2 = h[2]; h3 = h[3];
        h4 = h[4]; h5 = h[5]; h6 = h[6]; h7 = h[7];
        len = 0;
        pos = 0;

        /* Return ourselves */
        return this;
      }},


      "update": { enumerable: true, configurable: false, value: function(message) {

        /* Normalize and process the message*/
        message = arrays.toUint8Array(message);
        var mpos = 0;

        /* Copy in chunks to our block */
        while (mpos < message.length) {
          /* Bytes available in the block */
          var blen = BLOCK_SIZE - pos;
          /* Bytes available in the message */
          var mlen = message.length - mpos;
          /* Copy up to 64 bytes (nothing more) */
          var clen = blen < mlen ? blen : mlen;
          /* End message offset after copy */
          var mend = mpos + clen;

          /* Copy the (part of) message in our block */
          block.set(message.subarray(mpos, mend), pos);

          /* Update length and positions */
          len += clen;
          pos += clen;
          mpos = mend;

          /* If we have a full block, compute it */
          if (pos >= BLOCK_SIZE) {
            compute(bview);
            pos = 0;
          }
        }

        /* Return ourselves */
        return this;
      }},

      "finish": { enumerable: true, configurable: false, value: function(output) {

        /* Append the final 0x80 to the message */
        block[pos ++] = 0x80;

        /* Set the length in our final chunk */
        fview.setUint32(60, len * 8, false);

        /* Compute the last chunk, if needed */
        if (pos > 56) {
          /* No space for the message length */
          block.set(final.subarray(0, BLOCK_SIZE - pos), pos);
          compute(bview);
          compute(fview);
        } else {
          block.set(final.subarray(pos), pos);
          compute(bview);
        }

        /* No output? Create a new buffer */
        if (! output) {
          output = new Uint8Array(this.digestSize);
        } else if (!(output instanceof Uint8Array)) {
          throw new Error("Output must be a Uint8Array");
        } else if (output.length < this.digestSize) {
          throw new Error("Required at least " + this.digestSize + " for output");
        }

        /* Write out our result in the output buffer */
        var view = new DataView(output.buffer, output.byteOffset, output.byteLength);
        view.setUint32( 0, h0, false);
        view.setUint32( 4, h1, false);
        view.setUint32( 8, h2, false);
        view.setUint32(12, h3, false);
        view.setUint32(16, h4, false);
        view.setUint32(20, h5, false);
        view.setUint32(24, h6, false);
        if (this.digestSize > 28) {
          view.setUint32(28, h7, false);
        }

        /* Reset and return */
        this.reset();
        return output;
      }}
    });

    /* Super constructor */
    Hash.call(this, algorithm || "SHA-256", BLOCK_SIZE, digestSize || DIGEST_SIZE);
  }, Hash, "SHA256");

});
