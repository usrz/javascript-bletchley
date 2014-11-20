'use strict';

Esquire.define('bletchley/codecs/utf8', ["bletchley/codecs/Codec",
                                         "bletchley/utils/arrays",
                                         "$global/TextEncoder",
                                         "$global/TextDecoder",
                                         "$global/Buffer",
                                         "$global/encodeURIComponent",
                                         "$global/decodeURIComponent",
                                         "$global/unescape",
                                         "$global/escape" ],

  function(Codec, arrays, TextEncoder, TextDecoder, Buffer, encodeURIComponent, decodeURIComponent, unescape, escape) {

    var encode;
    var decode;

    if (TextDecoder) {
      encode = function(array) {
        return new TextDecoder("UTF8").decode(array)
      }
    } else if (decodeURIComponent && escape) {
      encode = function(array) {
        var raw = arrays.toUint8String(array);
        return decodeURIComponent(escape(raw));
      }
    } else if (Buffer) {
      encode = function(array) {
        return new Buffer(array).toString('utf8');
      }
    }

    if (TextEncoder) {
      decode = function(string) {
        return new TextEncoder("UTF8").encode(string);
      }
    } else if (unescape && decodeURIComponent) {
      decode = function(string) {
        var raw = unescape(encodeURIComponent(string));
        return arrays.fromUint8String(raw);
      }
    } else if (Buffer) {
      decode = function(string) {
        var buffer = new Buffer(string, 'utf8');
        return new Uint8Array(buffer);
      }
    }

    if (encode && decode) {
      return new Codec("UTF-8", encode, decode);
    } else {
      throw new Error("No native support for UTF-8");
    }
  }
);
