'use strict';

esquire(['bletchley/utils/random',
         'bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',

         'bletchley/crypto/sync',
         'bletchley/crypto/async',
         'bletchley/crypto/worker',

         'bletchley/crypto/Crypto',
         'bletchley/crypto/SubtleCrypto',
         '$global/crypto.subtle',
         '$global/navigator',
         '$global/process',

         'test/random',
         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(random, codecs, hashes, hmacs,
           syncCrypto, asyncCrypto, workerCrypto,
           Crypto, SubtleCrypto, subtle, navigator, process,
           testRandom, testCodecs, testHashes, testHMACs) {

    describe("Helpers implementation", function() {
      testRandom(random, false)
      testCodecs(codecs, false);
      testHashes(hashes, false);
      testHMACs(hmacs, false);
    });

    describe("Synchronous crypto implementation", function() {
      testRandom(syncCrypto, false)
      testCodecs(syncCrypto, false);
      testHashes(hashes, false);
      testHMACs(hmacs, false);
    });

    describe("Asynchronous crypto implementation", function() {
      testRandom(asyncCrypto, true);
      testCodecs(asyncCrypto, true);
      testHashes(asyncCrypto, true);
      testHMACs(asyncCrypto, true);
    });

    describe("Worker crypto implementation", function() {
      testRandom(workerCrypto, true);
      testCodecs(workerCrypto, true);
      testHashes(workerCrypto, true);
      testHMACs(workerCrypto, true);
    });

  }
);
