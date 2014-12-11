'use strict';

Esquire.define('bletchley/paddings/I2OSPPadder', ['bletchley/blocks/Receiver'], function(Receiver) {

    function I2OSPPadder(receiver, keySize) {
      if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver");
      if ((typeof(keySize) !== 'number') || (keySize < 1))
        throw new Error("Key size must be at least 1 bytes");

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
            return receiver.push(message.subarray(offset), last);
          }

          /* Precisely correct size, push unchanged */
          if (message.length == keySize) return receiver.push(message, last);

          /* Message must be padded with zeroes */
          var offset = keySize - message.length;
          buffer.set(zeroes.subarray(0, offset));
          buffer.set(message, offset);
          return receiver.push(buffer, last);

        }}
      });

      Receiver.call(this);
    }

    I2OSPPadder.prototype = Object.create(Receiver.prototype);
    I2OSPPadder.prototype.constructor = I2OSPPadder;

    return I2OSPPadder;

  }
);
