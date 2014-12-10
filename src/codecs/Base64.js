'use strict';

Esquire.define('bletchley/codecs/Base64', [ "bletchley/codecs/Codec",
                                            "bletchley/utils/arrays",
                                            "$global/Buffer",
                                            "$global/btoa",
                                            "$global/atob" ],
  function(Codec, arrays, Buffer, btoa, atob) {

    /* ====================================================================== */
    /* Javascript implementation of BASE-64                                   */
    /* ====================================================================== */

    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    var values = {};
    for (var x = 0; x < alphabet.length; x++) values[alphabet[x]] = x;
    Object.freeze(values);

    function encode(array) {

      /* Input length and number of full characters */
      var length = array.length;
      var fullchars = (Math.floor(length / 3)) * 4;
      var result;

      /*
       * The final character array's length will be either full characters
       * (if the bytes are multple of 3) or the full characters plus two or
       * three depending whether we have 1 or 2 bytes left to encode.
       * As we're in a switch statement, also calculate the last few chars.
       */
      switch (length % 3) {
        case 1:
          result = new Array(fullchars + 4);
          result[fullchars    ] = alphabet[(array[length - 1] >> 2) & 0x03f];
          result[fullchars + 1] = alphabet[(array[length - 1] << 4) & 0x030];
          result[fullchars + 2] = '=';
          result[fullchars + 3] = '=';
          break;

        case 2:
          result = new Array(fullchars + 4);
          result[fullchars    ] = alphabet[ (array[length - 2] >> 2) & 0x03f];
          result[fullchars + 1] = alphabet[((array[length - 2] << 4) & 0x030) |
                                           ((array[length - 1] >> 4) & 0x00f)];
          result[fullchars + 2] = alphabet[ (array[length - 1] << 2) & 0x03c];
          result[fullchars + 3] = '=';
          break;

        default:
          result = new Array(fullchars);
      }

      /*
       * Start the main loop, encoding all bytes in groups of 3, each chunk
       * producing four characters.
       */
      var pos = 0, rpos = 0;
      while (rpos < fullchars) {
          result[rpos++] = alphabet[ (array[pos]   >> 2) & 0x03f];
          result[rpos++] = alphabet[((array[pos++] << 4) & 0x030) |
                                    ((array[pos]   >> 4) & 0x00f)];
          result[rpos++] = alphabet[((array[pos++] << 2) & 0x03c) |
                                    ((array[pos]   >> 6) & 0x003)];
          result[rpos++] = alphabet[  array[pos++]       & 0x03f];
      }

      /* All done */
      return result.join('');

    }

    function decode(string) {

      /* Trim the end padding */
      while (string[string.length - 1] == '=') {
        string = string.substring(0, string.length - 1);
      }
      var length = string.length;


      /* Figure out how many full chunks of three bytes we can decode */
      var fullbytes = Math.floor(length / 4) * 3;

      /* Allocate some space for the decoded string */
      var result;
      switch (length % 4) {
        case 0:
          result = new Uint8Array(fullbytes);
          break;

        case 2:
          result = new Uint8Array(fullbytes + 1);
          var v1 = values[string[length - 2]];
          var v2 = values[string[length - 1]];
          if (v1 === undefined) throw new Error("Invalid character '" + string[length - 2] + "' in input at position " + (length - 2));
          if (v2 === undefined) throw new Error("Invalid character '" + string[length - 1] + "' in input at position " + (length - 1));
          result[fullbytes] = (((v1 << 2) & 0x0fc) | ((v2 >> 4) & 0x003));
          break;

        case 3:
          result = new Uint8Array(fullbytes + 2);
          var v1 = values[string[length - 3]];
          var v2 = values[string[length - 2]];
          var v3 = values[string[length - 1]];
          if (v1 === undefined) throw new Error("Invalid character '" + string[length - 3] + "' in input at position " + (length - 3));
          if (v2 === undefined) throw new Error("Invalid character '" + string[length - 2] + "' in input at position " + (length - 2));
          if (v3 === undefined) throw new Error("Invalid character '" + string[length - 1] + "' in input at position " + (length - 1));
          result[fullbytes    ] = (((v1 << 2) & 0x0fc) | ((v2 >> 4) & 0x003));
          result[fullbytes + 1] = (((v2 << 4) & 0x0f0) | ((v3 >> 2) & 0x00f));
          break;

        default:
          throw new Error("Invalid input length");
      }

      var resultpos = 0;
      var datapos = 0;
      while (resultpos < fullbytes) {
          var v1 = values[string[datapos++]];
          var v2 = values[string[datapos++]];
          var v3 = values[string[datapos++]];
          var v4 = values[string[datapos++]];
          if (v1 === undefined) throw new Error("Invalid character '" + string[datapos - 3] + "' in input at position " + (datapos - 3));
          if (v2 === undefined) throw new Error("Invalid character '" + string[datapos - 2] + "' in input at position " + (datapos - 2));
          if (v3 === undefined) throw new Error("Invalid character '" + string[datapos - 1] + "' in input at position " + (datapos - 1));
          if (v4 === undefined) throw new Error("Invalid character '" + string[datapos - 1] + "' in input at position " + (datapos - 1));
          result[resultpos++] = (((v1 << 2) & 0x0fc) | ((v2 >> 4) & 0x003));
          result[resultpos++] = (((v2 << 4) & 0x0f0) | ((v3 >> 2) & 0x00f));
          result[resultpos++] = (((v3 << 6) & 0x0c0) | ((v4     ) & 0x03f));
      }

      return result;
    };

    /* ====================================================================== */
    /* Attempt to override our JS-based functions with native code            */
    /* ====================================================================== */

    if (btoa && atob) {
      encode = function(array) {
        return btoa(arrays.toUint8String(array))
      };

      decode = function(string) {
        return arrays.fromUint8String(atob(string))
      };
    } else if (Buffer) {
      encode = function(array)  {
        return new Buffer(array).toString('base64');
      }

      decode = function(string) {
        var buffer = new Buffer(string, 'base64');
        return new Uint8Array(buffer);
      }
    } else {
      console.warn("Native BASE64 support not available");
    }

    /* ====================================================================== */

    function Base64() {
      Codec.call(this, "BASE-64");
    }

    Base64.prototype = Object.create(Codec.prototype);
    Base64.prototype.constructor = Base64;

    Base64.prototype.encode = function(array) {
      array = arrays.toUint8Array(array);
      if (array.byteLength == 0) return '';
      return encode(array);
    }

    Base64.prototype.decode = function(string) {
      if (typeof(string) !== 'string') throw new Error("Can only decode strings");
      if (string.length == 0) return new ArrayBuffer(0);
      return decode(string.replace(/\s*/g, ''));
    }

    return Base64;
  }
);
