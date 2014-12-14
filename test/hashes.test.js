'use strict';

Esquire.define('test/hashes', ['test/async', 'test/binary', 'bletchley/codecs', 'bletchley/hashes/Hashes'], function(async, binary, codecs, Hashes) {

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    describe("Hashes", function() {

      /* Functions must be bound */
      var hashes = new Hashes();
      var hash   = crypto.hash;

      /* Need encode and decode when testing the hash helper */
      var encode = codecs.encode;

      it("should exist", function() {
        expect(crypto).to.exist;
        expect(crypto).to.be.a('object');
        expect(crypto.hash).to.be.a('function');
      });

      /* ====================================================================== */

      /* Seee http://www.di-mgt.com.au/sha_testvectors.html */

      var tests = {
        'SHA1': {
          'f_000': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
          'f_024': 'a9993e364706816aba3e25717850c26c9cd0d89d',
          'f_448': '84983e441c3bd26ebaae4aa1f95129e5e54670f1',
          'f_896': 'a49b2446a02c645bf419f995b67091253a04a259',
          'blk_1': 'cb4dd3daca2d6f2544bc0daa6bebb78aed0bd034',
          'blk_2': 'ffb5e5d96e19714ffef60ac8749ecaefbec9d295',
          'known': '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12',
          'large': 'e73b326d07a80caf4b111a70d620485cafd25fa1'
        },
        'SHA-224': {
          'f_000': 'd14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f',
          'f_024': '23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7',
          'f_448': '75388b16512776cc5dba5da1fd890150b0c6455cb4f58b1952522525',
          'f_896': 'c97ca9a559850ce97a04a96def6d99a9e0e0e2ab14e6b8df265fc0b3',
          'blk_1': '22ac763681307d11a345711cab5e74ea511fae040de807f5039b1ad3',
          'blk_2': 'eebdef16c33123dfedd8db01a6d821e9d5a785aa812973062bdceb02',
          'known': '730e109bd7a8a32b1cb9d9a09aa2325d2430587ddbc0c38bad911525',
          'large': '34ec93d85f705da86f8f9b1d3c866be17ab64a0a08e5ae721872a70e'
        },
        'SHA-256': {
          'f_000': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          'f_024': 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
          'f_448': '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
          'f_896': 'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1',
          'blk_1': 'ce4153b0147c2a863ed4298ee0676bc879fc77a12abe1f49b2b055df1069523e',
          'blk_2': 'c49613f3a24dd8719ecec47eaeb8649cf713ac8145af38a8c297620cc28eb358',
          'known': 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
          'large': '7d26528f61705cdda3ec99636db5caaf55013ce199c6d23c92da5112375bfc6d',
        },
        'SHA-384': {
          'f_000': '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
          'f_024': 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
          'f_448': '3391fdddfc8dc7393707a65b1b4709397cf8b1d162af05abfe8f450de5f36bc6b0455a8520bc4e6f5fe95b1fe3c8452b',
          'f_896': '09330c33f71147e83d192fc782cd1b4753111b173b3b05d22fa08086e3b0f712fcc7c71a557e2db966c3e9fa91746039',
          'blk_1': '15acc11642c16f5403240897d19df4eb09a9a2b82cdeb5feb6882074378b53630b9fb6491a33f97ae84cfe5fe2375e84',
          'blk_2': 'df0069e5199fe3db9a184578c36c9a0cb5e37b36a6d95842db77cf589c9d1caf89e5b1daf936bc54b396628c3164033c',
          'known': 'ca737f1014a48f4c0b6dd43cb177b0afd9e5169367544c494011e3317dbf9a509cb1e5dc1e85a941bbee3d7f2afbc9b1',
          'large': '626c445d51e31edae915a6167f49214f372433af0da1cee062c33cccad637a86fd09849216b7b833886b9cdcf4b06f38'
        },
        'SHA-512': {
          'f_000': 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
          'f_024': 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
          'f_448': '204a8fc6dda82f0a0ced7beb8e08a41657c16ef468b228a8279be331a703c33596fd15c13b1b07f9aa1d3bea57789ca031ad85c7a71dd70354ec631238ca3445',
          'f_896': '8e959b75dae313da8cf4f72814fc143f8f7779c6eb9f7fa17299aeadb6889018501d289e4900f7e4331b99dec4b5433ac7d329eeb6dd26545e96e55b874be909',
          'blk_1': '4d347b09567442bccf23adcf32e115c9f4be79be349966f0344a7791388a84a48ecaacdee1e458134a5b1f92f41c747e18f9808df8e5c3d64d0a68de14e705e2',
          'blk_2': '3b4309136b1dd22cfdf509abdb4a31b5df2f343350425196eef13fcdc1d2a9e5d962e9b25c602475cd39d4fc9db82524e6bd4abee5aae2828824895cf966b13d',
          'known': '07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6',
          'large': 'abd1271df074b762f4425b33ba950ceefe6b35b6e49b361a6bec7a974bc037a2be43030c23e46d241938e7fcbec65dd6b4a33a6cc1ffb86fde74716f28852fdc'
        }
      }

      for (var algorithm in tests) {
        var results = tests[algorithm];

        (function(algorithm, results) {
          describe(algorithm + " hashing", function() {

            promises("should hash the FIPS-180 test vector of 0 bits", function() {
              return maybeAsync(hash(algorithm, ''))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.f_000);
                }).done();
            });

            promises("should hash the FIPS-180 test vector of 24 bits", function() {
              return maybeAsync(hash(algorithm, 'abc'))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.f_024);
                }).done();
            });

            promises("should hash the FIPS-180 test vector of 448 bits", function() {
              return maybeAsync(hash(algorithm, "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.f_448);
                }).done();
            });

            promises("should hash the FIPS-180 test vector of 896 bits", function() {
              return maybeAsync(hash(algorithm, "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu"))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.f_896);
                }).done();
            });

            var blockSize = hashes.$helper(algorithm).blockSize;
            promises("should hash precisely " + blockSize + " bytes", function() {

              return maybeAsync(hash(algorithm, new Array(blockSize + 1).join(' ')))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.blk_1);
                }).done();
            });

            promises("should hash precisely " + (blockSize * 2) + " bytes", function() {

              return maybeAsync(hash(algorithm, new Array((blockSize * 2) + 1).join(' ')))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.blk_2);
                }).done();
            });

            promises("should hash a well-known string", function() {
              return maybeAsync(hash(algorithm, 'The quick brown fox jumps over the lazy dog'))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
                  return encode('HEX', result);
                }).then(function(result) {
                  expect(result).to.equal(results.known);
                }).done();
            });

            promises("should hash 10k of binary data", function() {
              return maybeAsync(hash(algorithm, binary.uint8Array))
                .then(function(result) {
                  expect(result).to.be.instanceof(Uint8Array);
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
