'use strict';

Esquire.define('bletchley/utils/arrays', [ "$global/TextEncoder",
                                           "$global/TextDecoder",
                                           "$global/Buffer",
                                           "$global/encodeURIComponent",
                                           "$global/decodeURIComponent",
                                           "$global/unescape",
                                           "$global/escape" ],
function(TextEncoder, TextDecoder, Buffer, encodeURIComponent, decodeURIComponent, unescape, escape) {

  /* A function to get the type name of an object for names */
  function typeName(object) {
    if (object === 'undefined') return 'undefined';
    if (object === 'null') return 'null'

    var type = typeof(object);
    if (type === 'object') {
      var prototype = Object.getPrototypeOf(object);
      if (prototype) {
        if (prototype.name) {
          type += ':' + prototype.name;
        } else if (prototype.constructor && prototype.constructor.name) {
          type += ':' + prototype.constructor.name;
        }
      }
    }
    return type;
  }

  /* ======================================================================== */
  /* UTF-8 string <--> Uint8Array                                             */
  /* ======================================================================== */

  /* String to UTF8 Uint8Array */
  var decodeUTF8 = null;
  if (TextEncoder) {
    var encoder = new TextEncoder("UTF-8");
    decodeUTF8 = encoder.encode.bind(encoder);
  } else if (Buffer) {
    decodeUTF8 = function(string) {
      var buffer = new Buffer(string, 'utf8');
      return new Uint8Array(buffer);
    }
  } else if (unescape && decodeURIComponent) {
    decodeUTF8 = function(string) {
      var raw = unescape(encodeURIComponent(string));
      return fromUint8String(raw);
    }
  } else {
    decodeUTF8 = function(string) {
      throw new ReferenceError("Native UTF-8 decoding unsupported");
    }
  };

  /* UTF8 Uint8Array to String */
  var encodeUTF8;
  if (TextDecoder) {
    var textDecoder = new TextDecoder("UTF8");
    encodeUTF8 = function(array) {
      array = toUint8Array(array);
      return textDecoder.decode(array)
    }
  } else if (Buffer) {
    encodeUTF8 = function(array) {
      return new Buffer(array).toString('utf8');
    }
  } else if (decodeURIComponent && escape) {
    encodeUTF8 = function(array) {
      var raw = arrays.toUint8String(array);
      return decodeURIComponent(escape(raw));
    }
  } else {
    encodeUTF8 = function(array) {
      throw new ReferenceError("Native UTF-8 decoding unsupported");
    }
  }

  /* ======================================================================== */
  /* Uint8Array functions                                                     */
  /* ======================================================================== */

  /**
   * Convert an Array, ArrayBuffer or ArrayBufferView into a valid Uint8Array.
   */
  function toUint8Array(array) {
    /* Strings are simply "decoded" into their UTF8 */
    if (typeof(array) === 'string') return decodeUTF8(array);

    /* Uint8Array, ArrayBuffer, plain array */
    if (array instanceof Uint8Array) return array;
    if (array instanceof ArrayBuffer) return new Uint8Array(array);
    if (Array.isArray(array)) return new Uint8Array(array);

    /* Fail miserably */
    throw new TypeError("Unable to convert " + typeName(array) + " to Uint8Array");
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

    /* Fail miserably */
    throw new Error("Unable to convert " + typeName(string) + " to Uint8String");
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

  /* XOR the contents of two arrays */
  function xorUint8Arrays(array1, array2, output) {

    /* array1 must be shorter than array2 */
    if (array1.length > array2.length) {
      //console.warn("SWAPPING", array1.length, array2.length);
      var temp = array2;
      array2 = array1;
      array1 = temp;
    } else if (array1.length === array2.length) {
      //console.warn("EQUALS", array1.length);
    }

    /* New array cloning the longer array */
    var array = output || new Uint8Array(array2.length);
    array.set(array2, 0);

    /* XOR each element from the short array */
    for (var i = 0; i < array1.length; i ++) {
      array[i] ^= array1[i];
    }

    /* Done! */
    return array;
  }

  /* ======================================================================== */
  /* Export our functions                                                     */
  /* ======================================================================== */

  return Object.freeze({
    decodeUTF8: decodeUTF8,
    encodeUTF8: encodeUTF8,
    toUint8Array: toUint8Array,
    toUint8String: toUint8String,
    fromUint8String: fromUint8String,
    createUint8Array: createUint8Array,
    xorUint8Arrays: xorUint8Arrays,
  });

});
