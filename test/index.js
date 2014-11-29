'use strict';

esquire(['bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',

         'bletchley/crypto/sync',
         'bletchley/crypto/async',
         'bletchley/crypto/worker',

         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(codecs, hashes, hmacs,
           syncCrypto, asyncCrypto, workerCrypto,
           testCodecs, testHashes, testHMACs) {

    describe("Helpers implementation", function() {
      // testCodecs(codecs, false);
      testHashes(hashes);
      // testHMACs(hmacs);
    });

    describe("Synchronous crypto implementation", function() {
      // testCodecs(syncCrypto, false);
      testHashes(hashes);
      // testHMACs(hmacs);
    });

    describe("Asynchronous crypto implementation", function() {
      // testCodecs(asyncCrypto, true);
      testHashes(asyncCrypto, true);
      // testHMACs(asyncCrypto);
    });

    describe("Worker crypto implementation", function() {
      // testCodecs(workerCrypto, true);
      testHashes(workerCrypto, true);
      // testHMACs(workerCrypto, true);
    });
  }
);
