'use strict';

Esquire.define('bletchley/blocks/Forwarder', ['bletchley/blocks/Receiver', 'bletchley/codecs/Codecs'], function(Receiver, Codecs) {

  var codecs = new Codecs();

  function Forwarder(receiver) {
    if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver: " + receiver);

    Object.defineProperty(this, "$next", {
      configurable: false,
      enumerable: false,
      value: function(message, last) {
        // var name = Object.getPrototypeOf(this).constructor.name;
        // console.log(name, message.length, codecs.encode('HEX', message));
        return receiver.push(message, last);
      }
    });
  }

  Forwarder.prototype = Object.create(Receiver.prototype);
  Forwarder.prototype.constructor = Forwarder;

  return Forwarder;

});
