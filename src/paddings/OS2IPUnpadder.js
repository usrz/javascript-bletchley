'use strict';

Esquire.define('bletchley/paddings/OS2IPUnpadder', ['bletchley/blocks/Receiver'], function(Receiver) {

    /* Shared single "zero" */
    var zero = new Uint8Array(1);

    function OS2IPUnpadder(receiver, keySize) {
      if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver");
      if ((typeof(keySize) !== 'number') || (keySize < 1))
        throw new Error("Key size must be at least 1 bytes");

      /* Buffer with extra leading zero */
      var buffer = new Uint8Array(keySize + 1);

      Object.defineProperties(this, {
        "push": { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length != keySize) throw new Error("Message must have the same length as key");

          /* Find the first non-zero byte */
          var offset = 0;
          while ((offset < keySize) && (message[offset] == 0)) {
            offset++
          }

          /* All leding zeroes? */
          if (offset == keySize) return receiver.push(zero, last);

          /* If the message starts with a zero... */
          if (offset > 0) {
            if ((message[offset] & 128) != 0) {
              /* If the highest bit is 1 leave one zero (non-negative) */
              return receiver.push(message.subarray(offset -1), last);
            } else {
              /* If the highest bit is 0 just trim at length */
              return receiver.push(message.subarray(offset), last);
            }
          }

          /* The offset is zero, we MIGHT have to copy */
          if ((message[0] & 128) != 0) {
            buffer.set(message, 1);
            return receiver.push(buffer, last);
          }

          /* No chance it can be negative... */
          return receiver.push(message, last);
        }}
      });

      Receiver.call(this);
    }

    OS2IPUnpadder.prototype = Object.create(Receiver.prototype);
    OS2IPUnpadder.prototype.constructor = OS2IPUnpadder;

    return OS2IPUnpadder;

  }
);
