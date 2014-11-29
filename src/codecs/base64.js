'use strict';

Esquire.define('bletchley/codecs/base64', ["bletchley/codecs/Codec",
                                           "bletchley/utils/arrays",
                                           "$global/Buffer",
                                           "$global/btoa",
                                           "$global/atob"],
  function(Codec, arrays, Buffer, btoa, atob) {

    var encode;
    var decode;

    if (btoa && atob) {
      encode = function(array) {
        return btoa(arrays.toUint8String(array))
      };

      decode = function(string) {
        return arrays.fromUint8String(atob(string)).buffer
      };
    } else if (Buffer) {
      encode = function(array)  {
        return new Buffer(array).toString('base64');
      }

      decode = function(string) {
        var buffer = new Buffer(string, 'base64');
        return new Uint8Array(buffer).buffer;
      }
    } else {
      throw new Error("Native BASE64 support not available");
    }

    return new Codec("BASE-64", encode, decode);

  }
);
