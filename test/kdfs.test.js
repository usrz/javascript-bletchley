'use strict';

Esquire.define('test/kdfs', ['test/async', 'bletchley/codecs/Codecs'], function(async, Codecs) {

  var codecs = new Codecs();

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    var encode = codecs.encode;
    var decode = codecs.decode;

    describe("Key Derivation Functions", function() {

      describe("Scrypt", function() {

        /* Test vectors: http://tools.ietf.org/html/draft-josefsson-scrypt-kdf-01 */

        promises("should work with test vector 1", function() {
          var options = { hash: "SHA-256",
                          iterations: 16,
                          blockSize: 1,
                          parallelization: 1,
                          derivedKeyLength: 64 };

          return maybeAsync(crypto.kdf("SCRYPT", "", "", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("77d6576238657b203b19ca42c18a0497f16b4844e3074ae8dfdffa3fede21442fcd0069ded0948f8326a753a0fc81f17e8d3e0fb2e0d3628cf35e20c38d18906");
          }).done();

        });

        promises("should work with test vector 2", function() {
          this.timeout(10000); // timeout for Node, Phantom & MSIE
          var options = { hash: "SHA-256",
                          iterations: 1024,
                          blockSize: 8,
                          parallelization: 16,
                          derivedKeyLength: 64 };

          return maybeAsync(crypto.kdf("SCRYPT", "password", "NaCl", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("fdbabe1c9d3472007856e7190d01e9fe7c6ad7cbc8237830e77376634b3731622eaf30d92e22a3886ff109279d9830dac727afb94a83ee6d8360cbdfa2cc0640");
          }).done();

        });

        promises("should work with test vector 3", function() {
          this.timeout(10000); // timeout for Node, Phantom & MSIE
          var options = { hash: "SHA-256",
                          iterations: 16384,
                          blockSize: 8,
                          parallelization: 1,
                          derivedKeyLength: 64 };

          return maybeAsync(crypto.kdf("SCRYPT", "pleaseletmein", "SodiumChloride", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("7023bdcb3afd7348461c06cd81fd38ebfda8fbba904f8e3ea9b543f6545da1f2d5432955613f0fcf62d49705242a9af9e61e85dc0d651e40dfcf017b45575887");
          }).done();

        });

        promises.skip("should work with test vector 4", function() {
          this.timeout(60000); // takes roughly 30 seconds on chrome
          var options = { hash: "SHA-256",
                          iterations: 1048576,
                          blockSize: 8,
                          parallelization: 1,
                          derivedKeyLength: 64 };

          return maybeAsync(crypto.kdf("SCRYPT", "pleaseletmein", "SodiumChloride", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("2101cb9b6a511aaeaddbbe09cf70f881ec568d574a2ffd4dabe5ee9820adaa478e56fd8f4ba5d09ffa1c6d927c40f4c337304049e8a952fbcbf45c6fa77a41a4");
          }).done();

        });

      });

      /* ==================================================================== */

      describe("PBKDF2", function() {

        promises("should validate RFC-6070 test vector 1", function() {
          var options = {hash: "SHA1", iterations: 1 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("0c60c80f961f0e71f3a9b524af6012062fe037a6");
          }).done();

        });

        promises("should validate RFC-6070 test vector 2", function() {
          var options = {hash: "SHA1", iterations: 2 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957");
          }).done();

        });

        promises("should validate RFC-6070 test vector 3", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA1", iterations: 4096 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("4b007901b765489abead49d926f721d065a429c1");
          }).done();

        });

        /* This times out for more or less forever :-) */
        promises.skip("should validate RFC-6070 test vector 4", function() {
          var options = {hash: "SHA1", iterations: 16777216 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("eefe3d61cd4da4e4e9945b3d6ba2158c2634e984");
          }).done();

        });

        promises("should validate RFC-6070 test vector 5", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA1", iterations: 4096, derivedKeyLength: 25 };

          return maybeAsync(crypto.kdf("PBKDF2", "passwordPASSWORDpassword", "saltSALTsaltSALTsaltSALTsaltSALTsalt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("3d2eec4fe41c849b80c8d83662c0e44a8b291a964cf2f07038");
          }).done();

        });

        promises("should validate RFC-6070 test vector 6", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA1", iterations: 4096, derivedKeyLength: 16 };

          return maybeAsync(crypto.kdf("PBKDF2", "pass\0word", "sa\0lt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("56fa6aa75548099dcc37d7f03425e0c3");
          }).done();

        });

        /* ================================================================== */

        /* From http://packages.python.org/passlib/lib/passlib.hash.pbkdf2_digest.html */

        promises("should validate a simple SHA-265 example 1", function() {
          var options = {hash: "SHA-256", iterations: 6400 };

          var salt = decode("BASE-64", "0ZrzXitFSGltTQnBWOsdAw");

          return maybeAsync(crypto.kdf("PBKDF2", "password", salt, options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('BASE-64', result);
          }).then(function(result) {
            expect(result).to.be.equal("Y11AchqV4b0sUisdZd0Xr97KWoymNE0LNNrnEgY4H9M=");
          }).done();

        });

        promises("should validate a simple SHA-265 example 2", function() {
          var options = {hash: "SHA-256", iterations: 8000 };

          var salt = decode("BASE-64", "XAuBMIYQQogxRg");

          return maybeAsync(crypto.kdf("PBKDF2", "password", salt, options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('BASE-64', result);
          }).then(function(result) {
            expect(result).to.be.equal("tRRlz8hYn63B9LYiCd6PRo6FMiunY9ozmMMI3srxeRE=");
          }).done();

        });

        promises("should validate a simple SHA-265 example 3", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA-256", iterations: 6400 };

          var salt = decode("BASE-64", "+6UI/S+nXIk8jcbdHx3Fhg");

          return maybeAsync(crypto.kdf("PBKDF2", "password", salt, options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('BASE-64', result);
          }).then(function(result) {
            expect(result).to.be.equal("98jZicV16ODfEsEZeYPGHU3kbrUrvUEXOPimVSQDD44=");
          }).done();

        });

        /* ================================================================== */

        /* From http://packages.python.org/passlib/lib/passlib.hash.grub_pbkdf2_sha512.html */

        promises("should validate a simple SHA-512 example", function() {
          this.timeout(10000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA-512", iterations: 10000 };

          var salt = decode("HEX", "4483972ad2c52e1f590b3e2260795fda9ca0b07b96ff492814ca9775f08c4b59cd1707f10b269e09b61b1e2d11729bca8d62b7827b25b093ec58c4c1eac23137");

          return maybeAsync(crypto.kdf("PBKDF2", "password", salt, options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.be.equal("df4fcb5dd91340d6d31e33423e4210ad47c7a4df9fa16f401663bf288c20bf973530866178fe6d134256e4dbefbd984b652332eed3acaed834fea7b73cae851d");
          }).done();

        });

        /* ================================================================== */

        /* From https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/pbkdf2-draft-josefsson-sha256.test-vectors */

        promises("should validate RFC-6070 test vector 1 with SHA-256", function() {
          var options = {hash: "SHA-256", iterations: 1 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b");
          }).done();

        });

        promises("should validate RFC-6070 test vector 2 with SHA-256", function() {
          var options = {hash: "SHA-256", iterations: 2 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43");
          }).done();

        });

        promises("should validate RFC-6070 test vector 3 with SHA-256", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA-256", iterations: 4096 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a");
          }).done();

        });

        /* This times out for more or less forever :-) */
        promises.skip("should validate RFC-6070 test vector 4 with SHA-256", function() {
          var options = {hash: "SHA-256", iterations: 16777216 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("cf81c66fe8cfc04d1f31ecb65dab4089f7f179e89b3b0bcb17ad10e3ac6eba46");
          }).done();

        });
        promises("should validate RFC-6070 test vector 5 with SHA-256", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA-256", iterations: 4096, derivedKeyLength: 40 };

          return maybeAsync(crypto.kdf("PBKDF2", "passwordPASSWORDpassword", "saltSALTsaltSALTsaltSALTsaltSALTsalt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1c635518c7dac47e9");
          }).done();

        });

        promises("should validate RFC-6070 test vector 6 with SHA-256", function() {
          this.timeout(5000); // timeout for Node, Phantom & MSIE
          var options = {hash: "SHA-256", iterations: 4096, derivedKeyLength: 16 };

          return maybeAsync(crypto.kdf("PBKDF2", "pass\0word", "sa\0lt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("89b69d0516f829893c696226650a8687");
          }).done();

        });

      })
    });
  }
});
