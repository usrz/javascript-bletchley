'use strict';

Esquire.define('bletchley/blocks/Forwarder', ['bletchley/blocks/Receiver'], function(Receiver) {

  function Forwarder(receiver) {
    if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver: " + receiver);

    Object.defineProperty(this, "$next", {
      configurable: false,
      enumerable: false,
      value: function(message, last) {
        return receiver.push(message, last);
      }
    });
  }

  Forwarder.prototype = Object.create(Receiver.prototype);
  Forwarder.prototype.constructor = Forwarder;

  return Forwarder;

});
