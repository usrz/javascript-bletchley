'use strict';

Esquire.define('bletchley/hashes/SHA1', ['bletchley/hashes/Hash2', 'bletchley/utils/extend', 'bletchley/utils/arrays'], function(Hash, extend, arrays) {

  /* Hash constants for SHA1 */
  var h = [ 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0 ];

  /* Digest and block size for SHA1 */
  var DIGEST_SIZE = 20;
  var BLOCK_SIZE = 64;

  /* Constructor function */
  return extend(function SHA1() {

    /* Initial values for H */
    var h0 = h[0]; var h1 = h[1]; var h2 = h[2]; var h3 = h[3]; var h4 = h[4];

    /* Computed hash and its data view */
    var hash = new Uint8Array(DIGEST_SIZE);
    var view = new DataView(hash.buffer);

    /* Final block for updates */
    var final = new Uint8Array(BLOCK_SIZE);
    var fview = new DataView(final.buffer);

    /* Current block, its view and position */
    var block = new Uint8Array(BLOCK_SIZE);
    var bview = new DataView(block.buffer);
    var pos = 0;

    /* Words for compute cycle */
    var words = new Array(80);

    /* Total digest length */
    var len = 0;

    /* Compute a 64-bytes block */
    function compute(bview) {

      /* Copy as normal numbers (faster) */
      for (var i = 0; i < 16; i ++) {
        words[i] = bview.getUint32((i * 4), false);
      }

      /* Expand our block */
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

    };

    Object.defineProperties(this, {

      /* Reset H to their default values */
      "reset": { enumerable: true, configurable: false, value: function() {
        h0 = h[0]; h1 = h[1]; h2 = h[2]; h3 = h[3]; h4 = h[4];
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
          var blen = 64 - pos;
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
          block.set(final.subarray(0, 64 - pos), pos);
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

        /* Reset and return */
        this.reset();
        return output;

      }}
    });

    /* Super constructor */
    Hash.call(this, "SHA1", BLOCK_SIZE, DIGEST_SIZE);
  }, Hash, "SHA1");

});
