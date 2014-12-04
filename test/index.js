'use strict';

esquire(['bletchley/utils/random',
         'bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',
         'bletchley/kdfs',

         'bletchley/sync',
         'bletchley/worker',

         'test/random',
         'test/codecs',
         'test/hashes',
         'test/hmacs',
         'test/kdfs' ],
  function(random, codecs, hashes, hmacs, kdfs,
           syncCrypto, workerCrypto,
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

    describe("Worker crypto implementation", function() {
      testRandom(workerCrypto, true);
      testCodecs(workerCrypto, true);
      testHashes(workerCrypto, true);
      testHMACs(workerCrypto, true);
      testKDFs(workerCrypto, true);
    });

  }
);
