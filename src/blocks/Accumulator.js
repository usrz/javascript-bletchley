'use strict';

Esquire.define('bletchley/blocks/Accumulator', ['bletchley/blocks/Receiver'], function(Receiver) {

  function Accumulator() {
    /* Our array of buffers */
    var buffers = new Array();

    this.push = function(buffer, last) {
      /* No need to clone */
      if (last) buffers.push(buffer);
      else {
        /* Clone the buffer, and remember it */
        var clone = new Uint8Array(buffer.length);
        clone.set(buffer);
        buffers.push(clone);
      }

      /* Nothing to do if not last */
      if (! last) return;

      /* Calculate the whole length */
      var length = 0;
      for (var i in buffers) length += buffers[i].length;

      /* Create a result buffer */
      var result = new Uint8Array(length);

      /* Copy all our buffers */
      var offset = 0;
      for (var i in buffers) {
        var buffer = buffers[i];
        result.set(buffer, offset);
        offset += buffer.length;
      }

      /* Clean up and return */
      buffers = new Array();
      return result;
    }
  }

  Accumulator.prototype = Object.create(Receiver.prototype);
  Accumulator.prototype.constructor = Accumulator;

  return Accumulator;

});
