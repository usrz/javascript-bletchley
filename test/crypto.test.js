'use strict';

Esquire.define('test/crypto', ['test/async', 'bletchley/codecs/Codecs', 'test/badrandom'], function(async, Codecs, badrandom) {

  var codecs = new Codecs();

  /* String for 'Tokyo' in Japanese */
  var tokyoString = "\u6771\u4EAC";
  /* Uint8Array of 'Tokyo' in UTF8 */
  var tokyoUint8Array = new Uint8Array([230, 157, 177, 228, 186, 172]);

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    /* Bound functions */
    var stringify = crypto.stringify;
    var random = crypto.random;

    describe("Crypto", function() {

      it('should validate its members', function() {
        expect(crypto).to.exist;

        expect(crypto.stringify).to.be.a('function');
        expect(crypto.random).to.be.a('function');

        expect(crypto.encode).to.be.a('function');
        expect(crypto.decode).to.be.a('function');

        expect(crypto.encrypt).to.be.a('function');
        expect(crypto.decrypt).to.be.a('function');

        expect(crypto.hash).to.be.a('function');
        expect(crypto.hmac).to.be.a('function');
        expect(crypto.kdf).to.be.a('function');
      });

      promises("should stringify a known array", function() {
        return maybeAsync(stringify(tokyoUint8Array))

        .then(function(encoded) {
          expect(encoded).to.be.a('string');
          expect(encoded).to.equal(tokyoString);
        })

        .done();
      });

      promises("should return some random data", function() {
        return maybeAsync(random(16))

        .then(function(data) {
          expect(data).to.be.instanceof(Uint8Array);
          expect(data).not.to.be.deep.equal(new Uint8Array(16));

          var hex = codecs.encode('HEX', data);
          expect(badrandom.a4bad.indexOf(hex), "Bad Arc4Random initialization").to.be.equal(-1);
          expect(badrandom.srbad.indexOf(hex), "Bad SecureRandom initialization").to.be.equal(-1);
        })

        .done();
      });

    });
  }

});

