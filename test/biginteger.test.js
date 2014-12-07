'use strict';

Esquire.define('test/BigInteger', ['bletchley/utils/BigInteger', 'bletchley/codecs/Codecs'], function(BigInteger, Codecs) {

  return function() {
    var codecs = new Codecs();

    describe("Big Integers", function() {

      it('should correctly construct a BigInteger with negative bit', function() {

        var array = codecs.decode('HEX', "ceb6cf");

        var b1 = BigInteger.fromArray(array);
        var b2 = BigInteger.fromArray(1,  array);
        var b3 = BigInteger.fromArray(-1, array);

        expect(b1.toString(16)).to.be.equal("-314931");
        expect(b2.toString(16)).to.be.equal("ceb6cf");
        expect(b3.toString(16)).to.be.equal("-ceb6cf");

        expect(codecs.encode('HEX', b1.toByteArray())).to.be.equal("ceb6cf");
        expect(codecs.encode('HEX', b2.toByteArray())).to.be.equal("00ceb6cf");
        expect(codecs.encode('HEX', b3.toByteArray())).to.be.equal("ff314931");

        expect(codecs.encode('HEX', b1.toUint8Array())).to.be.equal("ceb6cf");
        expect(codecs.encode('HEX', b2.toUint8Array())).to.be.equal("00ceb6cf");
        expect(codecs.encode('HEX', b3.toUint8Array())).to.be.equal("ff314931");
      });

      it('should correctly construct a BigInteger with positive bit', function() {

        var array = codecs.decode('HEX', "123456");

        var b1 = BigInteger.fromArray(array);
        var b2 = BigInteger.fromArray(1,  array);
        var b3 = BigInteger.fromArray(-1, array);

        expect(b1.toString(16)).to.be.equal("123456");
        expect(b2.toString(16)).to.be.equal("123456");
        expect(b3.toString(16)).to.be.equal("-123456");

        expect(codecs.encode('HEX', b1.toByteArray())).to.be.equal("123456");
        expect(codecs.encode('HEX', b2.toByteArray())).to.be.equal("123456");
        expect(codecs.encode('HEX', b3.toByteArray())).to.be.equal("edcbaa");

        expect(codecs.encode('HEX', b1.toUint8Array())).to.be.equal("123456");
        expect(codecs.encode('HEX', b2.toUint8Array())).to.be.equal("123456");
        expect(codecs.encode('HEX', b3.toUint8Array())).to.be.equal("edcbaa");
      });

      it("should encode ever increasing bits", function() {
        var b = BigInteger.ONE;
        for (var x = 0; x < 1000; x ++) {
          var plainArray = b.toByteArray();
          var uint8Array = b.toUint8Array();
          expect(uint8Array.length).to.be.equal(plainArray.length);
          expect(codecs.encode('HEX', uint8Array)).to.be.equal(codecs.encode("HEX", plainArray));
          b = b.shiftLeft(1);
        }

        var b = BigInteger.ONE.negate();
        for (var x = 0; x < 1000; x ++) {
          var plainArray = b.toByteArray();
          var uint8Array = b.toUint8Array();
          expect(uint8Array.length).to.be.equal(plainArray.length);
          expect(codecs.encode('HEX', uint8Array)).to.be.equal(codecs.encode("HEX", plainArray));
          b = b.shiftLeft(1);
        }

      });
    });
  }
});
