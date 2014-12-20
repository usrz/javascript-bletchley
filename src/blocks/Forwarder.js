'use strict';

Esquire.define('bletchley/blocks/Forwarder', [ 'bletchley/blocks/Receiver' ],

  function(Receiver) {

    function Forwarder(receiver) {
      if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver: " + receiver);

      Object.defineProperty(this, "$next", {
        configurable: false,
        enumerable: false,
        value: function(message, last) {
          return receiver.push(message, last);
        }
      });

      /* Call super constructor */
      Receiver.call(this);
    }

    /* Forwarder extends Receiver */
    return Receiver.$super(Forwarder);
  }
);
