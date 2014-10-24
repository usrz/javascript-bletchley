describe("UZCrypto", function() {
  beforeEach(module('UZCrypto'));

  describe("_subtle", function() {

    /* We can not test subtle crypto with empty arrays, M$ will never return */
    var test = new Uint8Array([0x74, 0x65, 0x73, 0x74]);
    var test_sha256 = new Uint8Array([0x9f, 0x86, 0xd0, 0x81, 0x88, 0x4c, 0x7d, 0x65, 0x9a, 0x2f, 0xea, 0xa0, 0xc5, 0x5a, 0xd0, 0x15, 0xa3, 0xbf, 0x4f, 0x1b, 0x2b, 0x0b, 0x82, 0x2c, 0xd1, 0x5d, 0x6c, 0x15, 0xb0, 0xf0, 0x0a, 0x08]);

    it("should exist", function() {
      inject(['_subtle', function(_subtle) {
        expect(_subtle).to.exist;
      }]);
    });

    it("should digest", function(done) {
      inject(['$rootScope', '_subtle', function($rootScope, _subtle) {

        if (_subtle.digest) {
          _subtle.digest({ name: "SHA-256" }, test) // M$ has no SHA-1 ???
            .then(function(success) {
              /*
               * This is *REALLY* asynchronous (subtle crypto returns promises)
               * so throwing exceptions here will just mean they'll end up in
               * the exception log... Make sure we call "done(...)" at the end.
               */
              try {
                /* Either ArrayBuffer or Uint8Array from Subtle */
                try {
                  expect(success).to.be.an.instanceof(ArrayBuffer);
                } catch (e) {
                  expect(success).to.be.an.instanceof(Uint8Array);
                }

                expect(new Uint8Array(success)).to.eql(test_sha256);
                done();
              } catch (error) {
                console.log("CAUGHT", error);
                done(error);
              }

              done();
            }, function(failure) {
              console.log("FAILED", failure);
              done(failure);
            });

          /* Resolve all our $q's promises, just in case... */
          $rootScope.$apply();

        } else {
          /* The _subtle function has no digest */
          done();
        }
      }]);
    });
  });
});
