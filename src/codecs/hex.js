Esquire.define('bletchley/codecs/hex', ["bletchley/codecs/Codec"], function(Codec) {

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

    var array = new ArrayBuffer(string.length / 2);
    var view = new Uint8Array(array);
    for (var i = 0; i < view.length; i++) {
      var hex = string.substr(0, 2);
      if (hex in hexToBytes) {
        view[i] = hexToBytes[hex];
      } else {
        throw new Error("Invalid hex sequence '" + hex + "' at offset " + (i * 2));
      }
      string = string.substr(2);
    }
    return view;
  }

  return new Codec("HEX", encode, decode);

});