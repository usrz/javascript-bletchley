'use strict';

Esquire.define('test/hashes', ['test/async', 'test/binary', 'bletchley/codecs'], function(async, binary, codecs) {

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    describe("Hashes", function() {

      /* Functions must be bound */
      var hash   = crypto.hash;

      /* Need encode and decode when testing the hash helper */
      var encode = codecs.encode;
      var decode = codecs.encode;

      it("should exist", function() {
        console.log("CRYPTO IS", crypto);

        expect(crypto).to.exist;
        expect(crypto).to.be.a('object');
        expect(crypto.hash).to.be.a('function');
      });

      /* ====================================================================== */

      var knownString = 'The quick brown fox jumps over the lazy dog';
      var tests = {
        'SHA1': {
          'empty': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
          'known': '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12',
          'large': 'e73b326d07a80caf4b111a70d620485cafd25fa1'
        }, 'SHA-224': {
          'empty': 'd14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f',
          'known': '730e109bd7a8a32b1cb9d9a09aa2325d2430587ddbc0c38bad911525',
          'large': '34ec93d85f705da86f8f9b1d3c866be17ab64a0a08e5ae721872a70e'
        }, 'SHA-256': {
          'empty': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          'known': 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
          'large': '7d26528f61705cdda3ec99636db5caaf55013ce199c6d23c92da5112375bfc6d'
        }, 'SHA-384': {
          'empty': '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
          'known': 'ca737f1014a48f4c0b6dd43cb177b0afd9e5169367544c494011e3317dbf9a509cb1e5dc1e85a941bbee3d7f2afbc9b1',
          'large': '626c445d51e31edae915a6167f49214f372433af0da1cee062c33cccad637a86fd09849216b7b833886b9cdcf4b06f38'
        }, 'SHA-512': {
          'empty': 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
          'known': '07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6',
          'large': 'abd1271df074b762f4425b33ba950ceefe6b35b6e49b361a6bec7a974bc037a2be43030c23e46d241938e7fcbec65dd6b4a33a6cc1ffb86fde74716f28852fdc'
        }
      }

      for (var algorithm in tests) {
        var results = tests[algorithm];

        (function(algorithm, results) {
          describe(algorithm + " hashing", function() {

            promises("should hash empty data", function() {
              return maybeAsync(hash(algorithm, ''))
                .then(function(result) {
                  expect(result).to.be.instanceof(ArrayBuffer);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.empty);
                }).done();
            });

            promises("should hash a well-known string", function() {
              return maybeAsync(hash(algorithm, knownString))
                .then(function(result) {
                  expect(result).to.be.instanceof(ArrayBuffer);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.known);
                }).done();
            });

            promises("should hash 10k of binary data", function() {
              return maybeAsync(hash(algorithm, binary.uint8Array))
                .then(function(result) {
                  expect(result).to.be.instanceof(ArrayBuffer);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.large);
                }).done();
            });

          });
        })(algorithm, results);
      }
    });
  }
});
