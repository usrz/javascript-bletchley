'use strict';

Esquire.define('test/RSAKey', ['bletchley/ciphers/RSAKey', 'bletchley/utils/BigInteger', 'bletchley/codecs/Codecs', 'bletchley/random/SecureRandom'], function(RSAKey, BigInteger, Codecs, SecureRandom) {

  return function() {
    var codecs = new Codecs();
    var random = new SecureRandom();

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

      it('should parse and re-encode a X.509 public key', function() {
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

        /* Encode private key and check */
        var enc = key.encodePublic();
        expect(enc).to.be.instanceof(Uint8Array);
        expect(enc).to.deep.equal(der);
      });

      it('should parse and re-encode PKCS#8 private key', function() {
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

        /* Encode private key and check */
        var enc = key.encodePrivate();
        expect(enc).to.be.instanceof(Uint8Array);
        expect(enc).to.deep.equal(der);
      });

      it('should parse and re-encode a PKCS#8 private key with no public exponent', function() {
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

        /* Encode private key and check */
        var enc = key.encodePrivate();
        expect(enc).to.be.instanceof(Uint8Array);
        expect(enc).to.deep.equal(der);
      });

      it('should generate the correct PCKS#8 format for the RSA test vector key', function() {
        var n     = BigInteger.fromString('bbf82f090682ce9c2338ac2b9da871f7368d07eed41043a440d6b6f07454f51fb8dfbaaf035c02ab61ea48ceeb6fcd4876ed520d60e1ec4619719d8a5b8b807fafb8e0a3dfc737723ee6b4b7d93a2584ee6a649d060953748834b2454598394ee0aab12d7b61a51f527a9a41f6c1687fe2537298ca2a8f5946f8e5fd091dbdcb', 16)
        var e     = BigInteger.fromString('11', 16);
        var d     = BigInteger.fromString('a5dafc5341faf289c4b988db30c1cdf83f31251e0668b42784813801579641b29410b3c7998d6bc465745e5c392669d6870da2c082a939e37fdcb82ec93edac97ff3ad5950accfbc111c76f1a9529444e56aaf68c56c092cd38dc3bef5d20a939926ed4f74a13eddfbe1a1cecc4894af9428c2b7b8883fe4463a4bc85b1cb3c1', 16);
        var p     = BigInteger.fromString('eecfae81b1b9b3c908810b10a1b5600199eb9f44aef4fda493b81a9e3d84f632124ef0236e5d1e3b7e28fae7aa040a2d5b252176459d1f397541ba2a58fb6599', 16);
        var q     = BigInteger.fromString('c97fb1f027f453f6341233eaaad1d9353f6c42d08866b1d05a0f2035028b9d869840b41666b42e92ea0da3b43204b5cfce3352524d0416a5a441e700af461503', 16);
        var dmp1  = BigInteger.fromString('54494ca63eba0337e4e24023fcd69a5aeb07dddc0183a4d0ac9b54b051f2b13ed9490975eab77414ff59c1f7692e9a2e202b38fc910a474174adc93c1f67c981', 16);
        var dmq1  = BigInteger.fromString('471e0290ff0af0750351b7f878864ca961adbd3a8a7e991c5c0556a94c3146a7f9803f8f6f8ae342e931fd8ae47a220d1b99a495849807fe39f9245a9836da3d', 16);
        var coeff = BigInteger.fromString('b06c4fdabb6301198d265bdbae9423b380f271f73453885093077fcd39e2119fc98632154f5883b167a967bf402b4e9e2e0f9656e698ea3666edfb25798039f7', 16);

        var hex = '30820275020100300d06092a864886f70d01010105000482025f3082025b02010002818100bbf82f'
                + '090682ce9c2338ac2b9da871f7368d07eed41043a440d6b6f07454f51fb8dfbaaf035c02ab61ea48'
                + 'ceeb6fcd4876ed520d60e1ec4619719d8a5b8b807fafb8e0a3dfc737723ee6b4b7d93a2584ee6a64'
                + '9d060953748834b2454598394ee0aab12d7b61a51f527a9a41f6c1687fe2537298ca2a8f5946f8e5'
                + 'fd091dbdcb02011102818100a5dafc5341faf289c4b988db30c1cdf83f31251e0668b42784813801'
                + '579641b29410b3c7998d6bc465745e5c392669d6870da2c082a939e37fdcb82ec93edac97ff3ad59'
                + '50accfbc111c76f1a9529444e56aaf68c56c092cd38dc3bef5d20a939926ed4f74a13eddfbe1a1ce'
                + 'cc4894af9428c2b7b8883fe4463a4bc85b1cb3c1024100eecfae81b1b9b3c908810b10a1b5600199'
                + 'eb9f44aef4fda493b81a9e3d84f632124ef0236e5d1e3b7e28fae7aa040a2d5b252176459d1f3975'
                + '41ba2a58fb6599024100c97fb1f027f453f6341233eaaad1d9353f6c42d08866b1d05a0f2035028b'
                + '9d869840b41666b42e92ea0da3b43204b5cfce3352524d0416a5a441e700af461503024054494ca6'
                + '3eba0337e4e24023fcd69a5aeb07dddc0183a4d0ac9b54b051f2b13ed9490975eab77414ff59c1f7'
                + '692e9a2e202b38fc910a474174adc93c1f67c9810240471e0290ff0af0750351b7f878864ca961ad'
                + 'bd3a8a7e991c5c0556a94c3146a7f9803f8f6f8ae342e931fd8ae47a220d1b99a495849807fe39f9'
                + '245a9836da3d024100b06c4fdabb6301198d265bdbae9423b380f271f73453885093077fcd39e211'
                + '9fc98632154f5883b167a967bf402b4e9e2e0f9656e698ea3666edfb25798039f7';
        var der = codecs.decode('HEX', hex);

        // construct only with E, D, P, Q and hope the rest gets calculated...
        var key = new RSAKey(null, e, d, p, q);

        expect(key.n.equals(n),             "N").to.be.true;
        expect(key.e,                       "E").to.be.equal(0x11);
        expect(key.d.equals(d),             "D").to.be.true;
        expect(key.p.equals(p),             "P").to.be.true;
        expect(key.q.equals(q),             "Q").to.be.true;
        expect(key.dmp1.equals(dmp1),    "DMP1").to.be.true;
        expect(key.dmq1.equals(dmq1),    "DMQ1").to.be.true;
        expect(key.coeff.equals(coeff), "COEFF").to.be.true;

        // now encode as a PKCS#8 private key
        var enc = key.encodePrivate();
        expect(enc).to.be.instanceof(Uint8Array);
        expect(enc).to.deep.equal(der);
      });

      it('should generate a simple 1024 bits key', function() {
        var key = RSAKey.generate(random, 1024);

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
        var key = RSAKey.generate(random, 512, 3);

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
