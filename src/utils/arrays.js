'use strict';

Esquire.define('bletchley/utils/arrays', ["$global/TextEncoder",
                                          "$global/Buffer",
                                          "$global/decodeURIComponent",
                                          "$global/unescape" ],
function(TextEncoder, Buffer, decodeURIComponent, unescape) {

  /* String to UTF8 ArrayBuffer */
  var decode = null;
  if (TextEncoder) {
    var encoder = new TextEncoder("UTF-8");
    decode = encoder.encode.bind(encoder);
  } else if (Buffer) {
    decode = function(string) {
      var buffer = new Buffer(string, 'utf8');
      return new Uint8Array(buffer);
    }
  } else if (unescape && decodeURIComponent) {
    decode = function(string) {
      var raw = unescape(encodeURIComponent(string));
      return fromUint8String(raw);
    }
  } else {
    throw new Error("UTF-8 decoding unsupported");
  }

  /**
   * Convert an Array, ArrayBuffer or ArrayBufferView into a valid Uint8Array.
   */
  function toUint8Array(array) {
    /* Strings are simply "decoded" into their UTF8 */
    if (typeof(array) === 'string') return decode(array);

    /* If this is not a string, the "object" must be something */
    if (! array) throw new Error("No array to convert to Uint8Array");

    /* Uint8Array, ArrayBuffer, plain array */
    if (array instanceof Uint8Array) return array;
    if (array instanceof ArrayBuffer) return new Uint8Array(array);
    if (Array.isArray(array)) return new Uint8Array(array);

    /* Fail miserably */
    var type = typeof(array);
    if (type === 'object') type = "Object{" + Object.keys(array) + "}";
    throw new Error("Unable to convert " + type + " to Uint8Array");
  }

  /**
   * Silly function to convert a sequence of bytes wrapped in a "string"
   * into an Uint8Array, so that BASE64 and UTF8 decoding can be done
   * using native helpers.
   */
  function fromUint8String(string) {
    if (typeof(string) === 'string') {
      var array = new ArrayBuffer(string.length);
      var view = new Uint8Array(array);
      for (var i = 0; i < string.length; i++) {
        view[i] = string.charCodeAt(i);
      }
      return view;
    }
    throw new Error("Unable to convert " + typeof(string) + " to Uint8String");
  }

  /**
   * Silly function to convert an Uint8Array as a sequence of bytes, but
   * wrapped in a "string", so that BASE64 and UTF8 encoding can be done
   * using native helpers.
   */
  function toUint8String(array) {
    array = toUint8Array(array);
    var raw = new Array(array.length);
    for (var i = 0; i < array.length; i++) {
      raw[i] = String.fromCharCode(array[i]);
    }
    return raw.join('');
  }

  /**
   * Create a new Uint8Array of the specified size, optionally filling it
   * with the specified byte (repeated for the length of the array)
   */
  function createUint8Array(size, byte) {
    var array = new Uint8Array(size);
    if (byte != undefined) {
      for (var i = 0; i < array.length; i ++) {
        array[i] = byte;
      }
    }
    return array;
  }

  /**
   * Concatenate all Uint8Array specified as parameters.
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

  /* XOR the contents of two arrays */
  function xorUint8Arrays(array1, array2) {

    /* array1 must be shorter than array2 */
    if (array1.length > array2.length) {
      var temp = array2;
      array2 = array1;
      array1 = temp;
    }

    /* New array cloning the longer array */
    var array = new Uint8Array(array2.length);
    array.set(array2, 0);

    /* XOR each element from the short array */
    for (var i = 0; i < array1.length; i ++) {
      array[i] ^= array1[i];
    }

    /* Done! */
    return array;
  }


  return Object.freeze({
    toUint8Array: toUint8Array,
    toUint8String: toUint8String,
    fromUint8String: fromUint8String,
    createUint8Array: createUint8Array,
    concatUint8Arrays: concatUint8Arrays,
    xorUint8Arrays: xorUint8Arrays,
  });

});
