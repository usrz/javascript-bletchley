'use strict';

Esquire.define('test/random', ['test/async', 'bletchley/codecs'], function(async, codecs) {

  /*
   * Those are the first 512 bytes generated by RC4 when initialized with a
   * Uint8Array full of zeroes... Just make sure we are properly initialized.
   */
  var bad = "9a8898ebed25895336ae119ae503cad6dc722b186d2b8acc542c6bc6e835f67deea63748e79f95c7781949a0e2818b62406af10b0025529818ef019998acafbe"
          + "29d359a4920fe766eb738e9745a91830a0a1b5e29691771f86262dbeabd4d5f16a1a92e0f66f241fe8559dfef8643d3ab59266ee52dc4b6b002e21d8406f320f"
          + "445c9a1858fbb7f796fd99d3402c37beaaa71cd3f60c2a31ee7a36ccf9a00e2a2d6b67b544c54f13456054d3b354c9f809119588e74dc92e49c7f4250c5a20a8"
          + "e379063e99ba935d3403216f6df7dbea128e6ad8be800476d311358c6535b348ccd85179401d2b71295ea5f2ac611ce4c239e30da7ae0113cf03ccc49bbce77b"
          + "dad4c44078aa0f2a74166b0137670fb77ca9a8bc5744a53b5d62d966231c626d9508b563fb57bd725a2ff12d41f4e02e70c2b00a000fe05ee63843318084359c"
          + "9ddc34c914a72323e8e710f5c8a66a4396e630fde3e0e38907dc41da4130f2a7e58e40fe31332def5f32895758ada0ba717f11ff00b0e9e5c35aa8ca9c51998f"
          + "79dfcec99afd865ac117d77a363cb270921a46d9c4e93a264e7fb10f063f290ac5ca44bd3d07db7307fdda6d8de007f0943a274ad3f1b57d08f9745418e570c2"
          + "c7cb8fd45f1e02cd6b1b1120f9928358ccb2afb5518f26526657ea505a03aabe96d13940ccbad90fb7bb01c6df9a7f36b8210378b532bd39da32697c8e32d1b3";

  return function(crypto, isAsync) {
    var maybeAsync = async(isAsync);

    describe("Random", function() {

      /* Functions must be bound */
      var random = crypto.random;
      var encode = codecs.encode;


      it("should exist", function() {
        expect(crypto).to.exist;
        expect(crypto).to.be.a('object');
        expect(crypto.random).to.be.a('function');
      });

      promises("should generate some random data", function() {
        return maybeAsync(random(16))

        .then(function(data) {
          expect(data).to.be.instanceof(Uint8Array);
          expect(data).not.to.be.deep.equal(new Uint8Array(16));
          return encode("HEX", data);
        })

        .then(function(hex) {
          expect(bad.indexOf(hex), "Bad RC4 initialization").to.be.equal(-1);
        })

        .done();
      });

      promises("should not generate empty arrays", function() {
        return maybeAsync(function() {
          return random(0)
        })

        .then(function(data) {
          throw new Error("Should fail");
        }, function(failure) {
          expect(failure).to.be.instanceof(Error);
        })

        .done();
      });

    });
  }
});

