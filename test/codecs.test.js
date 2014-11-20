'use strict';

describe("Codecs", function() {
  esquire(['mocha/promises', 'bletchley/codecs', 'bletchley/test/binary'], function(promises, codecs, binary) {

    /* String for 'Tokyo' in Japanese */
    var tokyo = "\u6771\u4EAC";
    /* Uint8Array of 'Tokyo' in UTF8 */
    var tokyoArray = [230, 157, 177, 228, 186, 172];
    /* Uint8Array of 'Tokyo' in UTF8 */
    var tokyoUint8Array = new Uint8Array(tokyoArray);
    /* HEX string of 'Tokyo' in UTF8 (we encode in lower case) */
    var tokyoHex = 'e69db1e4baac';
    /* Base 64 string of 'Tokyo' in UTF8 */
    var tokyoB64 = '5p2x5Lqs';

    /* ====================================================================== */
    /* BASIC TESTS                                                            */
    /* ====================================================================== */

    it("should exist", function() {
      expect(codecs).to.exist;
      expect(codecs).to.be.a('object');
      expect(codecs.encode).to.be.a('function');
      expect(codecs.decode).to.be.a('function');
      expect(codecs.algorithms).to.contain("BASE-64");
      expect(codecs.algorithms).to.contain("HEX");
      expect(codecs.algorithms).to.contain("UTF-8");
    });

    /* ====================================================================== */
    /* UTF-8 TESTS                                                            */
    /* ====================================================================== */

    promises("should encode in UTF8", function(resolve) {
      return resolve(codecs.encode('UTF-8', tokyoArray))
        .then(function(encoded) {
          expect(encoded).to.be.a('string');
          expect(encoded).to.equal(tokyo);
        });
    });

    promises("should decode from UTF8", function(resolve) {
      return resolve(codecs.decode('UTF-8', tokyo))
        .then(function(decoded) {
          expect(decoded).to.be.instanceof(Uint8Array);
          expect(decoded).to.deep.equal(tokyoUint8Array);
        });
    });

    /* ====================================================================== */
    /* HEX TESTS                                                              */
    /* ====================================================================== */

    promises("should encode in HEX", function(resolve) {
      return resolve(codecs.encode('HEX', tokyoArray))
        .then(function(encoded) {
          expect(encoded).to.be.a('string');
          expect(encoded).to.equal(tokyoHex);
        });
    });

    promises("should decode from HEX", function(resolve) {
      return resolve(codecs.decode('HEX', tokyoHex))
        .then(function(decoded) {
          expect(decoded).to.be.instanceof(Uint8Array);
          expect(decoded).to.deep.equal(tokyoUint8Array);
        });
    });

    promises("should encode a large binary in HEX", function(resolve) {
      return resolve(codecs.encode('HEX', binary.uint8Array))
        .then(function(encoded) {
          expect(encoded).to.be.a('string');
          expect(encoded).to.equal(binary.hex);
        });
    });

    promises("should decode a large binary from HEX", function(resolve) {
      return resolve(codecs.decode('HEX', binary.hex))
        .then(function(decoded) {
          expect(decoded).to.be.instanceof(Uint8Array);
          expect(decoded).to.deep.equal(binary.uint8Array);
        });
    });

    /* ====================================================================== */
    /* BASE_64 TESTS                                                          */
    /* ====================================================================== */

    promises("should encode in BASE64", function(resolve) {
      return resolve(codecs.encode('BASE-64', tokyoArray))
        .then(function(encoded) {
          expect(encoded).to.be.a('string');
          expect(encoded).to.equal(tokyoB64);
        });
    });

    promises("should decode from BASE64", function(resolve) {
      return resolve(codecs.decode('BASE-64', tokyoB64))
        .then(function(decoded) {
          expect(decoded).to.be.instanceof(Uint8Array);
          expect(decoded).to.deep.equal(tokyoUint8Array);
        });
    });

    promises("should encode a large binary in BASE64", function(resolve) {
      return resolve(codecs.encode('BASE-64', binary.uint8Array))
        .then(function(encoded) {
          expect(encoded).to.be.a('string');
          expect(encoded).to.equal(binary.base64);
        });
    });

    promises("should decode a large binary from BASE64", function(resolve) {
      return resolve(codecs.decode('BASE-64', binary.base64))
        .then(function(decoded) {
          expect(decoded).to.be.instanceof(Uint8Array);
          expect(decoded).to.deep.equal(binary.uint8Array);
        });
    });

  });
});

