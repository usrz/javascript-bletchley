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
                                                'bletchley/paddings/PKCS1Padder',
                                                'bletchley/paddings/PKCS1Unpadder',
                                                'bletchley/paddings/I2OSPPadder',
                                                'bletchley/paddings/OS2IPUnpadder',
                                                'bletchley/utils/BigInteger',
                                                'bletchley/utils/Random' ],
  function(Accumulator, Chunker, Forwarder, RSAKey, PKCS1Padder, PKCS1Unpadder, I2OSPPadder, OS2IPUnpadder, BigInteger, Random) {

    function RSAEncipher(receiver, key) {
      if (key.e == null) throw new Error("Key lacks public exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(message);
        var r = x.modPowInt(key.e, key.n);
        return this.$next(r.toUint8Array(), last);
      }
      Forwarder.call(this, receiver);
    }

    RSAEncipher.prototype = Object.create(Forwarder.prototype);
    RSAEncipher.prototype.constructor = RSAEncipher;

    function RSADecipher(receiver, key) {
      if (key.d == null) throw new Error("Key lacks private exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(message);
        var r = x.modPow(key.d, key.n);
        return this.$next(r.toUint8Array(), last);
      }
      Forwarder.call(this, receiver);
    }

    RSADecipher.prototype = Object.create(Forwarder.prototype);
    RSADecipher.prototype.constructor = RSADecipher;

    function RSACipher(key, random) {
      if (!(key instanceof RSAKey)) throw new Error("Invalid RSA key");
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      var blockSize = key.blockSize;
      console.log("BLOCKSIZE", blockSize);

      /* RFC 3447, section 7.1.1 (OAEP) and section 7.2.1 (PKCS1) */
      this.encrypt = function(data) {
        // from bottom to top!
        var accumulator = new Accumulator();
        // make sure we have blockSize messages, anything else is wrong
        var i2ospPadder = new I2OSPPadder(accumulator, blockSize);
        // perform our wonderful RSA: (message ^ key.e) mod key.n
        var rsaEncipher = new RSAEncipher(i2ospPadder, key);
        // we can avoid OS2IP padding here, as encipher will use the number,
        // and PKCS1 blocks always start with 0x00 0x02 (so, positive integer)
        var pkcs1Padder = new PKCS1Padder(rsaEncipher, random, blockSize);
        // chunk up into blockSize - 11 elements (see encypher above)
        var chunker = new Chunker(pkcs1Padder, pkcs1Padder.blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }

      /* RFC 3447, section 7.1.2 (OAEP) and section 7.2.2 (PKCS1) */
      this.decrypt = function(data) {
        // again, bottom to top!
        var accumulator = new Accumulator();
        // remove the randomness from the block, and check it
        var pkcs1Unpadder = new PKCS1Unpadder(accumulator, blockSize);
        // now we want a blockSize array, it will start with 0x00 0x02
        var i2ospPadder = new I2OSPPadder(pkcs1Unpadder, blockSize);
        // the magic of RSA:  (message ^ key.d) mod key.n
        var rsaDecipher = new RSADecipher(i2ospPadder, key);
        // os2ip guarantees we have a positive integer
        var os2ipUnpadder = new OS2IPUnpadder(rsaDecipher, blockSize);
        // chunk up into blockSize (see decypher above)
        var chunker = new Chunker(os2ipUnpadder, blockSize);

        // do it!
        var result = chunker.push(data, true);
        return result;
      }
    }

    return RSACipher;
  }
);
