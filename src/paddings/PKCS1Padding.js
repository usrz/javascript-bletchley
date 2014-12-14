Esquire.define('bletchley/paddings/PKCS1Padding', [ 'bletchley/paddings/Padding',
                                                    'bletchley/blocks/Forwarder',
                                                    'bletchley/random/Random' ],
  function(Padding, Forwarder, Random) {

    function PKCS1Padder(receiver, random, keySize) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");
      if (typeof(keySize) !== 'number') throw new Error("Key size must be a number");
      if (keySize < 32) throw new Error("Key size must be at least 32 (256 bit)");

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
          return this.$next(buffer, last);
        }}
      });

      Forwarder.call(this, receiver);
    }

    PKCS1Padder.prototype = Object.create(Forwarder.prototype);
    PKCS1Padder.prototype.constructor = PKCS1Padder;

    /* ====================================================================== */

    function PKCS1Unpadder(receiver, keySize) {
      if ((typeof(keySize) !== 'number') || (keySize < 12))
        throw new Error("Key size must be at least 12 bytes");

      Object.defineProperties(this, {
        "push": { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length != keySize) throw new Error("Message must have the same length as key");
          if (message[0] != 0) throw new Error("Invalid message leading zero");
          if (message[1] != 2) throw new Error("Invalid message block type");
          for (var i = 2; i < message.length; i ++) {
            if (message[i] == 0) {
              return this.$next(message.subarray(i + 1), last);
            }
          }
          throw new Error("Message delimiter not found");
        }}
      });

      Forwarder.call(this, receiver);
    }

    PKCS1Unpadder.prototype = Object.create(Forwarder.prototype);
    PKCS1Unpadder.prototype.constructor = PKCS1Unpadder;

    /* ====================================================================== */

    function PKCS1Padding() {
      Padding.call(this, "PKCS1");
    }

    PKCS1Padding.prototype = Object.create(Padding.prototype);
    PKCS1Padding.prototype.constructor = PKCS1Padding;

    PKCS1Padding.prototype.pad = function(receiver, random, keySize) {
      return new PKCS1Padder(receiver, random, keySize);
    };

    PKCS1Padding.prototype.unpad = function(receiver, random, keySize) {
      return new PKCS1Unpadder(receiver, keySize);
    };

    return PKCS1Padding;

  }
);
