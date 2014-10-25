'use strict';

(function() {

  /* Initialize our tables for HEX encoding/decoding */
  var hexToBytes = {};
  var bytesencodeHEX = new Array(256);
  for (var i = 0; i < 256; i ++) {
    var s = ("0" + new Number(i).toString(16)).slice(-2);
    hexToBytes[s.toUpperCase()] = i;
    hexToBytes[s.toLowerCase()] = i;
    bytesencodeHEX[i] = s;
  }

  /* ======================================================================== */

  /**
   * Convert a string, ArrayBuffer, ArrayBufferView or plain array into a valid
   * Uint8Array.
   *
   * If the specified data is a string, it will be decoded into a UTF-8 byte
   * sequence, while if the specified data is an array each of its element
   * will be validated to be a number between 0 and 256.
   */
  function toUint8Array(data) {

    /* Basic array bufffers / array buffer views / plain arrays */
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (data.buffer instanceof ArrayBuffer) return new Uint8Array(data.buffer);
    if (Array.isArray(data)) return new Uint8Array(data);

    /* String, decode as UTF8 */
    if (typeof(data) == 'string') return decodeUTF8(data);

    /* Fail miserably */
    throw new Error("Supplied data is not a string, ArrayBuffer, ArrayBufferView or Array: " + typeof(data));
  }

  /* ======================================================================== */

  /**
   * Silly function to convert an Uint8Array as a sequence of bytes, but
   * wrapped in a "string", so that BASE64 and UTF8 encoding can be done
   * using native helpers.
   */
  function toUint8String(data) {
    var array = toUint8Array(data);
    var raw = new Array(array.length);
    for (var i = 0; i < array.length; i++) {
      raw[i] = String.fromCharCode(array[i]);
    }
    return raw.join('');
  }

  /**
   * Silly function to convert a sequence of bytes wrapped in a "string"
   * into an Uint8Array, so that BASE64 and UTF8 decoding can be done
   * using native helpers.
   */
  function fromUint8String(data) {
    var array = new ArrayBuffer(data.length);
    var view = new Uint8Array(array);
    for (var i in data) {
      view[i] = data.charCodeAt(i);
    }
    return view;
  }

  /* ======================================================================== */

  function encodeUTF8(data) {
    if (window.TextDecoder) {
      var array = toUint8Array(data);
      return new TextDecoder("UTF8").decode(new Uint8Array(array));
    } else {
      var raw = toUint8String(data);
      return decodeURIComponent(escape(raw));
    }
  }

  function decodeUTF8(data) {
    if (window.TextEncoder) {
      return new TextEncoder("UTF8").encode(data);
    } else {
      return fromUint8String(unescape(encodeURIComponent(data)));
    }
  }

  /* ======================================================================== */

  function encodeHEX(data) {
    var array = toUint8Array(data);
    var hex = '';
    for (var i = 0; i < array.length; i++) {
      hex += bytesencodeHEX[array[i]];
    }
    return hex;
  }

  function decodeHEX(data) {
    if ((data.length % 2) != 0) {
      throw new Error("Supplied data length must be divisible by 2: " + data.length);
    }

    var array = new ArrayBuffer(data.length / 2);
    var view = new Uint8Array(array);
    for (var i = 0; i < view.length; i++) {
      var hex = data.substr(0, 2);
      var number = hexToBytes[hex];
      if (number) {
        view[i] = number;
      } else {
        throw new Error("Invalid hex sequence '" + data.substr(0, 2) + "' at offset " + (i * 2));
      }
      data = data.substr(2);
    }
    return view;
  }

  /* ======================================================================== */

  function encodeBASE64(data) {
    var array = toUint8Array(data);
    var raw = toUint8String(array);
    return btoa(raw);
  }

  function decodeBASE64(data) {
    return fromUint8String(atob(data));
  }

  /* ======================================================================== */

  angular
    .module('UZEncoder', ['UZCrypto'])
    .factory('_encoder', ['$q', '_defer', function($q, _defer) {

      /* Freeze the returned _encoder */
      return Object.freeze({

        /* Our known encoding/decoding algorithms */
        algorithms: Object.freeze([ "UTF8", "HEX", "BASE64" ]),

        /* Conversion to Uint8Array function */
        toUint8Array: function(data) {
          return toUint8Array(data);
        },

        /* Our encode function */
        encode: function(algorithm, data) {
          return _defer(function() {
            return $q.when(data)
              .then(function(data) {
                try {
                  if (!data) throw new Error("No data to encode");

                  switch (algorithm.toUpperCase()) {
                    case "UTF8":   return encodeUTF8(data);
                    case "HEX":    return encodeHEX(data);
                    case "BASE64": return encodeBASE64(data);
                    default: throw new Error("Unsupported encoding algorithm: " + algorithm);
                  }

                } catch(error) {
                  return $q.reject(error);
                }
              });
          });
        },

        /* Our decode function */
        decode: function(algorithm, data) {
          return _defer(function() {
            return $q.when(data)
              .then(function(data) {
                try {
                  if (!data) throw new Error("No data to decode");
                  if (typeof(data) != 'string') throw new Error("Supplied data is not a string: " + typeof(data));


                  switch (algorithm.toUpperCase()) {
                    case "UTF8":   return decodeUTF8(data);
                    case "HEX":    return decodeHEX(data);
                    case "BASE64": return decodeBASE64(data);
                    default: throw new Error("Unsupported decoding algorithm: " + algorithm);
                  }

                } catch(error) {
                  return $q.reject(error);
                }
              });
          });
        },
      });
    }]);
})();

