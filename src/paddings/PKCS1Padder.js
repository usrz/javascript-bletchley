'use strict';

Esquire.define('bletchley/paddings/PKCS1Padder', ['bletchley/blocks/Receiver', 'bletchley/utils/Random'],
  function(Receiver, Random) {

    function PKCS1Padder(receiver, random, keySize) {
      if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver");
      if (!(random instanceof Random)) throw new Error("Invalid Random");
      if ((typeof(keySize) !== 'number') || (keySize < 12))
        throw new Error("Key size must be at least 12 bytes");

      /* Buffer for whole output (full block size) */
      var buffer = new Uint8Array(keySize);
      buffer[0] = 0; // leading zero
      buffer[1] = 2; // block type 2

      /*
       * Reduce block size by 11 as we pad with:
       * - leading zero
       * - block type 2
       * - ...non-zero random...
       * - zero
       * - ... data...
       */
      var blockSize = keySize - 11;

      Object.defineProperties(this, {
        "blockSize": { enumerable: true, configurable: false, value: blockSize },
        "push":      { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length > blockSize) throw new Error("Message too big (max " + blockSize + " bytes)");

          /* Calculate the offset of the message */
          var pos = keySize - message.length;
          /* Copy the message in our buffer */
          buffer.set(message, pos);
          /* Prepend message with zero */
          buffer[--pos] = 0;
          /* Add randomness */
          random.nextBytes(buffer.subarray(2, pos));
          /* Ensure we have no zeroes in the random */
          for (var i = 2; i < pos; i ++) {
            while (buffer[i] == 0) {
              buffer[i] = random.next();
            }
          }
          /* Push off the padded block */
          return receiver.push(buffer, last);
        }}
      });

      Receiver.call(this);
    }

    PKCS1Padder.prototype = Object.create(Receiver.prototype);
    PKCS1Padder.prototype.constructor = PKCS1Padder;

    return PKCS1Padder;

  }
);
