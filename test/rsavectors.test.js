'use strict';

Esquire.define('test/rsavectors', [ 'bletchley/ciphers/RSACipher',
                                    'bletchley/ciphers/RSAKey',
                                    'bletchley/codecs',
                                    'bletchley/paddings/Paddings',
                                    'test/rsa/pkcs1Vectors',
                                    'test/rsa/oaepVectors',
                                    'test/FakeRandom' ],
  function(RSACipher, RSAKey, codecs, Paddings, pkcs1Vectors, oaepVectors, FakeRandom) {

    var paddings = new Paddings();
    var pkcs1 = paddings.$helper("PKCS1");
    var oaep = paddings.$helper("OAEP");

    return function() {

      describe("RSA test vectors", function() {

        describe("PKCS#1 v1.5", function() {
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
                  var rsa = new RSACipher(pkcs1, rnd);

                  /* Parse out message and encrypted */
                  var msg = codecs.decode('HEX', vector.msg);
                  var enc = codecs.decode('HEX', vector.enc);

                  /* Decrypt first */
                  var dec = rsa.decrypt(key, enc);
                  expect(dec).to.deep.equal(msg);

                  /* Encrypt then */
                  var out = rsa.encrypt(key, msg);
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
                  var rsa = new RSACipher(oaep, rnd);

                  /* Parse out message and encrypted */
                  var msg = codecs.decode('HEX', vector.msg);
                  var enc = codecs.decode('HEX', vector.enc);

                  /* Decrypt first */
                  var dec = rsa.decrypt(key, enc);
                  expect(dec).to.deep.equal(msg);

                  /* Encrypt then */
                  var out = rsa.encrypt(key, msg);
                  var oh = codecs.encode('HEX', out);
                  var eh = codecs.encode('HEX', enc);
                  expect(oh).to.deep.equal(eh);

                });
              })(suite.vectors[j], key);
            });
          })(oaepVectors[i]);
        });

      });
    }
  }
);
