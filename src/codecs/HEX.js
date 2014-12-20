'use strict';

Esquire.define('bletchley/codecs/HEX', [ "bletchley/codecs/Codec",
                                         "bletchley/utils/arrays" ],
  function(Codec, arrays) {

    /* ====================================================================== */
    /* Javascript implementation of HEX encoding/decoding                     */
    /* ====================================================================== */

    /* Initialize our tables for HEX encoding/decoding */
    var hexTable = new Array(256);
    var hexToBytes = {};

    for (var i = 0; i < 256; i ++) {
      var s = ("0" + new Number(i).toString(16)).slice(-2);
      hexToBytes[s.toUpperCase()] = i;
      hexToBytes[s.toLowerCase()] = i;
      hexTable[i] = s;
    }

    function encode(array) {
      var hex = '';
      for (var i = 0; i < array.length; i++) {
        hex += hexTable[array[i]];
      }
      return hex;
    }

    function decode(string) {
      if ((string.length % 2) != 0) {
        throw new Error("String length must be divisible by 2: " + string.length);
      }

      var array = new Uint8Array(string.length / 2);
      for (var i = 0; i < array.length; i++) {
        var hex = string.substr(0, 2);
        if (hex in hexToBytes) {
          array[i] = hexToBytes[hex];
        } else {
          throw new Error("Invalid hex sequence '" + hex + "' at offset " + (i * 2));
        }
        string = string.substr(2);
      }
      return array;
    }

    /* ====================================================================== */

    function HEX() {
      Codec.call(this);
    }

    HEX.prototype.encode = function(array) {
      array = arrays.toUint8Array(array);
      if (array.byteLength == 0) return '';
      return encode(array);
    }

    HEX.prototype.decode = function(string) {
      if (typeof(string) !== 'string') throw new Error("Can only decode strings");
      if (string.length == 0) return new ArrayBuffer(0);
      return decode(string);
    }

    /* HEX extends Codec */
    return Codec.$super(HEX);

  }
);
