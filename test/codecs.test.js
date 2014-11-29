'use strict';

Esquire.define('test/codecs', ['test/async', 'test/binary'], function(async, binary) {

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    describe("Codecs", function() {

      /* Functions must be bound */
      var encode = crypto.encode;
      var decode = crypto.decode;

      /* String for 'Tokyo' in Japanese */
      var tokyoString = "\u6771\u4EAC";
      /* Plain array of 'Tokyo' in UTF8 */
      var tokyoArray = [230, 157, 177, 228, 186, 172];
      /* Uint8Array of 'Tokyo' in UTF8 */
      var tokyoUint8Array = new Uint8Array(tokyoArray);
      /* Array buffer of 'Tokyo' in UTF8 */
      var tokyoArrayBuffer = tokyoUint8Array.buffer;
      /* HEX string of 'Tokyo' in UTF8 (we encode in lower case) */
      var tokyoHex = 'e69db1e4baac';
      /* Base 64 string of 'Tokyo' in UTF8 */
      var tokyoB64 = '5p2x5Lqs';

      /* ====================================================================== */
      /* BASIC TESTS                                                            */
      /* ====================================================================== */

      it("should exist", function() {
        expect(crypto).to.exist;
        expect(crypto).to.be.a('object');
        expect(crypto.encode).to.be.a('function');
        expect(crypto.decode).to.be.a('function');
      });

      promises("should fail encoding with unknown algorithm", function() {
        return maybeAsync(function() {
          return encode('FOO', '');
        })

        .then(function(encoded) {
          throw new Error("Should fail");
        }, function(failure) {
          expect(failure).to.be.instanceof(Error);
          expect(failure.message).to.match(/'FOO' not in /);
        })

        .done();
      });

      promises("should fail decoding with unknown algorithm", function() {
        return maybeAsync(function() {
          return decode('FOO', '');
        })

        .then(function(encoded) {
            throw new Error("Should fail");
          }, function(failure) {
            expect(failure).to.be.instanceof(Error);
            expect(failure.message).to.match(/'FOO' not in /);
          })

        .done();
      });

      /* ====================================================================== */
      /* HEX TESTS                                                              */
      /* ====================================================================== */

      promises("should encode string in HEX", function() {
        return maybeAsync(encode('HEX', tokyoString))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoHex);
          }).done();
      });

      promises("should encode array in HEX", function() {
        return maybeAsync(encode('HEX', tokyoArray))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoHex);
          }).done();
      });

      promises("should encode array buffer in HEX", function() {
        return maybeAsync(encode('HEX', tokyoArrayBuffer))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoHex);
          }).done();
      });

      promises("should encode typed array in HEX", function() {
        return maybeAsync(encode('HEX', tokyoUint8Array))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoHex);
          }).done();
      });

      promises("should encode empty string in HEX", function() {
        return maybeAsync(encode('HEX', ''))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal('');
          }).done();
      });

      promises("should encode empty array in HEX", function() {
        return maybeAsync(encode('HEX', []))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal('');
          }).done();
      });


      /* ====================================================================== */

      promises("should decode from HEX", function() {
        return maybeAsync(decode('HEX', tokyoHex))
          .then(function(decoded) {
            expect(decoded).to.be.instanceof(ArrayBuffer);
            expect(decoded).to.deep.equal(tokyoArrayBuffer);
          }).done();
      });

      /* ====================================================================== */

      promises("should encode a large binary in HEX", function() {
        return maybeAsync(encode('HEX', binary.uint8Array))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(binary.hex);
          }).done();
      });

      promises("should decode a large binary from HEX", function() {
        return maybeAsync(decode('HEX', binary.hex))
          .then(function(decoded) {
            expect(decoded).to.be.instanceof(ArrayBuffer);
            expect(decoded).to.deep.equal(binary.uint8Array.buffer);
          }).done();
      });

      /* ====================================================================== */
      /* BASE_64 TESTS                                                          */
      /* ====================================================================== */

      promises("should encode string in BASE64", function() {
        return maybeAsync(encode('BASE-64', tokyoString))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoB64);
          }).done();
      });

      promises("should encode array in BASE64", function() {
        return maybeAsync(encode('BASE-64', tokyoArray))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoB64);
          }).done();
      });

      promises("should encode array buffer in BASE64", function() {
        return maybeAsync(encode('BASE-64', tokyoArrayBuffer))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoB64);
          }).done();
      });

      promises("should encode typed arrray in BASE64", function() {
        return maybeAsync(encode('BASE-64', tokyoUint8Array))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(tokyoB64);
          }).done();
      });

      promises("should encode empty string in BASE64", function() {
        return maybeAsync(encode('BASE-64', ''))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal('');
          }).done();
      });

      promises("should encode empty array in BASE64", function() {
        return maybeAsync(encode('BASE-64', []))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal('');
          }).done();
      });

      /* ====================================================================== */

      promises("should decode from BASE64", function() {
        return maybeAsync(decode('BASE-64', tokyoB64))
          .then(function(decoded) {
            expect(decoded).to.be.instanceof(ArrayBuffer);
            expect(decoded).to.deep.equal(tokyoArrayBuffer);
          }).done();
      });

      /* ====================================================================== */

      promises("should encode a large binary in BASE64", function() {
        return maybeAsync(encode('BASE-64', binary.uint8Array))
          .then(function(encoded) {
            expect(encoded).to.be.a('string');
            expect(encoded).to.equal(binary.base64);
          }).done();
      });

      promises("should decode a large binary from BASE64", function() {
        return maybeAsync(decode('BASE-64', binary.base64))
          .then(function(decoded) {
            expect(decoded).to.be.instanceof(ArrayBuffer);
            expect(decoded).to.deep.equal(binary.uint8Array.buffer);
          }).done();
      });

    });
  }
});

