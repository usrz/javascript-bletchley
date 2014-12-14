'use strict';

Esquire.define('test/random', [ 'bletchley/random/Arc4Random',
                                'bletchley/random/SecureRandom',
                                'bletchley/codecs',
                                'test/badrandom' ],
  function(Arc4Random, SecureRandom, codecs, badrandom) {

    var a4bad = badrandom.a4bad;
    var srbad = badrandom.srbad;

    return function() {
      describe("Random", function() {
        describe("Arc4Random", function() {

          it("should generate some non-random data when wrongly initialized", function() {
            var data = new Arc4Random(new Uint8Array(256)).nextBytes(16);
            var hex = codecs.encode("HEX", data);

            expect(data).to.be.instanceof(Uint8Array);
            expect(data).not.to.be.deep.equal(new Uint8Array(16));

            expect(a4bad.indexOf(hex), "Bad Arc4Random initialization").to.be.at.least(0);
          });

          it("should generate some random data when correctly initialized", function() {
            var data = new Arc4Random().nextBytes(16);
            var hex = codecs.encode("HEX", data);

            expect(data).to.be.instanceof(Uint8Array);
            expect(data).not.to.be.deep.equal(new Uint8Array(16));

            expect(a4bad.indexOf(hex), "Bad Arc4Random initialization").to.be.equal(-1);
          });

          it("should not generate empty arrays", function() {
            expect(function() {
              return new Arc4Random().nextBytes(0);
            }).to.throw(Error);

            expect(function() {
              return new Arc4Random().nextBytes(new Uint8Array());
            }).to.throw(Error);
          });

        });

        describe("SecureRandom", function() {

          /* Basically test that our internals work correctly with nextBytes */
          it("should generate some non-random arrays when wrongly initialized", function() {
            var random = new SecureRandom(new Uint8Array(256));

            for (var i = 1, pos = 0; i <= 40; pos += (i * 2), i++) {
              var data = random.nextBytes(i);
              var hex = codecs.encode('HEX', data);

              expect(data).to.be.instanceof(Uint8Array);
              expect(data.length).to.equal(i);
              expect(srbad.indexOf(hex)).to.be.equal(pos);
            }
          });

          /* Basically test that our internals work correctly with next */
          it("should generate some non-random numbers when wrongly initialized", function() {
            var random = new SecureRandom(new Uint8Array(256));
            var bad = codecs.decode('HEX', srbad);

            for (var i = 0; i < 1024; i++) {
              var data = random.next();
              expect(data).to.be.a('number');
              expect(bad[i]).to.equal(data);
            }
          });

          /* Just check that we have the correct default initialization */
          it("should generate some random data when correctly initialized", function() {
            var data = new SecureRandom().nextBytes(16);
            var hex = codecs.encode("HEX", data);

            expect(data).to.be.instanceof(Uint8Array);
            expect(data).not.to.be.deep.equal(new Uint8Array(16));

            expect(srbad.indexOf(hex), "Bad SecureRandom initialization").to.be.equal(-1);
          });

          /* Calling random at zero bytes is wrong */
          it("should not generate empty arrays", function() {
            expect(function() {
              return new SecureRandom().nextBytes(0);
            }).to.throw(Error);

            expect(function() {
              return new SecureRandom().nextBytes(new Uint8Array());
            }).to.throw(Error);
          });

        });

      });
    }
  }
);

