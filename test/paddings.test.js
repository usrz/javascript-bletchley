'use strict';

Esquire.define('test/paddings', [ 'bletchley/utils/Random',
                                  'bletchley/codecs/Codecs',
                                  'bletchley/blocks/Accumulator',
                                  'bletchley/paddings/PKCS1Padder',
                                  'bletchley/paddings/PKCS1Unpadder',
                                  'bletchley/paddings/I2OSPPadder',
                                  'bletchley/paddings/OS2IPUnpadder' ],
  function(Random, Codecs, Accumulator, PKCS1Padder, PKCS1Unpadder, I2OSPPadder, OS2IPUnpadder) {

    var random = new Random();
    var codecs = new Codecs();

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

          it("should pad a full block", function() {
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

          /* ---------------------------------------------------------------- */

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

        /* ================================================================== */

        describe("I2OSP", function() {

          it("should pad and unpad a block with highest bit set", function() {
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);

            var buf = random.nextBytes(64);
            buf[0] = buf[0] | 128;

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);

            for (var i = 0; i < 63; i ++) {
              expect(res[i], "zero at " + i).to.equal(0);
            }
            expect(res.subarray(64), "data").to.be.deep.equal(buf);

            // console.log("BUFFER", buf.length, codecs.encode("HEX", buf));
            // console.log("   PAD", res.length, codecs.encode("HEX", res));
            // console.log("   RES", res.length, codecs.encode("HEX", res));

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(65);
            expect(res[0]).to.equal(0);
            expect(res.subarray(1)).to.deep.equal(buf);
          })

          it("should pad and unpad a block with highest bit unset", function() {
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);

            var buf = random.nextBytes(64);
            buf[0] = (buf[0] & 127) | 64;

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);

            for (var i = 0; i < 63; i ++) {
              expect(res[i], "zero at " + i).to.equal(0);
            }
            expect(res.subarray(64), "data").to.be.deep.equal(buf);

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(64);
            expect(res).to.deep.equal(buf);
          })

          it("should pad and unpad an empty block", function() {
            var buf = new Uint8Array();
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            for (var i = 0; i < 128; i ++) {
              expect(res[i], "zero at " + i).to.equal(0);
            }

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(1);
            expect(res[0]).to.equal(0);
          })

          it("should pad and unpad an block full of zeroes", function() {
            var buf = new Uint8Array(64); // all zeroes
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            for (var i = 0; i < 128; i ++) {
              expect(res[i], "zero at " + i).to.equal(0);
            }

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(1);
            expect(res[0]).to.equal(0);
          })

          it("should pad a full block with highest bit set", function() {
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);
            var buf = random.nextBytes(128);
            buf[0] = buf[0] | 128;

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res).to.be.deep.equal(buf);

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(129);
            expect(res[0]).to.equal(0);
            expect(res.subarray(1)).to.deep.equal(buf);
          })

          it("should pad a full block with highest bit unset", function() {
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);
            var buf = random.nextBytes(128);
            buf[0] = (buf[0] & 127) | 64;

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res).to.be.deep.equal(buf);

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(128);
            expect(res).to.deep.equal(buf);
          })

          it("should pad an oversized block with leading zeroes and highest bit set", function() {
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);

            var buf = new Uint8Array(256);
            random.nextBytes(buf.subarray(128));
            buf[128] = buf[128] | 128;

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res).to.be.deep.equal(buf.subarray(128));

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(129);
            expect(res[0]).to.equal(0);
            expect(res).to.deep.equal(buf.subarray(127));
          })

          it("should pad an oversized block with leading zeroes and highest bit unset", function() {
            var acc = new Accumulator();
            var pad = new I2OSPPadder(acc, 128);

            var buf = new Uint8Array(256);
            random.nextBytes(buf.subarray(128));
            buf[128] = (buf[128] & 127) | 64;

            var res = pad.push(buf, true);

            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.be.equal(128);
            expect(res).to.be.deep.equal(buf.subarray(128));

            /* Unpad and check */
            res = new OS2IPUnpadder(acc, 128).push(res, true);
            expect(res).to.be.instanceof(Uint8Array);
            expect(res.length).to.equal(128);
            expect(res).to.deep.equal(buf.subarray(128));
          })

          /* ---------------------------------------------------------------- */

          it("should not pad an oversized block", function() {
            expect(function() {
              var acc = new Accumulator();
              var pad = new I2OSPPadder(acc, 128);
              var buf = random.nextBytes(129);
              buf[0] = 1; // just one bit!

              pad.push(buf);
            }).to.throw("Message too big (max 128 bytes)");
          })

        });
      });
    }
  }
);
