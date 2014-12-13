'use strict';

Esquire.define('test/rsacipher', [ 'bletchley/ciphers/RSACipher',
                                   'bletchley/ciphers/RSAKey',
                                   'bletchley/codecs/Codecs',
                                   'bletchley/paddings/Paddings',
                                   'bletchley/utils/Random',
                                   'test/rsa/pkcs1Vectors',
                                   'test/rsa/oaepVectors',
                                   'test/FakeRandom' ],
  function(RSACipher, RSAKey, Codecs, Paddings, Random, pkcs1Vectors, oaepVectors, FakeRandom) {

    var codecs = new Codecs();
    var paddings = new Paddings();

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
    var rnd = new Random();

    var pkcs1 = paddings.$helper("PKCS1");
    var oaep = paddings.$helper("OAEP");

    return function() {
      describe("RSA/PKCS1 Cipher", function() {

        var rsa = new RSACipher(key, pkcs1, rnd);

        it('should decrypt a short string', function() {
          // echo -n 'abc' | openssl rsautl -inkey foo.key -encrypt | base64
          var buf = codecs.decode('BASE64', 'QwlnoX3G6XZSwitf2VCUlVQpDB37ajH/kDQCUAOAer3TrRErKl37zKGHJeaK7PsiBLeNZCYLwNHk0lMwRnjGcSKhrZlFI0t9onybn1U6JuCR3aQL9NOlVLbCE2VUUfaTAS0jTc1n8AEG5BSpkL0wK6T4zjvH/BYkBUAkPh8ot1M=');

          var out = rsa.decrypt(buf);
          expect(out).to.be.instanceof(Uint8Array);
          expect(out.length).to.equal(3);
          expect(out).to.deep.equal(new Uint8Array([0x61, 0x62, 0x63]));
        })

        it('should decrypt a whole block', function() {
          // echo -n 'aaaa...117 times...' | openssl rsautl -inkey foo.key -encrypt | base64
          var buf = codecs.decode('BASE64', 'G6gkBINMfiPoLtmyLvOAps789G2XaCmHE2R84GGOUlKUFGIpkZHvwZrTHwH4UqbJxBLh1pCusYMHIAxIMRRuf5bZQuJieX2o4nB1IonRoWsSHHNEqAJLMCOhWoFhLAbjvJJWUo9Y60rf4q31NdNBsB59avgPBRmIC5P7iVUEyYc=');

          var out = rsa.decrypt(buf);
          expect(out).to.be.instanceof(Uint8Array);
          expect(out.length).to.equal(117);
          for (var i = 0; i < out.length; i ++) {
            expect(out[i]).to.equal(0x61);
          }
        })

        it('should encrypt and decrypt a short known string', function() {
          var buf = new Uint8Array([0x61, 0x62, 0x63, 0x0A]);

          var enc = rsa.encrypt(buf);
          expect(enc).to.be.instanceof(Uint8Array);
          expect(enc.length).to.equal(128);

          // echo '...whatever...' | base64 -D | openssl rsautl -inkey foo.key -decrypt
          // console.warn("echo -n '" + codecs.encode('BASE64', enc) + "'  | base64 -D | openssl rsautl -inkey foo.key -decrypt");

          var dec = rsa.decrypt(enc);
          expect(dec).to.be.instanceof(Uint8Array);
          expect(dec.length).to.equal(4);
          expect(dec).to.deep.equal(buf);
        });

        it('should encrypt and decrypt an empty array', function() {

          var enc = rsa.encrypt(new Uint8Array());
          expect(enc).to.be.instanceof(Uint8Array);
          expect(enc.length).to.equal(128);

          // openssl will cowardly refuse to decrypt a zero-length string, yelding "RSA operation error"
          // console.warn("echo -n '" + codecs.encode('BASE64', enc) + "'  | base64 -D | openssl rsautl -inkey foo.key -decrypt");

          var dec = rsa.decrypt(enc);
          expect(dec).to.be.instanceof(Uint8Array);
          expect(dec.length).to.equal(0);
        });

        it.skip('should encrypt and decrypt at various lengths', function() {
          this.timeout(10000); // this will take time...
          for (var i = 1; i < 117; i ++) {
            var buf = rnd.nextBytes(i);

            var enc = rsa.encrypt(buf);
            expect(enc).to.be.instanceof(Uint8Array);
            expect(enc.length).to.equal(128);

            var dec = rsa.decrypt(enc);
            expect(dec).to.be.instanceof(Uint8Array);
            expect(dec.length).to.equal(buf.length);
            expect(dec).to.deep.equal(buf);
          }
        });
      })

      describe("RSA test vectors", function() {
        function qdescribe(){};
        qdescribe("PKCS#1 v1.5", function() {
          for (var i in pkcs1Vectors) (function(suite) {
            var n = codecs.decode('HEX', suite.key.n);
            var e = codecs.decode('HEX', suite.key.e);
            var d = codecs.decode('HEX', suite.key.d);
            var key = new RSAKey(n, e, d);

            describe(suite.name, function() {
              for (var j in suite.vectors) (function(vector, key) {
                it(vector.name, function() {

                  /* New fake random and RSA */
                  var rnd = new FakeRandom(vector.rnd);
                  var rsa = new RSACipher(key, pkcs1, rnd);

                  /* Parse out message and encrypted */
                  var msg = codecs.decode('HEX', vector.msg);
                  var enc = codecs.decode('HEX', vector.enc);

                  /* Decrypt first */
                  var dec = rsa.decrypt(enc);
                  expect(dec).to.deep.equal(msg);

                  /* Encrypt then */
                  var out = rsa.encrypt(msg);
                  expect(out).to.deep.equal(enc);

                });
              })(suite.vectors[j], key);
            });
          })(pkcs1Vectors[i]);
        });

        describe("OAEP", function() {
          for (var i in oaepVectors) (function(suite) {
            var n = codecs.decode('HEX', suite.key.n);
            var e = codecs.decode('HEX', suite.key.e);
            var d = codecs.decode('HEX', suite.key.d);
            var key = new RSAKey(n, e, d);

            describe(suite.name, function() {
              for (var j in suite.vectors) (function(vector, key) {
                it(vector.name, function() {

                  /* New fake random and RSA */
                  var rnd = new FakeRandom(vector.rnd);
                  var rsa = new RSACipher(key, oaep, rnd);

                  /* Parse out message and encrypted */
                  var msg = codecs.decode('HEX', vector.msg);
                  var enc = codecs.decode('HEX', vector.enc);

                  /* Decrypt first */
                  // var dec = rsa.decrypt(enc);
                  // expect(dec).to.deep.equal(msg);

                  /* Encrypt then */
                  var out = rsa.encrypt(msg);
                  var oh = codecs.encode('HEX', out);
                  var eh = codecs.encode('HEX', enc);
                  // console.log("\nOUT=" + oh + "\n   ~" + eh);
                  expect(oh).to.deep.equal(eh);

                  console.warn("DECRYPT");

                  /* Decrypt first */
                  var dec = rsa.decrypt(enc);
                  expect(dec).to.deep.equal(msg);


                });
              })(suite.vectors[j], key);
            });
          })(oaepVectors[i]);
        });

      });
    }
  }
);
