'use strict';

esquire(['bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',

         'bletchley/crypto/async',

         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(codecs, hashes, hmacs,
           asyncCrypto,
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
  }
);
