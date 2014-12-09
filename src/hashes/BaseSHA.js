'use strict';

Esquire.define('bletchley/hashes/BaseSHA', ['bletchley/hashes/Hash'], function(Hash) {

  function BaseSHA(algorithm, buffSize, digestSize, lenBytes) {

    /* Final buff for updates */
    var fbuff = new Uint8Array(buffSize);
    var fview = new DataView(fbuff.buffer);
    var max = buffSize - lenBytes;
    var off = buffSize - 4;

    Object.defineProperty(this, "$flush", {
      configurable: true,
      enumerable: false,
      value: function(buff, pos, len, view) {

        /* Append the fbuff 0x80 to the message */
        buff[pos ++] = 0x80;

        /* Set the length in our fbuff chunk */
        fview.setUint32(off, len * 8, false);

        /* Compute the last chunk, if needed */
        if (pos > max) {
          /* No space for the message length */
          buff.set(fbuff.subarray(0, buffSize - pos), pos);
          this.$compute(view);
          this.$compute(fview);
        } else {
          buff.set(fbuff.subarray(pos), pos);
          this.$compute(view);
        }
      }
    });

    Hash.call(this, algorithm, buffSize, digestSize);
  }

  BaseSHA.prototype = Object.create(Hash.prototype);
  BaseSHA.prototype.constructor = BaseSHA;

  return BaseSHA;

});
