Esquire.define('bletchley/codecs/Codec', ['bletchley/utils/helpers',
                                          'bletchley/utils/arrays'],
  function(helpers, arrays) {

    function Codec(name, encode, decode) {

      this.encode = function(array) {
        array = arrays.toUint8Array(array);
        if (array.length == 0) return '';
        return encode(array);
      }

      this.decode = function(string) {
        if (typeof(string) === 'string') {
          return string.length == 0 ? new Uint8Array() : decode(string);
        } else {
          throw new Error("Unable to decode " + typeof(string) + ": " + string);
        }
      }

      helpers.Helper.call(this, name);
    }

    Codec.prototype = new helpers.Helper();
    return Codec;

  }
);
