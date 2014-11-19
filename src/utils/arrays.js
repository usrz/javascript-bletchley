Esquire.define('bletchley/utils/arrays', [], function() {

  function toUint8Array(array) {
    if (! array) throw new Error("No array to convert to Uint8Array");

    /* Basic arrays / array bufffers / array buffer views */
    if (array instanceof Uint8Array) return array;
    if (array instanceof ArrayBuffer) return new Uint8Array(array);
    if (array.buffer instanceof ArrayBuffer) return new Uint8Array(array.buffer);
    if (Array.isArray(array)) return new Uint8Array(array);

    /* Fail miserably */
    throw new Error("Unable to convert " + typeof(array) + " to Uint8Array");
  }

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

  function toUint8String(array) {
    array = toUint8Array(array);
    var raw = new Array(array.length);
    for (var i = 0; i < array.length; i++) {
      raw[i] = String.fromCharCode(array[i]);
    }
    return raw.join('');
  }

  return Object.freeze({
    toUint8Array: toUint8Array,
    toUint8String: toUint8String,
    fromUint8String: fromUint8String
  });

});
