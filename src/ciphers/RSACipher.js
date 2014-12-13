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


    function I2OSP(receiver, keySize) {

      /* Zeroes and buffer */
      var zeroes = new Uint8Array(keySize);
      var buffer = new Uint8Array(keySize);

      Object.defineProperties(this, {
        "push": { enumerable: true, configurable: false, value: function(message, last) {

          /* Accept messages bigger than keySize if prepended by zeroes */
          if (message.length > keySize) {
            var offset = message.length - keySize;
            for (var i = 0; i < offset; i ++) {
              if (message[i] != 0) throw new Error("Message too big (max " + keySize + " bytes)");
            }
            return this.$next(message.subarray(offset), last);
          }

          /* Precisely correct size, push unchanged */
          if (message.length == keySize) return this.$next(message, last);

          /* Message must be padded with zeroes */
          var offset = keySize - message.length;
          buffer.set(zeroes.subarray(0, offset));
          buffer.set(message, offset);
          return this.$next(buffer, last);

        }}
      });

      Forwarder.call(this, receiver);
    }

    I2OSP.prototype = Object.create(Forwarder.prototype);
    I2OSP.prototype.constructor = I2OSP;

    /* ======================================================================= */

    function RSAEncipher(receiver, key) {
      if (key.e == null) throw new Error("Key lacks public exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(1, message);
        var r = x.modPowInt(key.e, key.n);
        return this.$next(r.toUint8Array(), last);
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
        return this.$next(r.toUint8Array(), last);
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
        // from bottom to top!
        var accumulator = new Accumulator();
        // make sure we have blockSize messages, anything else is wrong
        var i2osp = new I2OSP(accumulator, blockSize);

        // perform our wonderful RSA: (message ^ key.e) mod key.n
        var rsaEncipher = new RSAEncipher(i2osp, key);

        //var os2ipPadder2 = new I2OSPPadder(rsaEncipher, blockSize);
        // var os2ipPadder2 = rsaEncipher;


        // we can avoid OS2IP padding here, as encipher will use the number,
        // and PKCS1 blocks always start with 0x00 0x02 (so, positive integer)
        var padder = padding.pad(rsaEncipher, random, blockSize);



        // chunk up into blockSize - 11 elements (see encypher above)
        var chunker = new Chunker(padder, padder.blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }

      /* RFC 3447, section 7.1.2 (OAEP) and section 7.2.2 (PKCS1) */
      this.decrypt = function(data) {
        // again, bottom to top!
        var accumulator = new Accumulator();
        // remove the randomness from the block, and check it
        var unpadder = padding.unpad(accumulator, random, blockSize);
        // now we want a blockSize array, it will start with 0x00 0x02
        var i2osp = new I2OSP(unpadder, blockSize);
        // the magic of RSA:  (message ^ key.d) mod key.n
        var rsaDecipher = new RSADecipher(i2osp, key);
        // os2ip guarantees we have a positive integer
        //var os2ipUnpadder = new OS2IPUnpadder(rsaDecipher, blockSize);
        //var os2ipUnpadder = rsaDecipher;
        // chunk up into blockSize (see decypher above)
        var chunker = new Chunker(rsaDecipher, blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }
    }

    return RSACipher;
  }
);
