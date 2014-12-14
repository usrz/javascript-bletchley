'use strict';

Esquire.define('test/codecs', ['test/async', 'test/binary', 'bletchley/crypto/Crypto', 'bletchley/crypto/AsyncCrypto', 'bletchley/utils/arrays'],
function(async, binary, Crypto, AsyncCrypto, arrays) {

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

      describe("HEX", function() {
        promises("should encode string", function() {
          return maybeAsync(encode('HEX', tokyoString))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoHex);
            }).done();
        });

        promises("should encode array", function() {
          return maybeAsync(encode('HEX', tokyoArray))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoHex);
            }).done();
        });

        promises("should encode array buffer", function() {
          return maybeAsync(encode('HEX', tokyoArrayBuffer))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoHex);
            }).done();
        });

        promises("should encode typed array", function() {
          return maybeAsync(encode('HEX', tokyoUint8Array))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoHex);
            }).done();
        });

        promises("should encode empty string", function() {
          return maybeAsync(encode('HEX', ''))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal('');
            }).done();
        });

        promises("should encode empty array", function() {
          return maybeAsync(encode('HEX', []))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal('');
            }).done();
        });


        /* ====================================================================== */

        promises("should decode", function() {
          return maybeAsync(decode('HEX', tokyoHex))
            .then(function(decoded) {
              expect(decoded).to.be.instanceof(Uint8Array);
              expect(decoded).to.deep.equal(tokyoUint8Array);
            }).done();
        });

        /* ====================================================================== */

        promises("should encode a large binary", function() {
          return maybeAsync(encode('HEX', binary.uint8Array))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(binary.hex);
            }).done();
        });

        promises("should decode a large binary", function() {
          return maybeAsync(decode('HEX', binary.hex))
            .then(function(decoded) {
              expect(decoded).to.be.instanceof(Uint8Array);
              expect(decoded).to.deep.equal(binary.uint8Array);
            }).done();
        });
      });

      /* ====================================================================== */
      /* BASE_64 TESTS                                                          */
      /* ====================================================================== */

      describe("BASE-64", function() {
        promises("should encode string", function() {
          return maybeAsync(encode('BASE-64', tokyoString))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoB64);
            }).done();
        });

        promises("should encode array", function() {
          return maybeAsync(encode('BASE-64', tokyoArray))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoB64);
            }).done();
        });

        promises("should encode array buffer", function() {
          return maybeAsync(encode('BASE-64', tokyoArrayBuffer))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoB64);
            }).done();
        });

        promises("should encode typed arrray", function() {
          return maybeAsync(encode('BASE-64', tokyoUint8Array))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(tokyoB64);
            }).done();
        });

        promises("should encode empty string", function() {
          return maybeAsync(encode('BASE-64', ''))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal('');
            }).done();
        });

        promises("should encode empty array", function() {
          return maybeAsync(encode('BASE-64', []))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal('');
            }).done();
        });

        /* ====================================================================== */

        promises("should decode", function() {
          return maybeAsync(decode('BASE-64', tokyoB64))
            .then(function(decoded) {
              expect(decoded).to.be.instanceof(Uint8Array);
              expect(decoded).to.deep.equal(tokyoUint8Array);
            }).done();
        });

        /* ====================================================================== */

        promises("should encode a large binary", function() {
          return maybeAsync(encode('BASE-64', binary.uint8Array))
            .then(function(encoded) {
              expect(encoded).to.be.a('string');
              expect(encoded).to.equal(binary.base64);
            }).done();
        });

        promises("should decode a large binary", function() {
          return maybeAsync(decode('BASE-64', binary.base64))
            .then(function(decoded) {
              expect(decoded).to.be.instanceof(Uint8Array);
              expect(decoded).to.deep.equal(binary.uint8Array);
            }).done();
        });

        /* ====================================================================== */

        var padded = {
          "a":           "YQ==",
          "ab":          "YWI=",
          "abc":         "YWJj",
          "abcd":        "YWJjZA==",
          "abcde":       "YWJjZGU=",
          "abcdef":      "YWJjZGVm",
          "abcdefg":     "YWJjZGVmZw==",
          "abcdefgh":    "YWJjZGVmZ2g=",
          "abcdefghi":   "YWJjZGVmZ2hp",
          "abcdefghij":  "YWJjZGVmZ2hpag==",
          "abcdefghijk": "YWJjZGVmZ2hpams=",
        };

        var unpadded = {
          "a":           "YQ",
          "ab":          "YWI",
          "abcd":        "YWJjZA",
          "abcde":       "YWJjZGU",
          "abcdefg":     "YWJjZGVmZw",
          "abcdefgh":    "YWJjZGVmZ2g",
          "abcdefghij":  "YWJjZGVmZ2hpag",
          "abcdefghijk": "YWJjZGVmZ2hpams",
        };

        describe("padded encoding", function() {
          var i = 0;
          for (var decoded in padded) {
            (function(index, decoded, encoded) {
              promises("test " + index, function() {
                return maybeAsync(encode('BASE-64', decoded))
                  .then(function(encoded) {
                    expect(encoded).to.be.a('string');
                    expect(encoded).to.equal(encoded);
                  }).done();
              });

            })(++i, decoded, padded[decoded]);
          };
        });

        describe("padded decoding", function() {
          var i = 0;
          for (var decoded in padded) {
            (function(index, decoded, encoded) {
              promises("test " + index, function() {
                return maybeAsync(decode('BASE-64', encoded))
                  .then(function(array) {
                    expect(array).to.be.instanceof(Uint8Array);
                    var string = arrays.decodeUTF8(array);
                    expect(string).to.be.equal(decoded);
                  }).done();
              });

            })(++i, decoded, padded[decoded]);
          };
        });

        describe("unpadded decoding", function() {
          var i = 0;
          for (var decoded in unpadded) {
            (function(index, decoded, encoded) {
              promises("test " + index, function() {
                return maybeAsync(decode('BASE-64', encoded))
                  .then(function(array) {
                    expect(array).to.be.instanceof(Uint8Array);
                    var string = arrays.decodeUTF8(array);
                    expect(string).to.be.equal(decoded);
                  }).done();
              });
            })(++i, decoded, unpadded[decoded]);
          };
        });
      });
    });
  }
});

