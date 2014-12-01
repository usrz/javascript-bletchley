'use strict';

Esquire.define('bletchley/kdfs/pbkdf2', ['bletchley/kdfs/KDF', 'bletchley/hmacs', 'bletchley/utils/arrays' ], function(KDF, hmacs, arrays) {

  return new KDF("PBKDF2", function(password, salt, options, asyncHMAC) {

    /* Normalize our arguments */
    password = arrays.toUint8Array(password);
    salt = arrays.toUint8Array(salt);

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
    var roundedSalt = arrays.concatUint8Arrays(salt, new Uint8Array(4));
    var roundedSaltData = new DataView(roundedSalt.buffer, salt.byteLength);

    /* Run our rounds */
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
