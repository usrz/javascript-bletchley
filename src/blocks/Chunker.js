'use strict';

Esquire.define('bletchley/blocks/Chunker', [ 'bletchley/blocks/Forwarder' ],

  function(Forwarder) {

    function Chunker(receiver, blockSize) {
      if ((typeof(blockSize) !== 'number') || (blockSize < 1))
        throw new Error("Block size must be at least 1 bytes");

      var buff = new Uint8Array(blockSize);
      var pos = 0;
      var len = 0;

      this.push = function(data, last) {

        var dpos = 0;
        var result = null;

        /* Copy in chunks to our block */
        while (dpos < data.length) {
          /* Bytes available in the block */
          var blen = blockSize - pos;
          /* Bytes available in the message */
          var dlen = data.length - dpos;
          /* Copy up to blockSize bytes */
          var clen = blen < dlen ? blen : dlen;
          /* End message offset after copy */
          var dend = dpos + clen;

          /* Copy the (part of) message in our block */
          buff.set(data.subarray(dpos, dend), pos);

          /* Update length and positions */
          len += clen;
          pos += clen;
          dpos = dend;

          /* If we have a full block, compute it */
          if (pos >= blockSize) {
            var l = last && (dpos >= data.length);
            result = this.$next(buff, l);
            pos = 0;
          }
        }

        /* If this is the last message, flush whatever we have */
        if (last && (pos > 0 || len == 0)) {
          result = this.$next(buff.subarray(0, pos), true);
        }

        return result;
      }

      /* Call super constructor */
      Forwarder.call(this, receiver);
    }

    /* Chunker extends Forwarder */
    return Forwarder.$super(Chunker);
  }
);
