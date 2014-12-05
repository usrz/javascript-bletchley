'use strict';

esquire(['bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',
         'bletchley/kdfs',

         'bletchley/sync',
         'bletchley/worker',
         'test/subtleWrapper',
         'bletchley',

         'test/random',
         'test/codecs',
         'test/hashes',
         'test/hmacs',
         'test/kdfs'],

  function(codecs, hashes, hmacs, kdfs,
           syncCrypto, workerCrypto, subtleCrypto, crypto,
           testRandom, testCodecs, testHashes, testHMACs, testKDFs) {

    describe("Helpers implementation", function() {
      testCodecs(codecs, false);
      testHashes(hashes, false);
      testHMACs(hmacs, false);
      testKDFs(kdfs, false);
    });

    describe("Synchronous crypto implementation", function() {
      testRandom(syncCrypto, false)
      testCodecs(syncCrypto, false);
      testHashes(syncCrypto, false);
      testHMACs(syncCrypto, false);
      testKDFs(syncCrypto, false);
    });

    describe("Worker crypto implementation", function() {
      testRandom(workerCrypto, true);
      testCodecs(workerCrypto, true);
      testHashes(workerCrypto, true);
      testHMACs(workerCrypto, true);
      testKDFs(workerCrypto, true);
    });

    /* Wrapper around a mock, don't test what we don't have to */
    if (subtleCrypto) describe("Subtle crypto implementation", function() {
      testHashes(subtleCrypto, true);
      testHMACs(subtleCrypto, true);
    });

    describe("Default crypto implementation", function() {
      testRandom(crypto, true);
      testCodecs(crypto, true);
      testHashes(crypto, true);
      testHMACs(crypto, true);
      testKDFs(crypto, true);
    });

  }
);
