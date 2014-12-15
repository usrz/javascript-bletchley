'use strict';

Esquire.define('test/cipher/rsa', [ 'test/async',
                                    'bletchley/codecs',
                                    'bletchley/keys/RSAKey',
                                    'bletchley/keys/RSAKeyFactory',
                                    'bletchley/random/SecureRandom' ],
  function(async, codecs, RSAKey, RSAKeyFactory, SecureRandom) {

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
    var rnd = new SecureRandom();

    return function(crypto, isAsync) {
      var maybeAsync = async(isAsync);
      var key = crypto.importKey('RSA', der);

      describe("RSA cipher", function() {

        describe("PKCS#1", function() {

          promises('should decrypt a short string', function() {
            // echo -n 'abc' | openssl rsautl -pkcs -inkey ./test/keys/test.priv.openssl.pem -encrypt | base64
            var buf = codecs.decode('BASE64', 'QwlnoX3G6XZSwitf2VCUlVQpDB37ajH/kDQCUAOAer3TrRErKl37zKGHJeaK7PsiBLeNZCYLwNHk0lMwRnjGcSKhrZlFI0t9onybn1U6JuCR3aQL9NOlVLbCE2VUUfaTAS0jTc1n8AEG5BSpkL0wK6T4zjvH/BYkBUAkPh8ot1M=');

            return maybeAsync(crypto.decrypt('RSA/PKCS1', key, buf))
            .then(function(out) {
              expect(out).to.be.instanceof(Uint8Array);
              expect(out.length).to.equal(3);
              expect(out).to.deep.equal(new Uint8Array([0x61, 0x62, 0x63]));
            })
            .done();
          })

          promises('should decrypt a whole block', function() {
            // echo -n 'aaaa...117 times...' | openssl rsautl -pkcs -inkey ./test/keys/test.priv.openssl.pem -encrypt | base64
            var buf = codecs.decode('BASE64', 'G6gkBINMfiPoLtmyLvOAps789G2XaCmHE2R84GGOUlKUFGIpkZHvwZrTHwH4UqbJxBLh1pCusYMHIAxIMRRuf5bZQuJieX2o4nB1IonRoWsSHHNEqAJLMCOhWoFhLAbjvJJWUo9Y60rf4q31NdNBsB59avgPBRmIC5P7iVUEyYc=');

            return maybeAsync(crypto.decrypt('RSA/PKCS1', key, buf))
            .then(function(out) {
              expect(out).to.be.instanceof(Uint8Array);
              expect(out.length).to.equal(117);
              for (var i = 0; i < out.length; i ++) {
                expect(out[i]).to.equal(0x61);
              }
            })
            .done();
          })

          promises('should encrypt and decrypt a short known string', function() {
            var buf = new Uint8Array([0x61, 0x62, 0x63, 0x0A]);

            return maybeAsync(crypto.encrypt('RSA/PKCS1', key, buf))

            .then(function(enc) {
              // echo '...whatever...' | base64 -D | openssl rsautl -inkey foo.key -decrypt
              // console.warn("echo -n '" + codecs.encode('BASE64', enc) + "'  | base64 -D | openssl rsautl -inkey foo.key -decrypt");
              expect(enc).to.be.instanceof(Uint8Array);
              expect(enc.length).to.equal(128);
              return crypto.decrypt('RSA/PKCS1', key, enc);
            })

            .then(function(dec) {
              expect(dec).to.be.instanceof(Uint8Array);
              expect(dec.length).to.equal(4);
              expect(dec).to.deep.equal(buf);
            })

            .done();
          });

          promises('should encrypt and decrypt an empty array', function() {
            return maybeAsync(crypto.encrypt('RSA/PKCS1', key, new Uint8Array()))

            .then(function(enc) {
              // openssl will cowardly refuse to decrypt a zero-length string, yelding "RSA operation error"
              // console.warn("echo -n '" + codecs.encode('BASE64', enc) + "'  | base64 -D | openssl rsautl -inkey foo.key -decrypt");
              expect(enc).to.be.instanceof(Uint8Array);
              expect(enc.length).to.equal(128);
              return crypto.decrypt('RSA/PKCS1', key, enc);
            })

            .then(function(dec) {
              expect(dec).to.be.instanceof(Uint8Array);
              expect(dec.length).to.equal(0);
            })

            .done();
          });

          promises('should encrypt and decrypt a random block with a random key', function() {

            // TODO: keygen in Crypto!
            var xkey = crypto.generateKey('RSA', 1024);

            var buf = rnd.nextBytes(64);
            return maybeAsync(crypto.encrypt('RSA/PKCS1', xkey, buf))

            .then(function(enc) {
              expect(enc).to.be.instanceof(Uint8Array);
              expect(enc.length).to.equal(128);
              return crypto.decrypt('RSA/PKCS1', xkey, enc);
            })

            .then(function(dec) {
              expect(dec).to.be.instanceof(Uint8Array);
              expect(dec.length).to.equal(buf.length);
              expect(dec).to.deep.equal(buf);
            })

            .done();
          });
        })

        /* ================================================================== */

        describe("OAEP", function() {

          promises('should decrypt a short string', function() {
            // echo -n 'abc' | openssl rsautl -oaep -inkey ./test/keys/test.priv.openssl.pem -encrypt | base64
            var buf = codecs.decode('BASE64', 'x5GWy6Q/mowtDqLV+l6mWVkV/2sWfB7+s1V1Efnh9jx+D5ZDD8wLKfoJA/shMRQmv4j+pF66HQcep2L3A8QVcAF1e+njmBv6W2c9G+H/BTjV7tXfdN/3FpnBYMmOhhiFXWff1WoyXua7i4fLXgL/CAnNeg5WyKZPWf8uqrX2tqg=');

            return maybeAsync(crypto.decrypt('RSA/OAEP', key, buf))
            .then(function(out) {
              expect(out).to.be.instanceof(Uint8Array);
              expect(out.length).to.equal(3);
              expect(out).to.deep.equal(new Uint8Array([0x61, 0x62, 0x63]));
            })
            .done();
          })

          promises('should decrypt a whole block', function() {
            // echo -n 'aaaa...86 times...' | openssl rsautl -oaep -inkey ./test/keys/test.priv.openssl.pem -encrypt | base64
            var buf = codecs.decode('BASE64', 'E6dPJwgKAPVFGN7CMK4giaEgDmZY+jN0vjyTUo8y57dTsJZcT/jFSsWiHGLMInGhFkaL2RHtEdYd4p80AKwUbOzxc2jnMNMZ8dfrrS9pkb3mnyL0vJ8i7QnrqvZ5QIZKKxKkkDFlchdx1QakFm6jUmOrTJHNxj8Vt4pMzsnV2Vk=');

            return maybeAsync(crypto.decrypt('RSA/OAEP', key, buf))
            .then(function(out) {
              expect(out).to.be.instanceof(Uint8Array);
              expect(out.length).to.equal(86);
              for (var i = 0; i < out.length; i ++) {
                expect(out[i]).to.equal(0x61);
              }
            })
            .done();
          })

          promises('should encrypt and decrypt a short known string', function() {
            var buf = new Uint8Array([0x61, 0x62, 0x63, 0x0A]);

            return maybeAsync(crypto.encrypt('RSA/OAEP', key, buf))

            .then(function(enc) {
              // echo '...whatever...' | base64 -D | openssl rsautl -inkey foo.key -decrypt
              // console.warn("echo -n '" + codecs.encode('BASE64', enc) + "'  | base64 -D | openssl rsautl -inkey foo.key -decrypt");
              expect(enc).to.be.instanceof(Uint8Array);
              expect(enc.length).to.equal(128);
              return crypto.decrypt('RSA/OAEP', key, enc);
            })

            .then(function(dec) {
              expect(dec).to.be.instanceof(Uint8Array);
              expect(dec.length).to.equal(4);
              expect(dec).to.deep.equal(buf);
            })

            .done();
          });

          promises('should encrypt and decrypt an empty array', function() {
            return maybeAsync(crypto.encrypt('RSA/OAEP', key, new Uint8Array()))

            .then(function(enc) {
              // openssl will cowardly refuse to decrypt a zero-length string, yelding "RSA operation error"
              // console.warn("echo -n '" + codecs.encode('BASE64', enc) + "'  | base64 -D | openssl rsautl -inkey foo.key -decrypt");
              expect(enc).to.be.instanceof(Uint8Array);
              expect(enc.length).to.equal(128);
              return crypto.decrypt('RSA/OAEP', key, enc);
            })

            .then(function(dec) {
              expect(dec).to.be.instanceof(Uint8Array);
              expect(dec.length).to.equal(0);
            })

            .done();
          });

          promises('should encrypt and decrypt a random block with a random key', function() {
            // TODO: keygen in Crypto!
            var xkey = crypto.generateKey('RSA', 1024);

            var buf = rnd.nextBytes(64);
            return maybeAsync(crypto.encrypt('RSA/OAEP', xkey, buf))
            .then(function(enc) {
              expect(enc).to.be.instanceof(Uint8Array);
              expect(enc.length).to.equal(128);
              return crypto.decrypt('RSA/OAEP', xkey, enc);
            })

            .then(function(dec) {
              expect(dec).to.be.instanceof(Uint8Array);
              expect(dec.length).to.equal(buf.length);
              expect(dec).to.deep.equal(buf);
            })

            .done();
          });
        })
      })
    }
  }
);
