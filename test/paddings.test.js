'use strict';

Esquire.define('test/paddings', [ 'bletchley/utils/Random',
                                  'bletchley/blocks/Accumulator',
                                  'bletchley/paddings/PKCS1Padder',
                                  'bletchley/paddings/PKCS1Unpadder' ],
  function(Random, Accumulator, PKCS1Padder, PKCS1Unpadder) {

    var random = new Random();

    return function() {
      describe("Paddings", function() {
        describe("PKCS#1", function() {

          it("should pad and unpad a block", function() {
            var buf = random.nextBytes(64);
            var acc = new Accumulator();
            var pad = new PKCS1Padder(acc, random, 128);

            expect(pad.blockSize).to.equal(117);

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res[0], "leading zero").to.be.equal(0);
            expect(res[1], "block type").to.be.equal(2);
            expect(res[63], "delimiter").to.be.equal(0);
            expect(res.subarray(64), "data").to.be.deep.equal(buf);
            for (var i = 2; i < 63; i ++) {
              expect(res[i], "random at " + i).to.not.equal(0);
            }

            /* Unpad and check */
            res = new PKCS1Unpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(64);
            expect(res).to.deep.equal(buf);
          })

          it("should pad and unpad an empty block", function() {
            var buf = new Uint8Array();
            var acc = new Accumulator();
            var pad = new PKCS1Padder(acc, random, 128);

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res[0], "leading zero").to.be.equal(0);
            expect(res[1], "block type").to.be.equal(2);
            expect(res[127], "delimiter").to.be.equal(0);
            for (var i = 2; i < 127; i ++) {
              expect(res[i], "random at " + i).to.not.equal(0);
            }

            /* Unpad and check */
            res = new PKCS1Unpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(0);
            expect(res).to.deep.equal(buf);
          })

          it("should pad and unpad an block full of zeroes", function() {
            var buf = new Uint8Array(64); // all zeroes
            var acc = new Accumulator();
            var pad = new PKCS1Padder(acc, random, 128);

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res[0], "leading zero").to.be.equal(0);
            expect(res[1], "block type").to.be.equal(2);
            expect(res[63], "delimiter").to.be.equal(0);
            expect(res.subarray(64), "data").to.be.deep.equal(buf);
            for (var i = 2; i < 63; i ++) {
              expect(res[i], "random at " + i).to.not.equal(0);
            }

            /* Unpad and check */
            res = new PKCS1Unpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(64);
            expect(res).to.deep.equal(buf);
          })

          it("should pad an full block", function() {
            var acc = new Accumulator();
            var pad = new PKCS1Padder(acc, random, 128);
            var buf = random.nextBytes(pad.blockSize);

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res[0], "leading zero").to.be.equal(0);
            expect(res[1], "block type").to.be.equal(2);
            expect(res[10], "delimiter").to.be.equal(0);
            for (var i = 2; i < 10; i ++) {
              expect(res[i], "random at " + i).to.not.equal(0);
            }

            /* Unpad and check */
            res = new PKCS1Unpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(pad.blockSize);
            expect(res).to.deep.equal(buf);
          })

          /* ================================================================ */

          it("should not pad an oversized block", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new PKCS1Padder(acc, random, 128);
              var buf = random.nextBytes(pad.blockSize + 1);
              pad.push(buf);
            }).to.throw("Message too big (max 117 bytes)");
          })

          it("should not unpad an oversized block", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new PKCS1Unpadder(acc, 128);
              var buf = random.nextBytes(129);
              pad.push(buf);
            }).to.throw("Message must have the same length as key");
          })

          it("should not unpad an undersized block", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new PKCS1Unpadder(acc, 128);
              var buf = random.nextBytes(127);
              pad.push(buf);
            }).to.throw("Message must have the same length as key");
          })

          it("should not unpad an illegal block", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new PKCS1Unpadder(acc, 128);
              var buf = random.nextBytes(128);
              buf[0] = 1; // make sure we have a wrong leading zero
              pad.push(buf);
            }).to.throw("Invalid message leading zero");
          })

          it("should not unpad a block of type different from two", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new PKCS1Unpadder(acc, 128);
              var buf = random.nextBytes(128);
              buf[0] = 0; // make sure we have a leading zero
              buf[1] = 1; // wrong block type 1
              pad.push(buf);
            }).to.throw("Invalid message block type");
          })

          it("should not unpad a block without a delimiter", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new PKCS1Unpadder(acc, 128);
              var buf = new Uint8Array(128);
              buf[0] = 0; // make sure we have a leading zero
              buf[1] = 2; // wrong block type 1
              for (var i = 2; i < 128; i ++) buf[i] = i;
              pad.push(buf);
            }).to.throw("Message delimiter not found");
          })

        });
      });
    }
  }
);
