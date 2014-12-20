'use strict';

Esquire.define('bletchley/kdfs/SCrypt', [ 'bletchley/kdfs/KDF',
                                          'bletchley/utils/arrays' ],

  function(KDF, arrays) {

    /*
     * This is an optimization: salsa20_8 is called roughly half a million times
     * for a "normal" 16384 iterations computation. By relying on the little
     * endian-ness of the JavaScript VM we avoid one (lengthy) copy operation...
     */
    var BIG_ENDIAN = (function() {
      var buffer = new Int32Array([1]).buffer;
      if (new DataView(buffer).getInt32(0, false) === 1) return true;
      if (new DataView(buffer).getInt32(0,  true) === 1) return false;
      throw new Error("Unable to determine big/little endianness");
    })();

    /* Utility to XOR two byte arrays */
    function blockxor(S, Si, D, Di, len) {
      for (var i = 0; i < len; i++) {
        D[Di + i] ^= S[Si + i];
      }
    }

    /* ======================================================================== */

    function scryptROMix(buffer, iterations, parallelization, blockSize) {

      /* Initial declaration of our variables */
      var blockSizeTimes128 = blockSize * 128;
      var intIndex = (2 * blockSize - 1) * 64;

      var bufferV = new Uint8Array(blockSizeTimes128 * iterations); // <- LARGE!!!
      var buffer1 = new Uint8Array(blockSizeTimes128 * 2);
      var buffer2 = new Uint8Array(64);

      /* Buffer data view 1 for integerification and 2 for salsa */
      var buffer1View = new DataView(buffer1.buffer);
      var buffer2View = BIG_ENDIAN ? new DataView(buffer2.buffer) :
                                     new Int32Array(buffer2.buffer);

      /* ====================================================================== */

      /* The scryptBlockMix Algorithm */
      function salsa20_8() {

        /* Using variable seems faster than using arrays */
        var t_00, t_01, t_02, t_03, t_04, t_05, t_06, t_07,
            t_08, t_09, t_10, t_11, t_12, t_13, t_14, t_15;

        /* If on big-endian, make sure our numbers are right */
        if (BIG_ENDIAN) {
          t_00 = buffer2View.getInt32( 0, true);
          t_01 = buffer2View.getInt32( 4, true);
          t_02 = buffer2View.getInt32( 8, true);
          t_03 = buffer2View.getInt32(12, true);
          t_04 = buffer2View.getInt32(16, true);
          t_05 = buffer2View.getInt32(20, true);
          t_06 = buffer2View.getInt32(24, true);
          t_07 = buffer2View.getInt32(28, true);
          t_08 = buffer2View.getInt32(32, true);
          t_09 = buffer2View.getInt32(36, true);
          t_10 = buffer2View.getInt32(40, true);
          t_11 = buffer2View.getInt32(44, true);
          t_12 = buffer2View.getInt32(48, true);
          t_13 = buffer2View.getInt32(52, true);
          t_14 = buffer2View.getInt32(56, true);
          t_15 = buffer2View.getInt32(60, true);
        } else {
          t_00 = buffer2View[ 0]; t_01 = buffer2View[ 1];
          t_02 = buffer2View[ 2]; t_03 = buffer2View[ 3];
          t_04 = buffer2View[ 4]; t_05 = buffer2View[ 5];
          t_06 = buffer2View[ 6]; t_07 = buffer2View[ 7];
          t_08 = buffer2View[ 8]; t_09 = buffer2View[ 9];
          t_10 = buffer2View[10]; t_11 = buffer2View[11];
          t_12 = buffer2View[12]; t_13 = buffer2View[13];
          t_14 = buffer2View[14]; t_15 = buffer2View[15];
        }

        /* Doing R(a,b) { return (a << b) | (a >>> (32 - b)) } is faster in-line */
        for (var i = 8; i > 0; i -= 2) {
          t_04 ^= ((t_00 + t_12) <<  7) | ((t_00 + t_12) >>> 25);
          t_08 ^= ((t_04 + t_00) <<  9) | ((t_04 + t_00) >>> 23);
          t_12 ^= ((t_08 + t_04) << 13) | ((t_08 + t_04) >>> 19);
          t_00 ^= ((t_12 + t_08) << 18) | ((t_12 + t_08) >>> 14);
          t_09 ^= ((t_05 + t_01) <<  7) | ((t_05 + t_01) >>> 25);
          t_13 ^= ((t_09 + t_05) <<  9) | ((t_09 + t_05) >>> 23);
          t_01 ^= ((t_13 + t_09) << 13) | ((t_13 + t_09) >>> 19);
          t_05 ^= ((t_01 + t_13) << 18) | ((t_01 + t_13) >>> 14);
          t_14 ^= ((t_10 + t_06) <<  7) | ((t_10 + t_06) >>> 25);
          t_02 ^= ((t_14 + t_10) <<  9) | ((t_14 + t_10) >>> 23);
          t_06 ^= ((t_02 + t_14) << 13) | ((t_02 + t_14) >>> 19);
          t_10 ^= ((t_06 + t_02) << 18) | ((t_06 + t_02) >>> 14);
          t_03 ^= ((t_15 + t_11) <<  7) | ((t_15 + t_11) >>> 25);
          t_07 ^= ((t_03 + t_15) <<  9) | ((t_03 + t_15) >>> 23);
          t_11 ^= ((t_07 + t_03) << 13) | ((t_07 + t_03) >>> 19);
          t_15 ^= ((t_11 + t_07) << 18) | ((t_11 + t_07) >>> 14);
          t_01 ^= ((t_00 + t_03) <<  7) | ((t_00 + t_03) >>> 25);
          t_02 ^= ((t_01 + t_00) <<  9) | ((t_01 + t_00) >>> 23);
          t_03 ^= ((t_02 + t_01) << 13) | ((t_02 + t_01) >>> 19);
          t_00 ^= ((t_03 + t_02) << 18) | ((t_03 + t_02) >>> 14);
          t_06 ^= ((t_05 + t_04) <<  7) | ((t_05 + t_04) >>> 25);
          t_07 ^= ((t_06 + t_05) <<  9) | ((t_06 + t_05) >>> 23);
          t_04 ^= ((t_07 + t_06) << 13) | ((t_07 + t_06) >>> 19);
          t_05 ^= ((t_04 + t_07) << 18) | ((t_04 + t_07) >>> 14);
          t_11 ^= ((t_10 + t_09) <<  7) | ((t_10 + t_09) >>> 25);
          t_08 ^= ((t_11 + t_10) <<  9) | ((t_11 + t_10) >>> 23);
          t_09 ^= ((t_08 + t_11) << 13) | ((t_08 + t_11) >>> 19);
          t_10 ^= ((t_09 + t_08) << 18) | ((t_09 + t_08) >>> 14);
          t_12 ^= ((t_15 + t_14) <<  7) | ((t_15 + t_14) >>> 25);
          t_13 ^= ((t_12 + t_15) <<  9) | ((t_12 + t_15) >>> 23);
          t_14 ^= ((t_13 + t_12) << 13) | ((t_13 + t_12) >>> 19);
          t_15 ^= ((t_14 + t_13) << 18) | ((t_14 + t_13) >>> 14);
        }

        if (BIG_ENDIAN) {
          buffer2View.setInt32( 0, buffer2View.getInt32( 0, true) + t_00, true);
          buffer2View.setInt32( 4, buffer2View.getInt32( 4, true) + t_01, true);
          buffer2View.setInt32( 8, buffer2View.getInt32( 8, true) + t_02, true);
          buffer2View.setInt32(12, buffer2View.getInt32(12, true) + t_03, true);
          buffer2View.setInt32(16, buffer2View.getInt32(16, true) + t_04, true);
          buffer2View.setInt32(20, buffer2View.getInt32(20, true) + t_05, true);
          buffer2View.setInt32(24, buffer2View.getInt32(24, true) + t_06, true);
          buffer2View.setInt32(28, buffer2View.getInt32(28, true) + t_07, true);
          buffer2View.setInt32(32, buffer2View.getInt32(32, true) + t_08, true);
          buffer2View.setInt32(36, buffer2View.getInt32(36, true) + t_09, true);
          buffer2View.setInt32(40, buffer2View.getInt32(40, true) + t_10, true);
          buffer2View.setInt32(44, buffer2View.getInt32(44, true) + t_11, true);
          buffer2View.setInt32(48, buffer2View.getInt32(48, true) + t_12, true);
          buffer2View.setInt32(52, buffer2View.getInt32(52, true) + t_13, true);
          buffer2View.setInt32(56, buffer2View.getInt32(56, true) + t_14, true);
          buffer2View.setInt32(60, buffer2View.getInt32(60, true) + t_15, true);
        } else {
          buffer2View[ 0] += t_00; buffer2View[ 1] += t_01;
          buffer2View[ 2] += t_02; buffer2View[ 3] += t_03;
          buffer2View[ 4] += t_04; buffer2View[ 5] += t_05;
          buffer2View[ 6] += t_06; buffer2View[ 7] += t_07;
          buffer2View[ 8] += t_08; buffer2View[ 9] += t_09;
          buffer2View[10] += t_10; buffer2View[11] += t_11;
          buffer2View[12] += t_12; buffer2View[13] += t_13;
          buffer2View[14] += t_14; buffer2View[15] += t_15;
        }
      }

      /* ====================================================================== */

      /* The scryptBlockMix Algorithm */
      function scryptBlockMix() {
        // arraycopy(buffer1, intIndex, buffer2, 0, 64);
        buffer2.set(buffer1.subarray(intIndex, intIndex + 64));

        for (var i = 0; i < 2 * blockSize; i++) {
          blockxor(buffer1, i * 64, buffer2, 0, 64);
          salsa20_8();
          // arraycopy(buffer2, 0, buffer1, blockSizeTimes128 + (i * 64), 64);
          buffer1.set(buffer2, blockSizeTimes128 + (i * 64));
        }

        for (var i = 0; i < blockSize; i++) {
          // arraycopy(buffer1, blockSizeTimes128 + (i * 2) * 64, buffer1, (i * 64), 64);
          var offset = blockSizeTimes128 + (i * 2) * 64;
          buffer1.set(buffer1.subarray(offset, offset + 64), i * 64);
        }

        for (var i = 0; i < blockSize; i++) {
          //arraycopy(buffer1, blockSizeTimes128 + (i * 2 + 1) * 64, buffer1, (i + blockSize) * 64, 64);
          var offset = blockSizeTimes128 + (i * 2 + 1) * 64;
          buffer1.set(buffer1.subarray(offset, offset + 64), (i + blockSize) * 64);
        }
      }

      /* ====================================================================== */

      /* Start our ROMix cycle */
      for (var index = 0; index < buffer.byteLength; index += blockSizeTimes128) {

        // arraycopy(buffer, index, buffer1, 0, blockSizeTimes128);
        buffer1.set(buffer.subarray(index, index + blockSizeTimes128));

        for (var i = 0; i < iterations; i++) {
          // arraycopy(buffer1, 0, bufferV, i * (blockSizeTimes128), blockSizeTimes128);
          bufferV.set(buffer1.subarray(0, blockSizeTimes128), i * (blockSizeTimes128));
          scryptBlockMix();
        }

        for (var i = 0; i < iterations; i++) {
          var integerified = buffer1View.getInt32(intIndex, true) & (iterations - 1);
          blockxor(bufferV, integerified * (blockSizeTimes128), buffer1, 0, blockSizeTimes128);
          scryptBlockMix();
        }

        buffer.set(buffer1.subarray(0, blockSizeTimes128), index);
      }
    };

    /* ======================================================================== *
     * KDF function for SCRYPT: validating parameters, then computing the       *
     *                           initial and final PBKDF2                       *
     * ======================================================================== */

    function scrypt(password, salt, options, kdfs, hash) {

      var iterations = options.iterations;
      var blockSize = options.blockSize;
      var parallelization = options.parallelization;

      var blockSizeTimes128 = blockSize * 128;

      /* Validate parameters */
      if (iterations < 2 || (iterations & (iterations - 1)) != 0)
        throw new Error("Iterations (CPU/Memory cost) must be a power of 2 greater than 1");
      if (iterations > 0x0FFFFFF / blockSize)
        throw new Error("Iterations (CPU/Memory cost) is too large for given block size");
      if (blockSize > 0x0FFFFFF / parallelization)
        throw new Error("Block size too large for given parallelization");

      /* Initialize our buffer with a single round of PBKDF2 */
      var buffer = kdfs.kdf("PBKDF2", password, salt, {
        derivedKeyLength: blockSize * 128 * parallelization,
        hash: options.hash || hash,
        iterations: 1,
      });

      /* Run our scryptROMix generator function */
      scryptROMix(buffer, iterations, parallelization, blockSize);

      /* Finalize the result with another PBKDF2 single round */
      return kdfs.kdf("PBKDF2", password, buffer, {
        derivedKeyLength: options.derivedKeyLength,
        hash: options.hash || hash,
        iterations: 1
      });

    };

    /* ======================================================================== */

    function SCrypt(kdfs, hash) {
      if (!kdfs) throw new Error("KDFs instance required");
      Object.defineProperty(this, "kdf", {
        configurable: true,
        enumerable: true,
        value: function(password, salt, options) {
          password = arrays.toUint8Array(password);
          salt = arrays.toUint8Array(salt);
          return scrypt(password, salt, options, kdfs, hash);
        }
      });
      KDF.call(this, "SCRYPT");
    };

    /* SCrypt extends KDF */
    return KDF.$super(SCrypt);

  }
);
