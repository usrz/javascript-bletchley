esquire(['bletchley/codecs', 'bletchley/test/binary'], function(codecs, binary) {

  describe("Codecs", function() {

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

    it("should encode in UTF8", function() {
      var encoded = codecs.encode('UTF-8', tokyoArray);
      expect(encoded).to.be.a('string');
      expect(encoded).to.equal(tokyo);
    });

    it("should decode from UTF8", function() {
      var decoded = codecs.decode('UTF-8', tokyo);
      expect(decoded).to.be.instanceof(Uint8Array);
      expect(decoded).to.deep.equal(tokyoUint8Array);
    });

    /* ====================================================================== */
    /* HEX TESTS                                                              */
    /* ====================================================================== */

    it("should encode in HEX", function() {
      var encoded = codecs.encode('HEX', tokyoArray);
      expect(encoded).to.be.a('string');
      expect(encoded).to.equal(tokyoHex);
    });

    it("should decode from HEX", function() {
      var decoded = codecs.decode('HEX', tokyoHex);
      expect(decoded).to.be.instanceof(Uint8Array);
      expect(decoded).to.deep.equal(tokyoUint8Array);
    });

    it("should encode a large binary in HEX", function() {
      var encoded = codecs.encode('HEX', binary.uint8Array);
      expect(encoded).to.be.a('string');
      expect(encoded).to.equal(binary.hex);
    });

    it("should decode a large binary from HEX", function() {
      var decoded = codecs.decode('HEX', binary.hex);
      expect(decoded).to.be.instanceof(Uint8Array);
      expect(decoded).to.deep.equal(binary.uint8Array);
    });

    /* ====================================================================== */
    /* BASE_64 TESTS                                                          */
    /* ====================================================================== */

    it("should encode in BASE64", function() {
      var encoded = codecs.encode('BASE-64', tokyoArray);
      expect(encoded).to.be.a('string');
      expect(encoded).to.equal(tokyoB64);
    });

    it("should decode from BASE64", function() {
      var decoded = codecs.decode('BASE-64', tokyoB64);
      expect(decoded).to.be.instanceof(Uint8Array);
      expect(decoded).to.deep.equal(tokyoUint8Array);
    });

    it("should encode a large binary in BASE64", function() {
      var encoded = codecs.encode('BASE-64', binary.uint8Array);
      expect(encoded).to.be.a('string');
      expect(encoded).to.equal(binary.base64);
    });

    it("should decode a large binary from BASE64", function() {
      var decoded = codecs.decode('BASE-64', binary.base64);
      expect(decoded).to.be.instanceof(Uint8Array);
      expect(decoded).to.deep.equal(binary.uint8Array);
    });

  });
});

