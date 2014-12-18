'use strict';

/* ========================================================================== *
 * Ported from CryptoJS contribution by Jeff Mott                             *
 * https://groups.google.com/forum/#!topic/crypto-js/VotElO00yHc              *
 * ========================================================================== */
Esquire.define('bletchley/paddings/OAEPPadding', [ 'bletchley/paddings/Padding',
                                                   'bletchley/blocks/Forwarder',
                                                   'bletchley/hashes/Hashes',
                                                   'bletchley/random/Random',
                                                   'bletchley/utils/arrays' ],
  function(Padding, Forwarder, Hashes, Random, arrays) {

    /* Hashes and empty label */
    var hashes = new Hashes();
    var emptyLabel = new Uint8Array();
    var defaultHash = hashes.$helper("SHA1");

    /* Counter buffer for MGF function, they can be reused */
    var C = new Uint8Array(4);
    var Cv = new DataView(C.buffer);

    /* MGF1 function expanding Z in T */
    function mgf(hash, Z, T) {
      var hashSize = hash.digestSize;
      var H = new Uint8Array(hashSize);
      var l = T.length;

      for (var offset = 0, i = 0; offset < l; i ++, offset += hashSize) {
        // C will contain our iteration
        Cv.setUint32(0, i, false);

        // Hash concat(Z, C) into H
        hash.reset().update(Z).update(C).digest(H);

        // r => bytes left to write in T
        var r = l - offset;
        if (r >= hashSize) T.set(H, offset);
        else T.set(H.subarray(0, r), offset);
      }

      return T;
    }

    /* ====================================================================== */

    function OAEPPadder(receiver, random, keySize, hash, label) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < 64) throw new Error("Key size must be at least 64 (512 bit)");

      /* Blocksize and overhead */
      var hashSize = hash.digestSize;
      var blockSize = keySize - (2 + (2 * hashSize));

      /*
       * OAEP will always pad things to a "keySize" long array as:
       *
       * - "0": single zero byte prepended to all output
       * - maskedSeed: hash.digestSize masked seed
       * - maskedDB: our masked data block, effectively (keySize-hashLeght-1)
       *
       * so, let's get some room to work:
       *
       * - buff: storing concat("0", maskedSeed, maskedDB)
       * - seed: hashSize long buffer for our random seed
       */
      var buff = new Uint8Array(keySize);
      var seed = new Uint8Array(hashSize);
      var dbSize = keySize - hashSize - 1;

      Object.defineProperties(this, {
        "blockSize": { enumerable: true, configurable: false, value: blockSize },
        "push":      { enumerable: true, configurable: false, value: function(message, last) {

          /* Check block size */
          if (message.length > blockSize) {
            throw new Error("Message too big (max " + blockSize + " bytes, gotten " + message.length + ")");
          }

          /*
           * Prepare our data block: do not recycle "db" here, as we want
           * zeroes in there for proper padding of the message
           */
          var db = new Uint8Array(dbSize);

          /* Start with our label hash */
          hash.reset().update(label).digest(db.subarray(0, hashSize));

          /* Zero padding, then add our "1" and finally the message */
          db[dbSize - message.length - 1] = 1;
          db.set(message, dbSize - message.length);

          /* Seed hashSize random bytes in our "seed" array */
          random.nextBytes(seed);

          /* Use MGF to expand our seed to the DB mask, then xor it in place */
          var maskedDB = mgf(hash, seed, buff.subarray(hashSize + 1));
          arrays.xorUint8Arrays(db, maskedDB, maskedDB);

          /* Use MGF to expand our maskeDB, then xor it in place */
          var maskedSeed = mgf(hash, maskedDB, buff.subarray(1, hashSize + 1));
          arrays.xorUint8Arrays(seed, maskedSeed, maskedSeed);

          /*
           * By the power of subarrays, we now have our "temp" array containing
           * precisely the concatenation of (maskedSeed, maskedDB) at offset 1.
           *
           * Just make sure we correctly set the "0" byte at the beginning, just
           * in ase somewhere else something went wrong and we're recycling the
           * buffer space...
           */
          buff[0] = 0;
          return this.$next(buff, last);
        }}
      });

      Forwarder.call(this, receiver);
    }

    OAEPPadder.prototype = Object.create(Forwarder.prototype);
    OAEPPadder.prototype.constructor = OAEPPadder;

    /* ====================================================================== */

    function OAEPUnpadder(receiver, keySize, hash) {
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < 64) throw new Error("Key size must be at least 64 (512 bit)");

      /* We can reuse some buffers */
      var hashSize = hash.digestSize;
      var seed = new Uint8Array(hashSize);
      var dbSize = keySize - hashSize - 1;
      var db = new Uint8Array(dbSize);

      Object.defineProperties(this, {
        "push":      { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length != keySize) throw new Error("Message must have the same length as key");
          if (message[0] != 0) throw new Error("Message must have a leading zero");

          /* Extract our masked seed and DB from the message */
          var maskedSeed = message.subarray(1, hashSize + 1);
          var maskedDB = message.subarray(hashSize + 1);

          /* Expand the masked DB to calulate the seed mask, and xor in place */
          mgf(hash, maskedDB, seed);
          arrays.xorUint8Arrays(maskedSeed, seed, seed);

          /* Expand our seed, to get the DB mask, and xor it in place */
          mgf(hash, seed, db);
          arrays.xorUint8Arrays(maskedDB, db, db);

          /* Figure our where in the DB is our last zero from the padding */
          for (var i = hashSize; (i < dbSize) && (db[i] == 0); i ++);

          /* Check that we have a "1" after the last zero */
          if ((i < dbSize) && (db[i] == 1)) {
            return this.$next(db.subarray(i + 1), last);
          }

          /* Uh, bad OAEP format */
          throw new Error("OAEP padding format error");
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

    OAEPPadding.prototype.pad = function(receiver, random, keySize, options) {
      var hash = defaultHash;
      var label = emptyLabel;
      if (options) {
        if (options.hash) hash = hashes.$helper(options.hash);
        if (options.label) label = arrays.toUint8Array(options.label);
      }
      return new OAEPPadder(receiver, random, keySize, hash, label);
    };

    OAEPPadding.prototype.unpad = function(receiver, random, keySize, options) {
      var hash = defaultHash;
      if (options && options.hash) hash = hashes.$helper(options.hash);
      return new OAEPUnpadder(receiver, keySize, hash);
    };

    return OAEPPadding;

  }
);
