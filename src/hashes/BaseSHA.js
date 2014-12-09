'use strict';

Esquire.define('bletchley/hashes/BaseSHA', ['bletchley/hashes/Hash'], function(Hash) {

  function BaseSHA(algorithm, blockSize, digestSize, lenBytes) {

    /* Final buff for updates */
    var fbuff = new Uint8Array(blockSize);
    var fview = new DataView(fbuff.buffer);
    var max = blockSize - lenBytes;
    var off = blockSize - 4;

    Object.defineProperty(this, "$flush", {
      configurable: true,
      enumerable: false,
      value: function(buff, pos, len, view) {

        /* Set the length in our fbuff chunk */
        fview.setUint32(off, len * 8, false);

        /* Block limit? */
        if (pos == blockSize) {
          this.$compute(view);
          fbuff[0] = 0x80;
          this.$compute(fview);
          return;
        }

        /* Append 0x80 to the message */
        buff[pos ++] = 0x80;
        fbuff[0] = 0;

        if (pos > max) {
          /* No space for the message length */
          this.$compute(view);
          this.$compute(fview);
        } else {
          /* Jut add the length to the block */
          buff.set(fbuff.subarray(pos), pos);
          this.$compute(view);
        }
      }
    });

    Hash.call(this, algorithm, blockSize, digestSize);
  }

  BaseSHA.prototype = Object.create(Hash.prototype);
  BaseSHA.prototype.constructor = BaseSHA;

  return BaseSHA;

});
