'use strict';

/* ========================================================================== *
 * Port of Tom Wu's "rsa.js" and "rsa2.js".                                   *
 * -------------------------------------------------------------------------- *
 * Original source at: http://www-cs-students.stanford.edu/~tjw/jsbn/         *
 * Licensed under BSD: http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE  *
 * ========================================================================== */
Esquire.define('bletchley/ciphers/RSACipher', [ 'bletchley/ciphers/Cipher',
                                                'bletchley/keys/RSAKey',
                                                'bletchley/blocks/Accumulator',
                                                'bletchley/blocks/Chunker',
                                                'bletchley/blocks/Forwarder',
                                                'bletchley/paddings/Padding',
                                                'bletchley/paddings/Paddings',
                                                'bletchley/utils/BigInteger',
                                                'bletchley/random/Random' ],

  function(Cipher, RSAKey, Accumulator, Chunker, Forwarder, Padding, Paddings, BigInteger, Random) {

    var paddings = new Paddings();

    function RSACipher(padding, random) {
      if (!(padding instanceof Padding)) throw new Error("Invalid Padding");
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      /* RFC 3447, section 7.1.1 (OAEP) and section 7.2.1 (PKCS1) */
      this.encrypt = function(key, data, options) {
        if (key.algorithm != 'RSA') throw new Error("Invalid RSA key");
        var blockSize = key.byteLength;

        // accumulate all results...
        var accumulator = new Accumulator();

        // encipher: this will always push a key.blockSize array, which
        // basically means we won't have any need for i2osp padding.
        var cipher = key.encipher(accumulator);

        // padder (PKCS#1 or OAEP) will always return a zero-prefixed array, so
        // cipher will always interpret it as a positive integer
        var pad = (options && options.padding) || "PKCS1";
        var padder = paddings.pad(pad, cipher, random, blockSize, options);

        // chunk up into padder.blockSize (see encypher comment above)
        var chunker = new Chunker(padder, padder.blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }

      /* RFC 3447, section 7.1.2 (OAEP) and section 7.2.2 (PKCS1) */
      this.decrypt = function(key, data, options) {
        if (key.algorithm != 'RSA') throw new Error("Invalid RSA key");
        var blockSize = key.byteLength;

        // accumulate all results...
        var accumulator = new Accumulator();

        // remove the padding from the block
        var pad = (options && options.padding) || "PKCS1";
        var unpadder = paddings.unpad(pad, accumulator, random, blockSize, options);

        // decipher: this will always parse numbers as *POSITIVE* integers
        // (so no need to prepend zeroes) and push a key.blockSize array, which
        // basically means we won't have any need for i2osp padding.
        var cipher = key.decipher(unpadder);

        // chunk up into key.blockSize (see decipher comments above)
        var chunker = new Chunker(cipher, blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }

      Cipher.call(this);
    }

    /* ======================================================================= */

    /* RSACipher extends Cipher */
    return Cipher.$super(RSACipher);
  }
);
