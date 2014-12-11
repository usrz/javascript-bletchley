'use strict';

Esquire.define('bletchley/paddings/PKCS1Unpadder', ['bletchley/blocks/Receiver'], function(Receiver) {

    function PKCS1Unpadder(receiver, keySize) {
      if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver");
      if ((typeof(keySize) !== 'number') || (keySize < 12))
        throw new Error("Key size must be at least 12 bytes");

      Object.defineProperties(this, {
        "push": { enumerable: true, configurable: false, value: function(message, last) {
          if (message.length != keySize) throw new Error("Message must have the same length as key");
          if (message[0] != 0) throw new Error("Invalid message leading zero");
          if (message[1] != 2) throw new Error("Invalid message block type");
          for (var i = 2; i < message.length; i ++) {
            if (message[i] == 0) {
              return receiver.push(message.subarray(i + 1), last);
            }
          }
          throw new Error("Message delimiter not found");
        }}
      });

      Receiver.call(this);
    }

    PKCS1Unpadder.prototype = Object.create(Receiver.prototype);
    PKCS1Unpadder.prototype.constructor = PKCS1Unpadder;

    return PKCS1Unpadder;
  }
);
