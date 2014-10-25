describe("UZEncoder", function() {
  beforeEach(module('UZEncoder'));

  describe("_encoder", function() {

    /* String for 'Tokyo' in Japanese */
    var tokyo = "\u6771\u4EAC";
    /* Uint8Array of 'Tokyo' in UTF8 */
    var tokyoArray = new Uint8Array(6);
    tokyoArray[0] = 230;
    tokyoArray[1] = 157;
    tokyoArray[2] = 177;
    tokyoArray[3] = 228;
    tokyoArray[4] = 186;
    tokyoArray[5] = 172;
    /* HEX string of 'Tokyo' in UTF8 (we encode in lower case) */
    var tokyoHex = 'e69db1e4baac';
    /* Base 64 string of 'Tokyo' in UTF8 */
    var tokyoB64 = '5p2x5Lqs';

    /* ====================================================================== */
    /* BASIC TESTS                                                            */
    /* ====================================================================== */

    it("should exist", inject(['_encoder', function(_encoder) {
      expect(_encoder).to.exist;
    }]));

    it("should have three algorithms", inject(['_encoder', function(_encoder) {
      expect(_encoder.algorithms).to.exist;
      expect(_encoder.algorithms.length).to.equal(3);
      expect(_encoder.algorithms).to.include.members([ "UTF8", "HEX", "BASE64" ]);
    }]));

    it("should fail encoding with unknown algorithm", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.encode('FOO', tokyo )
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.equal('Unsupported encoding algorithm: FOO');
          $done();
        });

    }]));

    it("should fail decoding with unknown algorithm", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.decode('FOO', tokyo )
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.equal('Unsupported decoding algorithm: FOO');
          $done();
        });

    }]));

    it("should fail encoding garbage", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.encode('UTF8', { a: 1 })
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.match(/^Supplied data is not a/);
          $done();
        });

    }]));

    it("should fail decoding garbage", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.decode('UTF8', { a: 1 })
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.match(/^Supplied data is not a/);
          $done();
        });

    }]));

    it("should fail encoding null data", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.encode('UTF8', null)
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.equal('No data to encode');
          $done();
        });

    }]));

    it("should fail decoding null data", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.decode('UTF8', null)
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.equal('No data to decode');
          $done();
        });

    }]));

    it("should handle nested promises", inject(['$done', '_encoder', function($done, _encoder) {

      _encoder.encode('UTF8', _encoder.decode('HEX', _encoder.encode('HEX', _encoder.decode('BASE64', tokyoB64))))
        .then(function(success) {
          expect(success).to.be.a('string');
          expect(success).to.equal(tokyo);
          $done();

        }, function(failure) {
          $done(failure);
        });

    }]));

    /* ====================================================================== */
    /* UTF-8 TESTS                                                            */
    /* ====================================================================== */

    describe("UTF8", function() {

      it("decode", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.decode('UTF8', tokyo)
          .then(function(success) {
            expect(success).to.be.an.instanceof(Uint8Array);
            expect(success).to.eql(tokyoArray);
            $done();

          }, function(failure) {
            $done(failure);
          });

      }]));

      it("encode Uint8Array", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.encode('UTF8', tokyoArray)
          .then(function(success) {
            expect(success).to.be.a('string');
            expect(success).to.equal(tokyo);
            $done();
          }, function(failure) {
            $done(failure);
          });

      }]));

      it("encode plain array", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.encode('UTF8', [230, 157, 177, 228, 186, 172])
          .then(function(success) {
            expect(success).to.be.a('string');
            expect(success).to.equal(tokyo);
            $done();
          }, function(failure) {
            $done(failure);
          });

      }]));

      it("encode string (pass-through)", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.encode('UTF8', tokyo)
          .then(function(success) {
            expect(success).to.be.a('string');
            expect(success).to.equal(tokyo);
            $done();
          }, function(failure) {
            $done(failure);
          });

      }]));
    });

    /* ====================================================================== */
    /* HEX TESTS                                                              */
    /* ====================================================================== */

    describe("HEX", function() {

      it("decode lower case", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.decode('HEX', tokyoHex.toLowerCase())
          .then(function(success) {
            expect(success).to.be.an.instanceof(Uint8Array);
            expect(success).to.eql(tokyoArray);
            $done();

          }, function(failure) {
            $done(failure);
          });

      }]));

      it("decode upper case", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.decode('HEX', tokyoHex.toUpperCase())
          .then(function(success) {
            expect(success).to.be.an.instanceof(Uint8Array);
            expect(success).to.eql(tokyoArray);
            $done();

          }, function(failure) {
            $done(failure);
          });

      }]));

      it("encode", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.encode('HEX', tokyoArray)
          .then(function(success) {
            expect(success).to.be.a('string');
            expect(success).to.equal(tokyoHex);
            $done();

          }, function(failure) {
            $done(failure);
          });

      }]));
    });

    /* ====================================================================== */
    /* BASE_64 TESTS                                                          */
    /* ====================================================================== */

    describe("BASE64", function() {

      it("decode", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.decode('BASE64', tokyoB64)
          .then(function(success) {
            expect(success).to.be.an.instanceof(Uint8Array);
            expect(success).to.eql(tokyoArray);
            $done();

          }, function(failure) {
            $done(failure);
          });

      }]));

      it("encode", inject(['$done', '_encoder', function($done, _encoder) {

        _encoder.encode('BASE64', tokyoArray)
          .then(function(success) {
            expect(success).to.be.a('string');
            expect(success).to.equal(tokyoB64);
            $done();

          }, function(failure) {
            $done(failure);
          });

      }]));
    });
  });
});
