'use strict';

/* ========================================================================== *
 * Port of Tom Wu's "rsa.js" and "rsa2.js".                                   *
 * -------------------------------------------------------------------------- *
 * Original source at: http://www-cs-students.stanford.edu/~tjw/jsbn/         *
 * Licensed under BSD: http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE  *
 * ========================================================================== */
Esquire.define('bletchley/ciphers/RSACipher', [ 'bletchley/blocks/Accumulator',
                                                'bletchley/blocks/Chunker',
                                                'bletchley/blocks/Forwarder',
                                                'bletchley/ciphers/RSAKey',
                                                'bletchley/paddings/Padding',
                                                'bletchley/utils/BigInteger',
                                                'bletchley/utils/Random' ],
  function(Accumulator, Chunker, Forwarder, RSAKey, Padding, BigInteger, Random) {


    function RSAEncipher(receiver, key) {
      if (key.e == null) throw new Error("Key lacks public exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(message);
        var r = x.modPowInt(key.e, key.n);

        // Allocating an array here allows us to go without I2OSP
        var buffer = new Uint8Array(key.blockSize + 1); // always leading zero
        var offset = buffer.length - r.byteLength();
        r.toUint8Array(buffer.subarray(offset));

        // Always push the block of the correct size
        return this.$next(buffer.subarray(1), last);
      }
      Forwarder.call(this, receiver);
    }

    RSAEncipher.prototype = Object.create(Forwarder.prototype);
    RSAEncipher.prototype.constructor = RSAEncipher;

    /* ======================================================================= */

    function RSADecipher(receiver, key) {
      if (key.d == null) throw new Error("Key lacks private exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(1, message);
        var r = x.modPow(key.d, key.n);

        var buffer = new Uint8Array(key.blockSize + 1); // always leading zero
        var offset = buffer.length - r.byteLength();
        r.toUint8Array(buffer.subarray(offset));

        return this.$next(buffer.subarray(1), last);
        // return this.$next(r.toUint8Array(), last);
      }
      Forwarder.call(this, receiver);
    }

    RSADecipher.prototype = Object.create(Forwarder.prototype);
    RSADecipher.prototype.constructor = RSADecipher;

    /* ======================================================================= */

    function RSACipher(key, padding, random) {
      if (!(key instanceof RSAKey)) throw new Error("Invalid RSA key");
      if (!(padding instanceof Padding)) throw new Error("Invalid Padding");
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      var blockSize = key.blockSize;

      /* RFC 3447, section 7.1.1 (OAEP) and section 7.2.1 (PKCS1) */
      this.encrypt = function(data) {

        // accumulate all results...
        var accumulator = new Accumulator();

        // encipher: this will always push a key.blockSize array, which
        // basically means we won't have any need for i2osp padding.
        var cipher = new RSAEncipher(accumulator, key);

        // padder (PKCS#1 or OAEP) will always return a zero-prefixed array, so
        // cipher will always interpret it as a positive integer
        var padder = padding.pad(cipher, random, blockSize);

        // chunk up into padder.blockSize (see encypher comment above)
        var chunker = new Chunker(padder, padder.blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }

      /* RFC 3447, section 7.1.2 (OAEP) and section 7.2.2 (PKCS1) */
      this.decrypt = function(data) {

        // accumulate all results...
        var accumulator = new Accumulator();

        // remove the padding from the block
        var unpadder = padding.unpad(accumulator, random, blockSize);

        // decipher: this will always parse numbers as *POSITIVE* integers
        // (so no need to prepend zeroes) and push a key.blockSize array, which
        // basically means we won't have any need for i2osp padding.
        var cipher = new RSADecipher(unpadder, key);

        // chunk up into key.blockSize (see decypher comments above)
        var chunker = new Chunker(cipher, blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }
    }

    return RSACipher;
  }
);
