/* Run tests in the browser */

esquire(['bletchley/codecs',
         'bletchley/hashes',
         'bletchley/hmacs',
         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(codecs, hashes, hmacs, testCodecs, testHashes, testHMACs) {
    describe("Helpers implementation", function() {
      testCodecs(codecs);
      testHashes(hashes);
      testHMACs(hmacs);
    });
  }
);

esquire(['bletchley/crypto/sync',
         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(crypto, testCodecs, testHashes, testHMACs) {
    describe("Synchronous crypto implementation", function() {
      testCodecs(crypto);
      testHashes(crypto);
      testHMACs(crypto);
    });
  }
);

esquire(['bletchley/crypto/async',
         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(crypto, testCodecs, testHashes, testHMACs) {
    describe("Local asynchronous crypto implementation", function() {
      testCodecs(crypto);
      testHashes(crypto);
      testHMACs(crypto);
    });
  }
);

esquire(['bletchley/crypto/worker',
         'test/codecs',
         'test/hashes',
         'test/hmacs'],
  function(crypto, testCodecs, testHashes, testHMACs) {
    describe("Worker-based asynchronous crypto implementation", function() {
      testCodecs(crypto);
      testHashes(crypto);
      testHMACs(crypto);
    });
  }
);
