'use strict';

Esquire.define('bletchley/codecs/Codec', ['bletchley/utils/Helper',
                                          'bletchley/utils/arrays'],
  function(Helper, arrays) {

    function Codec(name, encode, decode) {

      Object.defineProperties(this, {

        "encode": { configurable: false, enumerable: true, value: function(array) {
          array = arrays.toUint8Array(array);
          if (array.byteLength == 0) return '';
          return encode(array);
        }},

        "decode": { configurable: false, enumerable: true, value: function(string) {
          if (typeof(string) === 'string') {
            return string.length == 0 ? new ArrayBuffer(0) : decode(string);
          } else {
            throw new Error("Unable to decode " + typeof(string) + ": " + string);
          }
        }}

      });

      Helper.call(this, name);
    };

    Codec.prototype = Object.create(Helper.prototype);
    Codec.prototype.constructor = Codec;

    return Codec;

  }
);
