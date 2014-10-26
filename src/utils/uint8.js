'use strict';

define([], function() {

  /**
   * Convert a string, ArrayBuffer, ArrayBufferView or plain array into a valid
   * Uint8Array.
   *
   * If the specified data is a string, it will be decoded into a UTF-8 byte
   * sequence, while if the specified data is an array each of its element
   * will be validated to be a number between 0 and 256.
   */
  function toUint8Array(data) {
    if (data == null) throw new Error("No data supplied");

    /* Basic array bufffers / array buffer views / plain arrays */
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (data.buffer instanceof ArrayBuffer) return new Uint8Array(data.buffer);
    if (Array.isArray(data)) return new Uint8Array(data);

    /* String, decode as UTF8 */
    if (typeof(data) == 'string') {
      if (window.TextEncoder) {
        return new TextEncoder("UTF8").encode(data);
      } else {
        return fromUint8String(unescape(encodeURIComponent(data)));
      }
    }

    /* Fail miserably */
    throw new Error("Supplied data is not a string, ArrayBuffer, ArrayBufferView or Array: " + typeof(data));
  }

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

  /**
   * Fill the specified Uint8Array with the specified byte
   */
  function concatUint8Arrays() {
    var length = 0;
    var arrays = [];
    for (var i = 0; i < arguments.length; i ++) {
      var current = toUint8Array(arguments[i]);
      length += current.length;
      arrays.push(current);
    }

    var offset = 0;
    var result = new Uint8Array(length);
    for (var i = 0; i < arrays.length; i ++) {
      result.set(arrays[i], offset);
      offset += arrays[i].length;
    }

    return result;
  }

  /**
   * Create a new Uint8Array of the specified size, optionally filling it
   * with the specified byte (repeated for the length of the array)
   */
  function createUint8Array(size, byte) {
    var array = new Uint8Array(size);
    if (byte) return fillUint8Array(array, byte);
    return array;
  }

  /**
   * Fill the specified Uint8Array with the specified byte
   */
  function fillUint8Array(array, byte) {
    array = toUint8Array(array);
    for (var i = 0; i < array.length; i ++) {
      array[i] = byte;
    }
    return array;
  }

  /**
   * A utility method to print an array as HEX values.
   */
  function debugUint8Array(array) {
    array = toUint8Array(array);
    var string = '{ length: ' + array.length + ', data: "';
    for (var i = 0; i < array.length; i ++) {
      if (array[i] < 16) string += '0';
      string += Number(array[i]).toString(16);
    }
    return string + '" }';
  }

  /* Export our three functions */
  return {
    toUint8Array: toUint8Array,
    toUint8String: toUint8String,
    fromUint8String: fromUint8String,
    concatUint8Arrays: concatUint8Arrays,
    createUint8Array: createUint8Array,
    fillUint8Array: fillUint8Array,
    debugUint8Array: debugUint8Array
  };

});
