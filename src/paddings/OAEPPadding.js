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
      //console.log(name, array.length, "\n" + arr.join(' '));
    }

    /* ====================================================================== */
    /* Keep those as variables for now, we will want to customize them one    */
    /* day by allowing to specify MGF, hash, and encoding parameter           */
    /* ====================================================================== */

    /* SHA1 as hash */
    var hash = new SHA1();

    /* SHA1 of zero-lenght array */
    var pHash = new Uint8Array([0xda, 0x39, 0xa3, 0xee, 0x5e, 0x6b, 0x4b, 0x0d, 0x32, 0x55,
                                0xbf, 0xef, 0x95, 0x60, 0x18, 0x90, 0xaf, 0xd8, 0x07, 0x09]);

    /* SHA1 digest size */
    var hashSize = 20;

    /* MGF1 function */
    function mgf(Z, l) {
      var blocks = Math.floor(l / hashSize) + (l % hashSize == 0 ? 0 : 1);
      var T = new Uint8Array(hashSize * blocks);
      var C = new Uint8Array(4);
      var Cv = new DataView(C.buffer);
      var offset = 0;


      for (var i = 0; i < blocks; i ++) {
        Cv.setUint32(0, i, false);
        hash.reset()
            .update(Z)
            .update(C)
            .digest(T.subarray(offset));
        offset += hashSize;
      }

      return T.subarray(0, l);
    }

    /* ====================================================================== */

    function OAEPPadder(receiver, random, keySize) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < 64) throw new Error("Key size must be at least 64 (512 bit)");

      /* Blocksize and overhead */
      var overHead = 2 + (2 * hashSize);
      var blockSize = keySize - overHead;
      var dbSize = blockSize + hashSize + 1;

      Object.defineProperties(this, {
        "blockSize": { enumerable: true, configurable: false, value: blockSize },
        "push":      { enumerable: true, configurable: false, value: function(message, last) {

          /* Check block size */
          if (message.length > blockSize) {
            throw new Error("Message too big (max " + blockSize + " bytes, gotten " + message.length + ")");
          }

          debug("EM", message);

          /* Our buffer for data block and its mask */
          var buff = new Uint8Array(keySize);
          var mask = new Uint8Array(keySize);

          //db =

          /* Prepare our data block */
          var DB = new Uint8Array(dbSize);
          DB.set(pHash);
          //DB[hashSize + PS.length] = 1;
          //DB.set(message, hashSize + PS.length + 1);
          DB[DB.length - message.length - 1] = 1;
          DB.set(message, DB.length - message.length);

          //console.log("CHECK", DB.length, keySize, blockSize, keySize - DB.length, DB.length - blockSize);

          debug("DB", DB);

          var seed = random.nextBytes(hashSize);

          debug("SEED", seed);

          var dbMask = mgf(seed, DB.length);

          debug("dbMask", dbMask);

          var maskedDB = arrays.xorUint8Arrays(DB, dbMask);

          debug("maskedDB", maskedDB);

          var seedMask = mgf(maskedDB, seed.length);

          debug("seedMask", seedMask);

          var maskedSeed = arrays.xorUint8Arrays(seed, seedMask);

          debug("maskedSeed", maskedSeed);

          // The initial byte is always "0" here...
          var result = new Uint8Array(maskedSeed.length + maskedDB.length + 1);
          result.set(maskedSeed, 1);
          result.set(maskedDB, maskedSeed.length + 1);

          // KEYSIZE - 1
          // console.log("CHECK", result.length, keySize);

          debug("EM", result);
          //console.log("EM0", result[0] > 127);

          return this.$next(result, last);
        }}
      });

      Forwarder.call(this, receiver);
    }

    OAEPPadder.prototype = Object.create(Forwarder.prototype);
    OAEPPadder.prototype.constructor = OAEPPadder;

    /* ====================================================================== */

    function OAEPUnpadder(receiver, keySize) {
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < 64) throw new Error("Key size must be at least 64 (512 bit)");

      /* Blocksize and overhead */
      var overHead = 2 + (2 * hashSize);
      var blockSize = keySize - overHead;
      var dbSize = blockSize + hashSize + 1;

      Object.defineProperties(this, {
        "push":      { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length != keySize) throw new Error("Message must have the same length as key");

          debug("EM", message);
          var maskedSeed = message.subarray(1, hashSize + 1);
          var maskedDB = message.subarray(hashSize + 1);

          debug("maskedSeed", maskedSeed);
          debug("maskedDB", maskedDB);

          var seedMask = mgf(maskedDB, hashSize);
          debug("seedMask", seedMask);

          var seed = arrays.xorUint8Arrays(maskedSeed, seedMask);
          debug("seed", seed);

          var dbMask = mgf(seed, dbSize);
          debug("dbMask", dbMask);

          var DB = arrays.xorUint8Arrays(maskedDB, dbMask);
          debug("DB", DB);

          for (var i = hashSize; (i < dbSize) && (DB[i] == 0); i ++);
          if ((i < dbSize) && (DB[i] == 1)) {
            debug("message", DB.subarray(i + 1));
            return this.$next(DB.subarray(i + 1), last);
          } else {
            throw new Error("OAEP padding format error");
          }
        }
      }});

      Forwarder.call(this, receiver);
    }

    OAEPUnpadder.prototype = Object.create(Forwarder.prototype);
    OAEPUnpadder.prototype.constructor = OAEPUnpadder;


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
