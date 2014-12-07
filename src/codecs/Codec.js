'use strict';

Esquire.define('bletchley/codecs/Codec', ['bletchley/utils/Helper',
                                          'bletchley/utils/arrays'],
  function(Helper, arrays) {

    function Codec(name, encode, decode) {
      Helper.call(this, name);
    };

    Codec.prototype = Object.create(Helper.prototype);
    Codec.prototype.constructor = Codec;

    return Codec;

  }
);
