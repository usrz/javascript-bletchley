'use strict';

Esquire.define('test/blocks', [ 'bletchley/utils/Random',
                                'bletchley/codecs/Codecs',
                                'bletchley/blocks/Accumulator',
                                'bletchley/blocks/Chunker' ],
  function(Random, Codecs, Accumulator, Chunker) {

    var random = new Random();
    var codecs = new Codecs();

    /* Forward and keep track of calls */
    function Forwarder(receiver) {
      this.calls = [];
      this.push = function(data, last) {
        try {
          return receiver.push(data, last);
        } finally {
          this.calls.push({"length": data.length, "last": last});
        }
      }
    };

    /* Send random data */
    function pushRandom(receiver, callback) {
      var array = random.nextBytes(253);
      var beg = 0;
      var end = 0;

      /* Empty array to start */
      receiver.push(new Uint8Array());

      /* Various length: 0-1, 1-3, 3-6, ... */
      for (var x = 0; x < 22; x ++) {
        beg = end;
        end = beg + x + 1;
        var sub = array.subarray(beg, end);

        /* Last check and return */
        if (x < 21) {
          var result = receiver.push(sub, false);
          expect(result, "at " + (x+1) + " of 22").to.not.exist;
        } else {
          var result = receiver.push(sub, true);
          expect(result, "at last iteration").to.be.instanceof(Uint8Array);
          if (callback) callback(array, result);
          return result;
        }
      }
    }

    /* ====================================================================== */

    return function() {
      describe("Blocks", function() {

        it("should accumulate", function() {
          var result = pushRandom(new Accumulator, function(expected, result) {

            /* Expected result is a Uint8Array, 253 bytes */
            expect(result).to.be.instanceof(Uint8Array);
            expect(result.length).to.be.equal(253);
            expect(result).to.deep.equal(expected);

          });
        });

        it("should chunk and accumulate", function() {
          var accumulator = new Accumulator();
          var forwarder   = new Forwarder(accumulator);
          var chunker     = new Chunker(64, forwarder);

          pushRandom(chunker, function(expected, result) {

            /* Expected result is a Uint8Array, 253 bytes */
            expect(result).to.be.instanceof(Uint8Array);
            expect(result.length).to.be.equal(253);
            expect(result).to.deep.equal(expected);

            expect(forwarder.calls).to.deep.equal([
              {length: 64, last: false},
              {length: 64, last: false},
              {length: 64, last: false},
              {length: 61, last: true}
            ]);

          });
        });

        it("should chunk and accumulate at block boundaries", function() {
          var length = Math.floor(Math.random() * 256) + 128;

          var accumulator = new Accumulator();
          var forwarder   = new Forwarder(accumulator);
          var chunker     = new Chunker(length, forwarder);

          var expected = random.nextBytes(length);

          var result = chunker.push(expected, true);

          /* Expected result is a Uint8Array, "length" bytes */
          expect(result).to.be.instanceof(Uint8Array);
          expect(result.length).to.be.equal(length);
          expect(result).to.deep.equal(expected);
          expect(forwarder.calls).to.deep.equal([
            {length: length, last: true}
          ]);

          /* Reset calls, new array of 2x size */
          forwarder.calls.splice(0);
          expected = random.nextBytes(length * 2);

          result = chunker.push(expected.subarray(0, length), false);
          expect(result).to.not.exist;

          result = chunker.push(expected.subarray(length), true);

          expect(result).to.be.instanceof(Uint8Array);
          expect(result.length).to.be.equal(length * 2);
          expect(result).to.deep.equal(expected);
          expect(forwarder.calls).to.deep.equal([
            {length: length, last: false},
            {length: length, last: true}
          ]);

        });

      });
    }
  }
);

