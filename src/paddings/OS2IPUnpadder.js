'use strict';

Esquire.define('bletchley/paddings/OS2IPUnpadder', ['bletchley/blocks/Forwarder'], function(Forwarder) {

    /* Shared single "zero" */
    var zero = new Uint8Array(1);

    function OS2IPUnpadder(receiver, keySize) {
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
          if (offset == keySize) return this.$next(zero, last);

          /* If the message starts with a zero... */
          if (offset > 0) {
            if ((message[offset] & 128) != 0) {
              /* If the highest bit is 1 leave one zero (non-negative) */
              return this.$next(message.subarray(offset -1), last);
            } else {
              /* If the highest bit is 0 just trim at length */
              return this.$next(message.subarray(offset), last);
            }
          }

          /* The offset is zero, we MIGHT have to copy */
          if ((message[0] & 128) != 0) {
            buffer.set(message, 1);
            return this.$next(buffer, last);
          }

          /* No chance it can be negative... */
          return this.$next(message, last);
        }}
      });

      Forwarder.call(this, receiver);
    }

    OS2IPUnpadder.prototype = Object.create(Forwarder.prototype);
    OS2IPUnpadder.prototype.constructor = OS2IPUnpadder;

    return OS2IPUnpadder;

  }
);
