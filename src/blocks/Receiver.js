'use strict';

Esquire.define('bletchley/blocks/Receiver', function() {

  function Receiver() { }

  Receiver.prototype.push = function(buffer, last) {
    throw new Error("Not implelemented");
  }

  return Receiver;

});
