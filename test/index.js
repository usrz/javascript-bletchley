'use strict';

/* WorkerCrypto.newInstance() returns a promise, inject an instance for tests */
Esquire.define('test/workerCrypto', [ 'bletchley/crypto/WorkerCrypto' ], function(WorkerCrypto) {
  return WorkerCrypto.newInstance();
});

/* Run our tests */
esquire([ 'test/BigInteger',
          'test/RSAKey',
          'test/random',
          'test/blocks',
          'test/paddings',
          'test/rsavectors',

          'bletchley/codecs/Codecs',
          'bletchley/hashes/Hashes',
          'bletchley/hmacs/HMACs',
          'bletchley/kdfs/KDFs',
          'bletchley/ciphers/Ciphers',

          'bletchley/crypto/Crypto',
          'test/workerCrypto',
          'test/subtleWrapper',
          'bletchley',

          'test/crypto',
          'test/codecs',
          'test/hashes',
          'test/hmacs',
          'test/kdfs',
          'test/rsacipher',

          'bletchley/random/SecureRandom' ],

  function(testBigInteger, testRSAKey, testRandom, testBlocks, testPaddings, testRSAVectors,
           Codecs, Hashes, HMACs, KDFs, Ciphers,
           Crypto, workerCrypto, subtleWrapper, crypto,
           testCrypto, testCodecs, testHashes, testHMACs, testKDFs, testRSACipher,
           SecureRandom) {

    var random = new SecureRandom();

    /* Log initialization */
    it('init', function(){});

    describe("Basic tests", function() {
      testBigInteger();
      testRandom();
      testBlocks();
      testRSAKey();
      testPaddings();
      testRSAVectors();
    });

    describe("Helpers implementation", function() {
      testCodecs(new Codecs(), false);
      testHashes(new Hashes(), false);
      testHMACs(new HMACs(), false);
      testKDFs(new KDFs(), false);
      testRSACipher(new Ciphers(random), false);
    });

    describe("Synchronous crypto implementation", function() {
      var syncCrypto = new Crypto();
      testCrypto(syncCrypto, false);
      testCodecs(syncCrypto, false);
      testHashes(syncCrypto, false);
      testHMACs(syncCrypto, false);
      testKDFs(syncCrypto, false);
      testRSACipher(syncCrypto, false);
    });

    describe("Worker crypto implementation", function() {
      testCrypto(workerCrypto, true);
      testCodecs(workerCrypto, true);
      testHashes(workerCrypto, true);
      testHMACs(workerCrypto, true);
      testKDFs(workerCrypto, true);
    });

    /* Wrapper around a mock, don't test what we don't have to */
    if (subtleWrapper) describe("Subtle crypto implementation", function() {
      testHashes(subtleWrapper, true);
      testHMACs(subtleWrapper, true);
    });

    describe("Default crypto implementation", function() {
      testCrypto(crypto, true);
      testCodecs(crypto, true);
      testHashes(crypto, true);
      testHMACs(crypto, true);
      testKDFs(crypto, true);
    });

  }
);
