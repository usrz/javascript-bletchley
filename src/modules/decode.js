'use strict';

define(['modules/util/uint8'], function(uint8) {

  /* Initialize our tables for HEX encoding */
  var hexToBytes = {};
  for (var i = 0; i < 256; i ++) {
    var s = ("0" + new Number(i).toString(16)).slice(-2);
    hexToBytes[s.toUpperCase()] = i;
    hexToBytes[s.toLowerCase()] = i;
  }

  /* UTF8 decoding */
  function decodeUTF8(data) {
    if (window.TextEncoder) {
      return new TextEncoder("UTF8").encode(data);
    } else {
      return uint8.fromUint8String(unescape(encodeURIComponent(data)));
    }
  }

  /* HEX decoding */
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

  /* BASE64 decoding */
  function decodeBASE64(data) {
    return uint8.fromUint8String(atob(data));
  }

  /* AngularJS '_decode' service */
  return function(module) {

    module.factory('_decode', ['$q', '_defer', function($q, _defer) {

      return function(algorithm, data) {
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
      }

    }]);
  }
});

