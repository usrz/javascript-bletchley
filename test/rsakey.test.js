'use strict';

Esquire.define('test/RSAKey', ['bletchley/ciphers/RSAKey', 'bletchley/utils/BigInteger', 'bletchley/codecs/Codecs', 'bletchley/utils/Random'], function(RSAKey, BigInteger, Codecs, Random) {

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

      it('should have a bit length', function() {
        var key = new RSAKey(n_hex, e_hex)
        expect(key.bitLength).to.equal(1024);
        expect(key.blockSize).to.equal(128);
      });

      it('should parse a X.509 public key', function() {
        var pem = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOts8BH8RmOgTvQ1ffZS3LJc+j'
                + 'N7ENpprojn+4wqKeZtVfH2nc2ofOfu/HF16In/7dRyYTXCBLNFzYn+8XerMC58zR'
                + 'Z4H6cp0vs23JDeHMDklJiGz6potfAEtY7GsYPByE7KpHpr4o4Bovo15vJ1DQF6N5'
                + 'DxKsh3kTuc39wVcy7QIDAQAB';
        var der = codecs.decode('BASE64', pem);
        var key = RSAKey.parsePublic(der);

        var n = codecs.encode('HEX', key.n.toUint8Array());

        expect(n,             "N").to.equal('00' + n_hex);
        expect(key.e,         "E").to.equal(0x10001);
        expect(key.d,         "D").not.to.exist;
        expect(key.p,         "P").not.to.exist;
        expect(key.q,         "Q").not.to.exist;
        expect(key.dmp1,   "DMP1").not.to.exist;
        expect(key.dmq1,   "DMQ1").not.to.exist;
        expect(key.coeff, "COEFF").not.to.exist;

      });

      it('should parse a PKCS#8 private key', function() {
        var pem = 'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAM62zwEfxGY6BO9D'
                + 'V99lLcslz6M3sQ2mmuiOf7jCop5m1V8fadzah85+78cXXoif/t1HJhNcIEs0XNif'
                + '7xd6swLnzNFngfpynS+zbckN4cwOSUmIbPqmi18AS1jsaxg8HITsqkemvijgGi+j'
                + 'Xm8nUNAXo3kPEqyHeRO5zf3BVzLtAgMBAAECgYBHH4UH2PtFRQ8vl5cjaPehnwfb'
                + 'G61SihFglK8DTgyPvcgKa4+MCrCRbwFnGfZPweT6E6HZJWiDF6gebKDiDjiK11Nx'
                + 'hHgLj/gyPwae/ujtl8ylL1t9HYNdOTJDXJRELaSaIc0f5y7M271ZI+yLaxjsAE8E'
                + 'TXnEktzseZMHqZkZ7QJBAP2QHgfdq0p2HZ2yLihxgp7nRJlW5uqlKzLksGB5N83v'
                + 'Y+6oq663xECeAIBZx+yT4oMPyFSyvXV3Qg4LQPGPWhsCQQDQs2vcmTeH7gH71ojF'
                + 'T3K3x1KfcsIPYlbx7fr+i/l0GuX/RmDIKfNKahDmiF4TDiKkVbIbhaMFOrGpOSWv'
                + 'G/eXAkEAqW5zoq3sl4T1pTo6vaubrLK8k/oNsx1LEGbftJdLQsCD9iWfEtCYwtTR'
                + 'YPKdNOhco1cYdgA5uRRHfzrl2oP/oQJBAIows9QfM/DyvSeHV4rm33wnJGNl9m9/'
                + 'WzjYrqDMCIJDqVWNwVnoxSrZ7pTnaPtPGcsc31Fv/JDi227E41n+t8MCQQD1vsBU'
                + 'K8MdSX1FtHjvqc2jg+hqin5Ed3xBA2n+Rc2wdvgfye45MlJD/qZMMtwb4ai+FkYv'
                + 'pUjvYB0w5xWZvFoP';
        var der = codecs.decode('BASE64', pem);
        var key = RSAKey.parsePrivate(der);

        var n     = codecs.encode('HEX', key.n.toUint8Array());
        var d     = codecs.encode('HEX', key.d.toUint8Array());
        var p     = codecs.encode('HEX', key.p.toUint8Array());
        var q     = codecs.encode('HEX', key.q.toUint8Array());
        var dmp1  = codecs.encode('HEX', key.dmp1.toUint8Array());
        var dmq1  = codecs.encode('HEX', key.dmq1.toUint8Array());
        var coeff = codecs.encode('HEX', key.coeff.toUint8Array());

        expect(n,         "N").to.equal('00' + n_hex);
        expect(key.e,     "E").to.equal(0x10001);
        expect(d,         "D").to.equal(       d_hex); // positive!
        expect(p,         "P").to.equal('00' + p_hex);
        expect(q,         "Q").to.equal('00' + q_hex);
        expect(dmp1,   "DMP1").to.equal('00' + dmp1_hex);
        expect(dmq1,   "DMQ1").to.equal('00' + dmq1_hex);
        expect(coeff, "COEFF").to.equal('00' + coeff_hex);

      });

      it('should parse a PKCS#8 private key with no public exponent', function() {
        // Made in Java using only modulus and private exponent via KeyFactory...
        var pem = 'MIIBNgIBADANBgkqhkiG9w0BAQEFAASCASAwggEcAgEAAoGBAM62zwEfxGY6BO9D'
                + 'V99lLcslz6M3sQ2mmuiOf7jCop5m1V8fadzah85+78cXXoif/t1HJhNcIEs0XNif'
                + '7xd6swLnzNFngfpynS+zbckN4cwOSUmIbPqmi18AS1jsaxg8HITsqkemvijgGi+j'
                + 'Xm8nUNAXo3kPEqyHeRO5zf3BVzLtAgEAAoGARx+FB9j7RUUPL5eXI2j3oZ8H2xut'
                + 'UooRYJSvA04Mj73ICmuPjAqwkW8BZxn2T8Hk+hOh2SVogxeoHmyg4g44itdTcYR4'
                + 'C4/4Mj8Gnv7o7ZfMpS9bfR2DXTkyQ1yURC2kmiHNH+cuzNu9WSPsi2sY7ABPBE15'
                + 'xJLc7HmTB6mZGe0CAQACAQACAQACAQACAQA=';
        var der = codecs.decode('BASE64', pem);
        var key = RSAKey.parsePrivate(der);

        var n     = codecs.encode('HEX', key.n.toUint8Array());
        var d     = codecs.encode('HEX', key.d.toUint8Array());

        expect(n,             "N").to.equal('00' + n_hex);
        expect(key.e,         "E").not.to.exist;
        expect(d,             "D").to.equal(d_hex); // positive!
        expect(key.p,         "P").not.to.exist;
        expect(key.q,         "Q").not.to.exist;
        expect(key.dmp1,   "DMP1").not.to.exist;
        expect(key.dmq1,   "DMQ1").not.to.exist;
        expect(key.coeff, "COEFF").not.to.exist;

      });

      it('should generate a simple 1024 bits key', function() {
        var key = RSAKey.generate(new Random(), 1024);

        expect(key).to.be.instanceof(RSAKey);

        expect(key.n,         "N").to.be.instanceof(BigInteger);
        expect(key.e,         "E").to.be.equal(0x10001);
        expect(key.d,         "D").to.be.instanceof(BigInteger);
        expect(key.p,         "P").to.be.instanceof(BigInteger);
        expect(key.q,         "Q").to.be.instanceof(BigInteger);
        expect(key.dmp1,   "DMP1").to.be.instanceof(BigInteger);
        expect(key.dmq1,   "DMQ1").to.be.instanceof(BigInteger);
        expect(key.coeff, "COEFF").to.be.instanceof(BigInteger);

        expect(key.blockSize, "key size").to.be.equal(128);
      });

      it('should generate a simple 512 bits key with 3 as public exponent', function() {
        var key = RSAKey.generate(new Random(), 512, 3);

        expect(key).to.be.instanceof(RSAKey);

        expect(key.n,         "N").to.be.instanceof(BigInteger);
        expect(key.e,         "E").to.be.equal(3);
        expect(key.d,         "D").to.be.instanceof(BigInteger);
        expect(key.p,         "P").to.be.instanceof(BigInteger);
        expect(key.q,         "Q").to.be.instanceof(BigInteger);
        expect(key.dmp1,   "DMP1").to.be.instanceof(BigInteger);
        expect(key.dmq1,   "DMQ1").to.be.instanceof(BigInteger);
        expect(key.coeff, "COEFF").to.be.instanceof(BigInteger);

        expect(key.blockSize, "key size").to.be.equal(64);
      });


    });
  }
});
