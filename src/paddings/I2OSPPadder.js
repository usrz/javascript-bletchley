'use strict';

Esquire.define('bletchley/paddings/I2OSPPadder', ['bletchley/blocks/Forwarder'], function(Forwarder) {

    function I2OSPPadder(receiver, keySize) {
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < 32) throw new Error("Key size must be at least 32 (256 bit)");

      /* Zeroes and buffer */
      var zeroes = new Uint8Array(keySize);
      var buffer = new Uint8Array(keySize);

      Object.defineProperties(this, {
        "push": { enumerable: true, configurable: false, value: function(message, last) {

          /* Accept messages bigger than keySize if prepended by zeroes */
          if (message.length > keySize) {
            var offset = message.length - keySize;
            for (var i = 0; i < offset; i ++) {
              if (message[i] != 0) throw new Error("Message too big (max " + keySize + " bytes)");
            }
            return this.$next(message.subarray(offset), last);
          }

          /* Precisely correct size, push unchanged */
          if (message.length == keySize) return this.$next(message, last);

          /* Message must be padded with zeroes */
          var offset = keySize - message.length;
          buffer.set(zeroes.subarray(0, offset));
          buffer.set(message, offset);
          return this.$next(buffer, last);

        }}
      });

      Forwarder.call(this, receiver);
    }

    I2OSPPadder.prototype = Object.create(Forwarder.prototype);
    I2OSPPadder.prototype.constructor = I2OSPPadder;

    return I2OSPPadder;

  }
);
