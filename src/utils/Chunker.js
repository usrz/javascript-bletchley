'use strict';

Esquire.define('bletchley/utils/Chunker', [ 'bletchley/utils/arrays' ], function(arrays) {

  function Chunker(size, callback) {
    if ((typeof(size) !== 'number') || (size < 1)) {
      throw new Error("Size must be a positive number");
    }

    /* Check callbacks */
    if (typeof(callback) !== 'function') {
      throw new Error("Callback must be a function");
    }

    /* Internal variables */
    var zeroes = new Uint8Array(size);
    var block = new Uint8Array(size);
    var bview = new DataView(block.buffer);
    var len = 0;
    var pos = 0;

    Object.defineProperties(this, {
      "push": { enumerable: true, configurable: false, value: function(data) {

        /* Normalize the data, must be a Uint8Array */
        data = arrays.toUint8Array(data);
        var dpos = 0;

        /* Copy in chunks to our block */
        while (dpos < data.length) {

          /* If we need to process this block... */
          if (pos == size) {
            callback(block, size, len, false, bview);
            pos = 0;
          }

          /* Bytes available in the block */
          var blen = size - pos;
          /* Bytes available in the data */
          var dlen = data.length - dpos;
          /* Copy up to "size" bytes */
          var clen = blen < dlen ? blen : dlen;
          /* Update data offset after copy */
          var dend = dpos + clen;

          /* Copy the (partial) data in our block */
          block.set(data.subarray(dpos, dend), pos);

          /* Update length and positions */
          len += clen;
          pos += clen;
          dpos = dend;
        }
      }},

      "flush": { enumerable: true, configurable: false, value: function() {
        block.set(zeroes.subarray(pos), pos);
        callback(block, pos, len, true, bview);
        len = 0;
        pos = 0;
      }}

    });
  }

  return Chunker;

});
