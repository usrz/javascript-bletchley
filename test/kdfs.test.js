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

        // it("should validate RFC-6070 test vector 6", function() {
        //   var options = {hash: "SHA-256", iterations: 6400 };

        //   /* From http://packages.python.org/passlib/lib/passlib.hash.pbkdf2_digest.html */
        //   var salt = new Uint8Array([0xd1, 0x9a, 0xf3, 0x5e, 0x2b, 0x45, 0x48, 0x69, 0x6d, 0x4d, 0x09, 0xc1, 0x58, 0xeb, 0x1d, 0x03]);
        //   var key = crypto.kdf("PBKDF2", "password", salt, options);
        //   var hex = codecs.encode("HEX", key);
        //   expect(hex).to.be.equal("635d40721a95e1bd2c522b1d65dd17afdeca5a8ca6344d0b34dae71206381fd3");
        // });

      })
    });
  }
});
