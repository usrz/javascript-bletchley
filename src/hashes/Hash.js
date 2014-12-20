'use strict';

Esquire.define('bletchley/hashes/Hash', [ 'bletchley/utils/classes',
                                          'bletchley/utils/arrays' ],

  function(classes, arrays) {

    function Hash(blockSize, digestSize) {

      var buff = new Uint8Array(blockSize);
      var view = new DataView(buff.buffer);
      var pos = 0;
      var len = 0;

      Object.defineProperties(this, {
        "blockSize":  { enumerable: true, configurable: false, value: blockSize },
        "digestSize": { enumerable: true, configurable: false, value: digestSize },

        "update": { enumerable: true, configurable: true, value: function(message) {

          /* Normalize and process the message*/
          message = arrays.toUint8Array(message);
          var mpos = 0;

          /* Copy in chunks to our block */
          while (mpos < message.length) {
            /* Bytes available in the block */
            var blen = blockSize - pos;
            /* Bytes available in the message */
            var mlen = message.length - mpos;
            /* Copy up to 64 bytes (nothing more) */
            var clen = blen < mlen ? blen : mlen;
            /* End message offset after copy */
            var mend = mpos + clen;

            /* Copy the (part of) message in our block */
            buff.set(message.subarray(mpos, mend), pos);

            /* Update length and positions */
            len += clen;
            pos += clen;
            mpos = mend;

            /* If we have a full block, compute it */
            if (pos >= blockSize) {
              this.$compute(view);
              pos = 0;
            }
          }

          /* Return ourselves */
          return this;

        }},

        "reset": { enumerable: true, configurable: true, value: function(message) {
          this.$reset();
          len = 0;
          pos = 0;
          return this;
        }},

        "digest": { enumerable: true, configurable: true, value: function(output) {

          /* No output? Create a new buffer */
          if (! output) {
            output = new Uint8Array(this.digestSize);
          } else if (!(output instanceof Uint8Array)) {
            throw new Error("Output must be a Uint8Array");
          } else if (output.length < this.digestSize) {
            throw new Error("Required at least " + this.digestSize + " for output");
          }

          /* Flush, get the current hash, reset, and return */
          this.$flush(buff, pos, len, view);
          this.$hash(new DataView(output.buffer, output.byteOffset, output.byteLength));
          return output;

        }}
      });

      /* Lock our functions */
      classes.lock(this);
    };

    Hash.prototype.hash = function(message, output) {
      return this.reset().update(message).digest(output);
    }

    Hash.prototype.$reset   = function() { throw new Error("Hash $reset not implemented") }
    Hash.prototype.$compute = function() { throw new Error("Hash $compute not implemented") }
    Hash.prototype.$flush   = function() { throw new Error("Hash $flush not implemented") }
    Hash.prototype.$hash    = function() { throw new Error("Hash $reset not implemented") }

    /* Hash extends Object */
    return classes.extend(Hash);

  }
);
