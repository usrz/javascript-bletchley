'use strict';

Esquire.define('bletchley/paddings/Padding', [ 'bletchley/utils/classes' ],

  function(classes) {

    function Padding(name) {
      classes.lock(this);
    };

    Padding.prototype.pad   = function(receiver, random, keySize, options) { throw new Error("Padding not implemented") }
    Padding.prototype.unpad = function(receiver, random, keySize, options) { throw new Error("Padding not implemented") }

    return classes.extend(Padding);

  }
);
