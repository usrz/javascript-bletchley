'use strict';

esquire(['bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',

         'bletchley/crypto/async',
         'bletchley/crypto/worker',

         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(codecs, hashes, hmacs,
           asyncCrypto, workerCrypto,
           testCodecs, testHashes, testHMACs) {

    describe("Helpers implementation", function() {
      testCodecs(codecs, false);
      // testHashes(hashes);
      // testHMACs(hmacs);
    });

    describe("Local asynchronous crypto implementation", function() {
      testCodecs(asyncCrypto, true);
      // testHashes(crypto);
      // testHMACs(crypto);
    });

    describe("Worker crypto implementation", function() {
      testCodecs(workerCrypto, true);
      // testHashes(crypto);
      // testHMACs(crypto);
    });
  }
);
