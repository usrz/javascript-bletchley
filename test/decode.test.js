describe("decode", function() {
  beforeEach(module('UZCrypto'));

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

  it("should exist", inject(['_decode', function(_decode) {
    expect(_decode).to.exist;
  }]));

  it("should fail decoding with unknown algorithm", inject(['$done', '_decode', function($done, _decode) {

    _decode('FOO', tokyo )
      .then(function(success) {
        $done(success);
      }, function(failure) {
        expect(failure).to.be.an.instanceof(Error);
        expect(failure.message).to.equal('Unsupported decoding algorithm: FOO');
        $done();
      });

  }]));

  it("should fail decoding garbage", inject(['$done', '_decode', function($done, _decode) {

    _decode('UTF8', { a: 1 })
      .then(function(success) {
        $done(success);
      }, function(failure) {
        expect(failure).to.be.an.instanceof(Error);
        expect(failure.message).to.match(/^Supplied data is not a/);
        $done();
      });

  }]));

  it("should fail decoding null data", inject(['$done', '_decode', function($done, _decode) {

    _decode('UTF8', null)
      .then(function(success) {
        $done(success);
      }, function(failure) {
        expect(failure).to.be.an.instanceof(Error);
        expect(failure.message).to.equal('No data to decode');
        $done();
      });

  }]));

  it("should handle nested promises", inject(['$done', '_decode', '_encode', function($done, _decode, _encode) {

    _decode('HEX', _encode('HEX', _decode('BASE64', _encode('BASE64', tokyo))))
      .then(function(success) {
        expect(success).to.be.an.instanceof(Uint8Array);
        expect(success).to.eql(tokyoArray);
        $done();

      }, function(failure) {
        $done(failure);
      });

  }]));

  /* ====================================================================== */
  /* UTF-8 TESTS                                                            */
  /* ====================================================================== */

  describe("UTF8", function() {

    it("decode", inject(['$done', '_decode', function($done, _decode) {

      _decode('UTF8', tokyo)
        .then(function(success) {
          expect(success).to.be.an.instanceof(Uint8Array);
          expect(success).to.eql(tokyoArray);
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

    it("decode lower case", inject(['$done', '_decode', function($done, _decode) {

      _decode('HEX', tokyoHex.toLowerCase())
        .then(function(success) {
          expect(success).to.be.an.instanceof(Uint8Array);
          expect(success).to.eql(tokyoArray);
          $done();

        }, function(failure) {
          $done(failure);
        });

    }]));

    it("decode upper case", inject(['$done', '_decode', function($done, _decode) {

      _decode('HEX', tokyoHex.toUpperCase())
        .then(function(success) {
          expect(success).to.be.an.instanceof(Uint8Array);
          expect(success).to.eql(tokyoArray);
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

    it("decode", inject(['$done', '_decode', function($done, _decode) {

      _decode('BASE64', tokyoB64)
        .then(function(success) {
          expect(success).to.be.an.instanceof(Uint8Array);
          expect(success).to.eql(tokyoArray);
          $done();

        }, function(failure) {
          $done(failure);
        });

    }]));

  });
});
