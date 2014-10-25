'use strict';

define(['modules/util/uint8'], function(uint8) {

  /* Initialize our tables for HEX encoding */
  var hex_table = new Array(256);
  for (var i = 0; i < 256; i ++) {
    var s = ("0" + new Number(i).toString(16)).slice(-2);
    hex_table[i] = s;
  }

  /* UTF8 encoding */
  function encodeUTF8(data) {
    if (window.TextDecoder) {
      var array = uint8.toUint8Array(data);
      return new TextDecoder("UTF8").decode(new Uint8Array(array));
    } else {
      var raw = uint8.toUint8String(data);
      return decodeURIComponent(escape(raw));
    }
  }

  /* HEX encoding */
  function encodeHEX(data) {
    var array = uint8.toUint8Array(data);
    var hex = '';
    for (var i = 0; i < array.length; i++) {
      hex += hex_table[array[i]];
    }
    return hex;
  }

  /* BASE64 encoding */
  function encodeBASE64(data) {
    var array = uint8.toUint8Array(data);
    var raw = uint8.toUint8String(array);
    return btoa(raw);
  }

  /* AngularJS '_encode' service */
  return function(module) {

    module.factory('_encode', ['$q', '_defer', function($q, _defer) {

      return function(algorithm, data) {
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
      }

    }]);
  }
});

