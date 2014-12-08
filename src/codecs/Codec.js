'use strict';

Esquire.define('bletchley/codecs/Codec', ['bletchley/utils/Helper',
                                          'bletchley/utils/arrays'],
  function(Helper, arrays) {

    function Codec(name) {
      Helper.call(this, name);
    };

    Codec.prototype = Object.create(Helper.prototype);
    Codec.prototype.constructor = Codec;

    Codec.prototype.encode = function() { throw new Error("Codec 'encode' not implemented") }
    Codec.prototype.decode = function() { throw new Error("Codec 'decode' not implemented") }

    return Codec;

  }
);
