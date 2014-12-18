'use strict';

Esquire.define('bletchley/paddings/Padding', [ 'bletchley/utils/Helper' ], function(Helper) {

    function Padding(name) {
      Helper.call(this, name);
    };

    Padding.prototype = Object.create(Helper.prototype);
    Padding.prototype.constructor = Padding;

    Padding.prototype.pad   = function(receiver, random, keySize, options) { throw new Error("Padding not implemented") }
    Padding.prototype.unpad = function(receiver, random, keySize, options) { throw new Error("Padding not implemented") }

    return Padding;

  }
);
