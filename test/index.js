'use strict';

esquire(['bletchley/utils/random',
         'bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',
         'bletchley/kdfs',

         'bletchley/crypto/sync',
         'bletchley/crypto/async',
         'bletchley/crypto/worker',

         'test/random',
         'test/codecs',
         'test/hashes',
         'test/hmacs',
         'test/kdfs' ],
  function(random, codecs, hashes, hmacs, kdfs,
           syncCrypto, asyncCrypto, workerCrypto,
           testRandom, testCodecs, testHashes, testHMACs, testKDFs) {

    describe("Helpers implementation", function() {
      testRandom(random, false)
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

    describe("Asynchronous crypto implementation", function() {
      testRandom(asyncCrypto, true);
      testCodecs(asyncCrypto, true);
      testHashes(asyncCrypto, true);
      testHMACs(asyncCrypto, true);
      testKDFs(asyncCrypto, true);
    });

    describe("Worker crypto implementation", function() {
      testRandom(workerCrypto, true);
      testCodecs(workerCrypto, true);
      testHashes(workerCrypto, true);
      testHMACs(workerCrypto, true);
      testKDFs(workerCrypto, true);
    });

  }
);
