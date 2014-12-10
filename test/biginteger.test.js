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

      it("should correctly encode specifying an Array", function() {

        var b1 = new BigInteger.fromInt(-0x314931);
        var b2 = new BigInteger.fromInt( 0xCEB6CF);
        var b3 = new BigInteger.fromInt(-0xCEB6CF);

        var a1 = new Array(5);
        var a2 = new Array(5);
        var a3 = new Array(5);

        var l1 = b1.toByteArray(a1);
        var l2 = b2.toByteArray(a2);
        var l3 = b3.toByteArray(a3);

        expect(l1).to.be.equal(3);
        expect(l2).to.be.equal(4);
        expect(l3).to.be.equal(4);

        expect(a1[0]).to.equal(-50);
        expect(a1[1]).to.equal(-74);
        expect(a1[2]).to.equal(-49);
        expect(a1[3]).to.be.undefined;
        expect(a1[4]).to.be.undefined;

        expect(a2[0]).to.equal(0);
        expect(a2[1]).to.equal(-50);
        expect(a2[2]).to.equal(-74);
        expect(a2[3]).to.equal(-49);
        expect(a2[4]).to.be.undefined;

        expect(a3[0]).to.equal(-1);
        expect(a3[1]).to.equal(49);
        expect(a3[2]).to.equal(73);
        expect(a3[3]).to.equal(49);
        expect(a3[4]).to.be.undefined;

        expect(new Uint8Array(a1)).to.deep.equal(new Uint8Array([0xCE, 0xB6, 0xCF, 0, 0]));
        expect(new Uint8Array(a2)).to.deep.equal(new Uint8Array([0x00, 0xCE, 0xB6, 0xCF, 0]));
        expect(new Uint8Array(a3)).to.deep.equal(new Uint8Array([0xFF, 0x31, 0x49, 0x31, 0]));

        expect(function() { b1.toByteArray(new Array(2)) }).to.throw(/Argument must be an Array of at least 3 bytes/);
        expect(function() { b2.toByteArray(new Array(3)) }).to.throw(/Argument must be an Array of at least 4 bytes/);
        expect(function() { b3.toByteArray(new Array(3)) }).to.throw(/Argument must be an Array of at least 4 bytes/);

      });

      it("should correctly encode specifying an Uint8Array (using toUint8Array)", function() {

        var b1 = new BigInteger.fromInt(-0x314931);
        var b2 = new BigInteger.fromInt( 0xCEB6CF);
        var b3 = new BigInteger.fromInt(-0xCEB6CF);

        var a1 = new Uint8Array(5);
        var a2 = new Uint8Array(5);
        var a3 = new Uint8Array(5);

        var l1 = b1.toUint8Array(a1);
        var l2 = b2.toUint8Array(a2);
        var l3 = b3.toUint8Array(a3);

        expect(l1).to.be.equal(3);
        expect(l2).to.be.equal(4);
        expect(l3).to.be.equal(4);

        expect(a1).to.deep.equal(new Uint8Array([0xCE, 0xB6, 0xCF, 0, 0]));
        expect(a2).to.deep.equal(new Uint8Array([0x00, 0xCE, 0xB6, 0xCF, 0]));
        expect(a3).to.deep.equal(new Uint8Array([0xFF, 0x31, 0x49, 0x31, 0]));

        expect(function() { b1.toUint8Array(new Uint8Array(2)) }).to.throw(/Argument must be a Uint8Array of at least 3 bytes/);
        expect(function() { b2.toUint8Array(new Uint8Array(3)) }).to.throw(/Argument must be a Uint8Array of at least 4 bytes/);
        expect(function() { b3.toUint8Array(new Uint8Array(3)) }).to.throw(/Argument must be a Uint8Array of at least 4 bytes/);

      });

      it("should correctly encode specifying an Uint8Array (using toByteArray)", function() {

        var b1 = new BigInteger.fromInt(-0x314931);
        var b2 = new BigInteger.fromInt( 0xCEB6CF);
        var b3 = new BigInteger.fromInt(-0xCEB6CF);

        var a1 = new Uint8Array(5);
        var a2 = new Uint8Array(5);
        var a3 = new Uint8Array(5);

        var l1 = b1.toByteArray(a1);
        var l2 = b2.toByteArray(a2);
        var l3 = b3.toByteArray(a3);

        expect(l1).to.be.equal(3);
        expect(l2).to.be.equal(4);
        expect(l3).to.be.equal(4);

        expect(a1).to.deep.equal(new Uint8Array([0xCE, 0xB6, 0xCF, 0, 0]));
        expect(a2).to.deep.equal(new Uint8Array([0x00, 0xCE, 0xB6, 0xCF, 0]));
        expect(a3).to.deep.equal(new Uint8Array([0xFF, 0x31, 0x49, 0x31, 0]));

        expect(function() { b1.toByteArray(new Uint8Array(2)) }).to.throw(/Argument must be an Array of at least 3 bytes/);
        expect(function() { b2.toByteArray(new Uint8Array(3)) }).to.throw(/Argument must be an Array of at least 4 bytes/);
        expect(function() { b3.toByteArray(new Uint8Array(3)) }).to.throw(/Argument must be an Array of at least 4 bytes/);

      });


    });
  }
});
