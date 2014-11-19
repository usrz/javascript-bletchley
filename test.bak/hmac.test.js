define(['crypto', 'utils/uint8'], function(crypto, uint8) {
  describe("hmac", function() {
    beforeEach(module('UZCrypto'));

    it("should exist", inject(['_hmac', function(_hmac) {
      expect(_hmac).to.exist;
      expect(_hmac).to.be.a('function');
    }]));

    /* SHA-1 from WikiPedia */
    describe('SHA-1', function() {

      it("should compute a valid HMAC for empty values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-1", '', ''))
          .then(function(success) {
            expect(success).to.be.equal('fbdb1d1b18aa6c08324b7d64b71fb76370690e1d');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

      it("should compute a valid HMAC for known values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-1", 'key', 'The quick brown fox jumps over the lazy dog'))
          .then(function(success) {
            expect(success).to.be.equal('de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

    });

    /* SHA-224 (calculated) */
    describe('SHA-224', function() {

      it("should compute a valid HMAC for empty values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-224", '', ''))
          .then(function(success) {
            expect(success).to.be.equal('5ce14f72894662213e2748d2a6ba234b74263910cedde2f5a9271524');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

      it("should compute a valid HMAC for known values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-224", 'key', 'The quick brown fox jumps over the lazy dog'))
          .then(function(success) {
            expect(success).to.be.equal('88ff8b54675d39b8f72322e65ff945c52d96379988ada25639747e69');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

    });

    /* SHA-256 from WikiPedia */
    describe('SHA-256', function() {

      it("should compute a valid HMAC for empty values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-256", '', ''))
          .then(function(success) {
            expect(success).to.be.equal('b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

      it("should compute a valid HMAC for known values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-256", 'key', 'The quick brown fox jumps over the lazy dog'))
          .then(function(success) {
            expect(success).to.be.equal('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

    });

    /* SHA-384 (calculated) */
    describe('SHA-384', function() {

      it("should compute a valid HMAC for empty values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-384", '', ''))
          .then(function(success) {
            expect(success).to.be.equal('6c1f2ee938fad2e24bd91298474382ca218c75db3d83e114b3d4367776d14d3551289e75e8209cd4b792302840234adc');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

      it("should compute a valid HMAC for known values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-384", 'key', 'The quick brown fox jumps over the lazy dog'))
          .then(function(success) {
            expect(success).to.be.equal('d7f4727e2c0b39ae0f1e40cc96f60242d5b7801841cea6fc592c5d3e1ae50700582a96cf35e1e554995fe4e03381c237');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

    });

    /* SHA-512 (calculated) */
    describe('SHA-512', function() {

      it("should compute a valid HMAC for empty values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-512", '', ''))
          .then(function(success) {
            expect(success).to.be.equal('b936cee86c9f87aa5d3c6f2e84cb5a4239a5fe50480a6ec66b70ab5b1f4ac6730c6c515421b327ec1d69402e53dfb49ad7381eb067b338fd7b0cb22247225d47');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

      it("should compute a valid HMAC for known values", inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

        _encode('HEX', _hmac("SHA-512", 'key', 'The quick brown fox jumps over the lazy dog'))
          .then(function(success) {
            expect(success).to.be.equal('b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a');
            $done();
          }, function(failure) {
            $done(failure);
          })

      }]));

    });

    /* Tests from RFC-4231 */
    describe('RFC-4231', function() {

      /* Definitions of salt, data and results from RFC-4231 */
      var rfcTests = {
        "test 1": {
          salt:      uint8.createUint8Array(20, 0x0b),
          data:      uint8.toUint8Array("Hi There"),
          results: {
            "SHA-224": "896fb1128abbdf196832107cd49df33f47b4b1169912ba4f53684b22",
            "SHA-256": "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
            "SHA-384": "afd03944d84895626b0825f4ab46907f15f9dadbe4101ec682aa034c7cebc59cfaea9ea9076ede7f4af152e8b2fa9cb6",
            "SHA-512": "87aa7cdea5ef619d4ff0b4241a1d6cb02379f4e2ce4ec2787ad0b30545e17cdedaa833b7d6b8a702038b274eaea3f4e4be9d914eeb61f1702e696c203a126854",
          }
        },
        "test 2": {
          salt:      uint8.toUint8Array("Jefe"),
          data:      uint8.toUint8Array("what do ya want for nothing?"),
          results: {
            "SHA-224": "a30e01098bc6dbbf45690f3a7e9e6d0f8bbea2a39e6148008fd05e44",
            "SHA-256": "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
            "SHA-384": "af45d2e376484031617f78d2b58a6b1b9c7ef464f5a01b47e42ec3736322445e8e2240ca5e69e2c78b3239ecfab21649",
            "SHA-512": "164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737",
          }
        },
        "test 3": {
          salt:      uint8.createUint8Array(20, 0xaa),
          data:      uint8.createUint8Array(50, 0xdd),
          results: {
            "SHA-224": "7fb3cb3588c6c1f6ffa9694d7d6ad2649365b0c1f65d69d1ec8333ea",
            "SHA-256": "773ea91e36800e46854db8ebd09181a72959098b3ef8c122d9635514ced565fe",
            "SHA-384": "88062608d3e6ad8a0aa2ace014c8a86f0aa635d947ac9febe83ef4e55966144b2a5ab39dc13814b94e3ab6e101a34f27",
            "SHA-512": "fa73b0089d56a284efb0f0756c890be9b1b5dbdd8ee81a3655f83e33b2279d39bf3e848279a722c806b485a47e67c807b946a337bee8942674278859e13292fb",
          }
        },
        "test 4": {
          salt:      uint8.toUint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19]),
          data:      uint8.createUint8Array(50, 0xcd),
          results: {
            "SHA-224": "6c11506874013cac6a2abc1bb382627cec6a90d86efc012de7afec5a",
            "SHA-256": "82558a389a443c0ea4cc819899f2083a85f0faa3e578f8077a2e3ff46729665b",
            "SHA-384": "3e8a69b7783c25851933ab6290af6ca77a9981480850009cc5577c6e1f573b4e6801dd23c4a7d679ccf8a386c674cffb",
            "SHA-512": "b0ba465637458c6990e5a8c5f61d4af7e576d97ff94b872de76f8050361ee3dba91ca5c11aa25eb4d679275cc5788063a5f19741120c4f2de2adebeb10a298dd",
          }
        },

        /* test 5 uses truncated hashes, forget it */

        "test 6": {
          salt:      uint8.createUint8Array(131, 0xaa),
          data:      uint8.toUint8Array("Test Using Larger Than Block-Size Key - Hash Key First"),
          results: {
            "SHA-224": "95e9a0db962095adaebe9b2d6f0dbce2d499f112f2d2b7273fa6870e",
            "SHA-256": "60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54",
            "SHA-384": "4ece084485813e9088d2c63a041bc5b44f9ef1012a2b588f3cd11f05033ac4c60c2ef6ab4030fe8296248df163f44952",
            "SHA-512": "80b24263c7c1a3ebb71493c1dd7be8b49b46d1f41b4aeec1121b013783f8f3526b56d037e05f2598bd0fd2215d6a1e5295e64f73f63f0aec8b915a985d786598",
          }
        },
        "test 7": {
          salt:      uint8.createUint8Array(131, 0xaa),
          data:      uint8.toUint8Array("This is a test using a larger than block-size key and a larger than block-size data. The key needs to be hashed before being used by the HMAC algorithm."),
          results: {
            "SHA-224": "3a854166ac5d9f023f54d517d0b39dbd946770db9c2b95c9f6f565d1",
            "SHA-256": "9b09ffa71b942fcb27635fbcd5b0e944bfdc63644f0713938a7f51535c3a35e2",
            "SHA-384": "6617178e941f020d351e2f254e8fd32c602420feb0b8fb9adccebb82461e99c5a678cc31e799176d3860e6110c46523e",
            "SHA-512": "e37b6a775dc87dbaa4dfa9f96e5e3ffddebd71f8867289865df5a32d20cdc944b6022cac3c4982b10d5eeb55c3e4de15134676fb6de0446065c97440fa8c6a58",
          }
        }
      }

      for (var name in rfcTests) {
        var test = rfcTests[name];
        var salt = test.salt;
        var data = test.data;
        var results = test.results;

        describe(name, function() {
          for (var algorithm in results) {
            it(algorithm, (function(name, algorithm, salt, data, result) {

              return inject(['$done', '_hmac', '_encode', function($done, _hmac, _encode) {

                _encode('HEX', _hmac(algorithm, salt, data))
                  .then(function(success) {
                    expect(success).to.be.equal(result);
                    $done();
                  }, function(failure) {
                    $done(failure);
                  })

              }]);

            })(name, algorithm, salt, data, results[algorithm]));
          }
        });
      }
    });
  });
});
