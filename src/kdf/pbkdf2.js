'use strict';

Esquire.define('bletchley/kdfs/pbkdf2', ['bletchley/kdfs/KDF', 'bletchley/hmacs'], function(KDF, hmacs) {

  return new KDF("PBKDF2", function(password, salt, options) {

    /* We *NEED* the number of iterations */
    var iterations = options.iterations;
    if (iterations < 1) throw new Error("Option 'iterations' must be >= 1");

    /* We *NEED* a valid HMAC */
    if (! options.hash) throw new Error("Option 'hash' unspecified");
    var hmac = hmacs.$helper(options.hash);

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

    /* Run our rounds synchronously */
    for (var round = 1, offset = 0; round <= rounds; round ++, offset += digestSize) {

      /* Set our round calculating the base HMAC */
      roundedSaltData.setUint32(0, round, false);
      var update = hmac.hmac(password, roundedSalt);

      /* Slap in the current update */
      output.set(update, offset);

      /* Iterations: update and XOR it in */
      for (var i = 1; i < iterations; i++) {
        update = hmac.hmac(password, update);
        for (var j = 0, k = offset; j < update.length; j ++, k ++) {
          output[k] ^= update[j];
        }
      }
    }

    /* Truncate the output if needed */
    if (output.length == derivedKeyLength) return output;
    return new Uint8Array(output.buffer, 0, derivedKeyLength);

  });
});

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

