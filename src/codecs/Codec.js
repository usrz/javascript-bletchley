'use strict';

Esquire.define('bletchley/codecs/Codec', ['bletchley/utils/helpers',
                                          'bletchley/utils/extend',
                                          'bletchley/utils/arrays'],
  function(helpers, extend, arrays) {

    return extend(function(name, encode, decode) {

      this.encode = function(array) {
        array = arrays.toUint8Array(array);
        if (array.byteLength == 0) return '';
        return encode(array);
      }

      this.decode = function(string) {
        if (typeof(string) === 'string') {
          return string.length == 0 ? new ArrayBuffer(0) : decode(string);
        } else {
          throw new Error("Unable to decode " + typeof(string) + ": " + string);
        }
      }

      helpers.Helper.call(this, name);
    }, helpers.Helper, "Codec");

  }
);
