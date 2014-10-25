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

  /* Export our three functions */
  return {
    toUint8Array: toUint8Array,
    toUint8String: toUint8String,
    fromUint8String: fromUint8String
  };

});
