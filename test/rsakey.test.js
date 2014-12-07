'use strict';

Esquire.define('test/RSAKey', ['bletchley/ciphers/RSAKey', 'bletchley/utils/BigInteger', 'bletchley/codecs/Codecs'], function(RSAKey, BigInteger, Codecs) {

  return function() {
    var codecs = new Codecs();

    var n_hex     = 'ceb6cf011fc4663a04ef4357df652dcb25cfa337b10da69ae88e7fb8c2a29e66d55f1f69dcda87ce7eefc7175e889ffedd4726135c204b345cd89fef177ab302e7ccd16781fa729d2fb36dc90de1cc0e4949886cfaa68b5f004b58ec6b183c1c84ecaa47a6be28e01a2fa35e6f2750d017a3790f12ac877913b9cdfdc15732ed';
    var e_hex     = '010001';
    var d_hex     = '471f8507d8fb45450f2f97972368f7a19f07db1bad528a116094af034e0c8fbdc80a6b8f8c0ab0916f016719f64fc1e4fa13a1d925688317a81e6ca0e20e388ad7537184780b8ff8323f069efee8ed97cca52f5b7d1d835d3932435c94442da49a21cd1fe72eccdbbd5923ec8b6b18ec004f044d79c492dcec799307a99919ed';
    var p_hex     = 'fd901e07ddab4a761d9db22e2871829ee7449956e6eaa52b32e4b0607937cdef63eea8abaeb7c4409e008059c7ec93e2830fc854b2bd7577420e0b40f18f5a1b';
    var q_hex     = 'd0b36bdc993787ee01fbd688c54f72b7c7529f72c20f6256f1edfafe8bf9741ae5ff4660c829f34a6a10e6885e130e22a455b21b85a3053ab1a93925af1bf797';
    var dmp1_hex  = 'a96e73a2adec9784f5a53a3abdab9bacb2bc93fa0db31d4b1066dfb4974b42c083f6259f12d098c2d4d160f29d34e85ca35718760039b914477f3ae5da83ffa1';
    var dmq1_hex  = '8a30b3d41f33f0f2bd2787578ae6df7c27246365f66f7f5b38d8aea0cc088243a9558dc159e8c52ad9ee94e768fb4f19cb1cdf516ffc90e2db6ec4e359feb7c3';
    var coeff_hex = 'f5bec0542bc31d497d45b478efa9cda383e86a8a7e44777c410369fe45cdb076f81fc9ee39325243fea64c32dc1be1a8be16462fa548ef601d30e71599bc5a0f';

    var n_bi     = BigInteger.fromString(n_hex, 16);
    var e_bi     = BigInteger.fromInt(0x10001);
    var d_bi     = BigInteger.fromString(d_hex, 16);
    var p_bi     = BigInteger.fromString(p_hex, 16);
    var q_bi     = BigInteger.fromString(q_hex, 16);
    var dmp1_bi  = BigInteger.fromString(dmp1_hex, 16);
    var dmq1_bi  = BigInteger.fromString(dmq1_hex, 16);
    var coeff_bi = BigInteger.fromString(coeff_hex, 16);

    var n_arr     = codecs.decode("HEX", n_hex);
    var e_arr     = codecs.decode("HEX", e_hex);
    var d_arr     = codecs.decode("HEX", d_hex);
    var p_arr     = codecs.decode("HEX", p_hex);
    var q_arr     = codecs.decode("HEX", q_hex);
    var dmp1_arr  = codecs.decode("HEX", dmp1_hex);
    var dmq1_arr  = codecs.decode("HEX", dmq1_hex);
    var coeff_arr = codecs.decode("HEX", coeff_hex);


    describe("RSA Keys", function() {
      it('should construct with N and E (hex)', function() {
        var key = new RSAKey(n_hex, e_hex);

        expect(key.n.equals(n_bi), "N").to.be.true;
        expect(key.e,              "E").to.be.equal(0x10001);
        expect(key.d,              "D").not.to.exist;
        expect(key.p,              "P").not.to.exist;
        expect(key.q,              "Q").not.to.exist;
        expect(key.dmp1,        "DMP1").not.to.exist;
        expect(key.dmq1,        "DMQ1").not.to.exist;
        expect(key.coeff,      "COEFF").not.to.exist;

      });

      it('should construct with D, P and Q (hex)', function() {
        var key = new RSAKey(undefined, undefined, d_hex, p_hex, q_hex);

        expect(key.n.equals(n_bi),             "N").to.be.true;
        expect(key.e,                          "E").not.to.exist;
        expect(key.d.equals(d_bi),             "D").to.be.true;
        expect(key.p.equals(p_bi),             "P").to.be.true;
        expect(key.q.equals(q_bi),             "Q").to.be.true;
        expect(key.dmp1.equals(dmp1_bi),    "DMP1").to.be.true;
        expect(key.dmq1.equals(dmq1_bi),    "DMQ1").to.be.true;
        expect(key.coeff.equals(coeff_bi), "COEFF").to.be.true;

      });

      it('should construct with N and E (big integer)', function() {
        var key = new RSAKey(n_bi, e_bi);

        expect(key.n.equals(n_bi), "N").to.be.true;
        expect(key.e,              "E").to.be.equal(0x10001);
        expect(key.d,              "D").not.to.exist;
        expect(key.p,              "P").not.to.exist;
        expect(key.q,              "Q").not.to.exist;
        expect(key.dmp1,        "DMP1").not.to.exist;
        expect(key.dmq1,        "DMQ1").not.to.exist;
        expect(key.coeff,      "COEFF").not.to.exist;

      });

      it('should construct with D, P and Q (big integer)', function() {
        var key = new RSAKey(undefined, undefined, d_bi, p_bi, q_bi);

        expect(key.n.equals(n_bi),             "N").to.be.true;
        expect(key.e,                          "E").not.to.exist;
        expect(key.d.equals(d_bi),             "D").to.be.true;
        expect(key.p.equals(p_bi),             "P").to.be.true;
        expect(key.q.equals(q_bi),             "Q").to.be.true;
        expect(key.dmp1.equals(dmp1_bi),    "DMP1").to.be.true;
        expect(key.dmq1.equals(dmq1_bi),    "DMQ1").to.be.true;
        expect(key.coeff.equals(coeff_bi), "COEFF").to.be.true;

      });

      it('should construct with N and E (arrays)', function() {
        var key = new RSAKey(n_arr, e_arr);

        expect(key.n.equals(n_bi), "N").to.be.true;
        expect(key.e,              "E").to.be.equal(0x10001);
        expect(key.d,              "D").not.to.exist;
        expect(key.p,              "P").not.to.exist;
        expect(key.q,              "Q").not.to.exist;
        expect(key.dmp1,        "DMP1").not.to.exist;
        expect(key.dmq1,        "DMQ1").not.to.exist;
        expect(key.coeff,      "COEFF").not.to.exist;

      });

      it('should construct with D, P and Q (arrays)', function() {
        var key = new RSAKey(undefined, undefined, d_arr, p_arr, q_arr);

        expect(key.n.equals(n_bi),             "N").to.be.true;
        expect(key.e,                          "E").not.to.exist;
        expect(key.d.equals(d_bi),             "D").to.be.true;
        expect(key.p.equals(p_bi),             "P").to.be.true;
        expect(key.q.equals(q_bi),             "Q").to.be.true;
        expect(key.dmp1.equals(dmp1_bi),    "DMP1").to.be.true;
        expect(key.dmq1.equals(dmq1_bi),    "DMQ1").to.be.true;
        expect(key.coeff.equals(coeff_bi), "COEFF").to.be.true;

      });

      it('should construct with bogus data', function() {
        var key = new RSAKey("1", "2", "3", "4", "5", "6", "7", "8");

        expect(key.n.equals(BigInteger.fromInt(1)),         "N").to.be.true;
        expect(key.e,                                       "E").to.be.equal(2);
        expect(key.d.equals(BigInteger.fromInt(3)),         "D").to.be.true;
        expect(key.p.equals(BigInteger.fromInt(4)),         "P").to.be.true;
        expect(key.q.equals(BigInteger.fromInt(5)),         "Q").to.be.true;
        expect(key.dmp1.equals(BigInteger.fromInt(6)),   "DMP1").to.be.true;
        expect(key.dmq1.equals(BigInteger.fromInt(7)),   "DMQ1").to.be.true;
        expect(key.coeff.equals(BigInteger.fromInt(8)), "COEFF").to.be.true;

      });

      it('have a bit length', function() {
        console.warn(new RSAKey(n_hex, e_hex).bitLength());
      });

    });
  }
});
