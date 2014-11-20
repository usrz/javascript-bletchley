'use strict';

Esquire.define('bletchley/utils/arrays', ['$esquire'], function($esquire) {

  var utf8;

  /**
   * Convert an Array, ArrayBuffer or ArrayBufferView into a valid Uint8Array.
   */
  function toUint8Array(array) {
    if (typeof(array) === 'string') {
      if (! utf8) utf8 = $esquire.require('bletchley/codecs/utf8');
      return utf8.decode(array);
    }

    if (! array) throw new Error("No array to convert to Uint8Array");

    /* Basic arrays / array bufffers / array buffer views */
    if (array instanceof Uint8Array) return array;
    if (array instanceof ArrayBuffer) return new Uint8Array(array);
    if (array.buffer instanceof ArrayBuffer) return new Uint8Array(array.buffer);
    if (Array.isArray(array)) return new Uint8Array(array);

    /* Fail miserably */
    throw new Error("Unable to convert " + typeof(array) + " to Uint8Array");
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
      for (var i in string) {
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

  return Object.freeze({
    toUint8Array: toUint8Array,
    toUint8String: toUint8String,
    fromUint8String: fromUint8String,
    createUint8Array: createUint8Array,
    concatUint8Arrays: concatUint8Arrays
  });

});
