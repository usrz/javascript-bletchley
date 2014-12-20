'use strict';

Esquire.define('bletchley/kdfs/PBKDF2', [ 'bletchley/kdfs/KDF',
                                          'bletchley/utils/arrays' ],

  function(KDF, arrays) {

    function pbkdf2(password, salt, options, hmacs, hmac) {

      /* We *NEED* the number of iterations */
      var iterations = options.iterations;
      if (iterations < 1) throw new Error("Option 'iterations' must be >= 1");

      /* We *NEED* a valid HMAC */
      if (options.hash) hmac = hmacs.$helper(options.hash);
      if (!hmac) throw new Error("Option 'hash' unspecified");

      /* Digest size and derived key length */
      var derivedKeyLength = options.derivedKeyLength || hmac.digestSize;
      var digestSize = hmac.digestSize;

      /* Calculate rounds, number of bytes for last copy */
      var rounds = Math.ceil(derivedKeyLength / digestSize);
      var remainder = derivedKeyLength - (rounds - 1) * digestSize;

      /* Allocate space for our output */
      var output = new Uint8Array(rounds * digestSize);

      /* At every iteration, we do an HMAC of concat(salt + round) */
      var roundedSalt = new Uint8Array(salt.byteLength + 4);
      var roundedSaltData = new DataView(roundedSalt.buffer, salt.byteLength);
      roundedSalt.set(salt);

      /* The "update" buffer can be reused over and over */
      var update = new Uint8Array(hmac.digestSize);

      /* Run our rounds synchronously */
      for (var round = 1, offset = 0; round <= rounds; round ++, offset += digestSize) {

        /* Set our round calculating the base HMAC */
        roundedSaltData.setUint32(0, round, false);
        hmac.hmac(password, roundedSalt, update);

        /* Slap in the current update */
        output.set(update, offset);

        /* Iterations: update and XOR it in */
        for (var i = 1; i < iterations; i++) {
          hmac.hmac(password, update, update);
          for (var j = 0, k = offset; j < update.length; j ++, k ++) {
            output[k] ^= update[j];
          }
        }
      }

      /* Truncate the output if needed */
      if (output.length == derivedKeyLength) return output;
      return new Uint8Array(output.buffer, 0, derivedKeyLength);

    };

    function PBKDF2(hmacs, hmac) {
      if (!hmacs) throw new Error("HMACs instance required");
      Object.defineProperty(this, "kdf", {
        configurable: true,
        enumerable: true,
        value: function(password, salt, options) {
          password = arrays.toUint8Array(password);
          salt = arrays.toUint8Array(salt);
          return pbkdf2(password, salt, options, hmacs, hmac);
        }
      });
      KDF.call(this, "PBKDF2");
    };

    /* PBKDF2 extends KDF */
    return KDF.$super(PBKDF2);

  }
);

/* ========================================================================== */

/*
 * Asynchronous implementation: whille actually working, this is much slower
 * than our normal code. It seems that method invocation through promises is
 * much slower (3x) than the actual MAC computation. Keeping it for reference...
 */

// /* Asynchronous HMAC? (this is from subtle) */
// if (asyncHMAC) {

//   /* Our promise-returning HMAC */
//   hmac = function(s, p) { return asyncHMAC(options.hash, s, p) };

//   /* Round and iterations count */
//   var round = 1;
//   var iteration = 0;
//   var offset = 0;

//   /* What to do every time we get an update */
//   var async = function(update) {

//     /* Are we done with our rounds? Truncate if necessary */
//     if (round > rounds) {
//       if (output.length == derivedKeyLength) return output;
//       return new Uint8Array(output.buffer, 0, derivedKeyLength);
//     }

//     /* Current round is not over yet */
//     if (iteration < iterations) {
//       if (iteration == 0) {
//         output.set(update, offset);
//       } else {
//         for (var j = 0, k = offset; j < update.length; j ++, k ++) {
//           output[k] ^= update[j];
//         }
//       }

//       /* Next iteration! */
//       iteration ++;
//       return hmac(password, update).then(async);

//     }

//     /* Next round... */
//     round ++;
//     iteration = 0;
//     offset += digestSize;

//     roundedSaltData.setUint32(0, round, false);
//     return hmac(password, roundedSalt).then(async);
//   };

//   /* Let's start... */
//   roundedSaltData.setUint32(0, round, false);
//   return hmac(password, roundedSalt).then(async);

// }

