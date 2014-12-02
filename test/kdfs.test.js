'use strict';

Esquire.define('test/kdfs', ['test/async', 'bletchley/codecs'], function(async, codecs) {

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    var encode = codecs.encode;
    var decode = codecs.decode;

    describe("Key Derivation Functions", function() {

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
          var options = {hash: "SHA1", iterations: 4096 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("4b007901b765489abead49d926f721d065a429c1");
          }).done();

        });

        promises("should validate RFC-6070 test vector 4", function() {
          var options = {hash: "SHA1", iterations: 4096, derivedKeyLength: 25 };

          return maybeAsync(crypto.kdf("PBKDF2", "passwordPASSWORDpassword", "saltSALTsaltSALTsaltSALTsaltSALTsalt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("3d2eec4fe41c849b80c8d83662c0e44a8b291a964cf2f07038");
          }).done();

        });

        promises("should validate RFC-6070 test vector 5", function() {
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

        /* From http://packages.python.org/passlib/lib/passlib.hash.grub_pbkdf2_sha512.html */

        promises.skip("should validate a simple SHA-512 example", function() {
          this.timeout(10000);
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
          var options = {hash: "SHA-256", iterations: 4096 };

          return maybeAsync(crypto.kdf("PBKDF2", "password", "salt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a");
          }).done();

        });

        promises("should validate RFC-6070 test vector 4 with SHA-256", function() {
          var options = {hash: "SHA-256", iterations: 4096, derivedKeyLength: 40 };

          return maybeAsync(crypto.kdf("PBKDF2", "passwordPASSWORDpassword", "saltSALTsaltSALTsaltSALTsaltSALTsalt", options))
          .then(function(result) {
            expect(result).to.be.instanceof(Uint8Array);
            return encode('HEX', result);
          }).then(function(result) {
            expect(result).to.equal("348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1c635518c7dac47e9");
          }).done();

        });

        promises("should validate RFC-6070 test vector 5 with SHA-256", function() {
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
