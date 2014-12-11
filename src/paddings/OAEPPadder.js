'use strict';

/* ========================================================================== *
 * Ported from CryptoJS contribution by Jeff Mott                             *
 * https://groups.google.com/forum/#!topic/crypto-js/VotElO00yHc              *
 * ========================================================================== */
Esquire.define('bletchley/paddings/OAEPPadding', [ 'bletchley/paddings/Padding',
                                                   'bletchley/blocks/Forwarder',
                                                   'bletchley/utils/Random',
                                                   'bletchley/utils/arrays',
                                                   'bletchley/hashes/SHA1',
                                                   'bletchley/codecs/Codecs' ],
  function(Padding, Forwarder, Random, arrays, SHA1, Codecs) {

    var codecs = new Codecs();
    function debug(name, array) {
      var str = codecs.encode('HEX', array);
      var arr = str.split(/(?=(?:..)*$)/);
      console.log(name, array.length, arr.join(' '));
    }

    /* ====================================================================== */

    function mgf(hash, Z, l) {
      var blocks = Math.floor(l / hash.digestSize) + (l % hash.digestSize == 0 ? 0 : 1);
      var T = new Uint8Array(hash.digestSize * blocks);
      var C = new Uint8Array(4);
      var Cv = new DataView(C.buffer);
      var offset = 0;
      // var i = 0;
        console.log("Z", Z);
      for (var i = 0; i < blocks; i ++) {
        Cv.setUint32(0, i, false);
        console.log("C", C);
        hash.reset()
            .update(Z)
            .update(C)
            .digest(T.subarray(offset));
        offset += hash.digestSize;
      }
      T = T.subarray(0, l);
      console.log("L", T.length, l);
      return T;
    }

    /* ====================================================================== */

    var one = new Uint8Array([0x01,0x00,0x00,0x00]);
    var sha1 = new SHA1();

    function OAEPPadder(receiver, random, keySize, hash) {
      if (! hash) hash = sha1; // hash is optional
      var hashSize = hash.digestSize;

      var overHead = 2 + (2 * hashSize);
      var minKeySize = overHead + 22; // SHA1 w 512 bit key

      if (!(random instanceof Random)) throw new Error("Invalid Random");
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < minKeySize) throw new Error("Key size must be at least " + minKeySize + " (" + (minKeySize * 8) + " bit)");

      var blockSize = overHead; // at least 22
      console.log("OVH", overHead);

      Object.defineProperties(this, {
        "blockSize": { enumerable: true, configurable: false, value: blockSize },
        "push":      { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length > blockSize) throw new Error("Message too big (max " + blockSize + " bytes)");

          console.log("KEYSIZE", keySize);

          debug("MESSAGE", message);

          var pHash = hash.hash('');

          debug("pHash", pHash);

          var PS = new Uint8Array(keySize - message.length - overHead);

          debug("Padding", PS);

          var DB = new Uint8Array(pHash.length + PS.length + 1 + message.length);
          DB.set(pHash);
          DB[pHash.length + PS.length] = 1;
          DB.set(message, pHash.length + PS.length + 1);

          debug("DB", DB);

          var seed = random.nextBytes(hashSize);

          debug("SEED", seed);

          var dbMask = mgf(hash, seed, DB.length);

          debug("dbMask", dbMask);

          var maskedDB = arrays.xorUint8Arrays(DB, dbMask);

          debug("maskedDB", maskedDB);

          var seedMask = mgf(hash, maskedDB, seed.length);

          debug("seedMask", seedMask);

          var maskedSeed = arrays.xorUint8Arrays(seed, seedMask);

          debug("maskedSeed", maskedSeed);

          var result = new Uint8Array(maskedSeed.length + maskedDB.length);
          result.set(maskedSeed);
          result.set(maskedDB, maskedSeed.length);

          debug("EM", result);

          return this.$next(result, last);
        }}
      });

      Forwarder.call(this, receiver);
    }

    OAEPPadder.prototype = Object.create(Forwarder.prototype);
    OAEPPadder.prototype.constructor = OAEPPadder;

    /* ====================================================================== */

    /* ====================================================================== */

    function OAEPPadding() {
      Padding.call(this, "OAEP");
    }

    OAEPPadding.prototype = Object.create(Padding.prototype);
    OAEPPadding.prototype.constructor = OAEPPadding;

    OAEPPadding.prototype.pad = function(receiver, random, keySize) {
      return new OAEPPadder(receiver, random, keySize);
    };

    OAEPPadding.prototype.unpad = function(receiver, random, keySize) {
      return new OAEPUnpadder(receiver, keySize);
    };

    return OAEPPadding;

  }
);
