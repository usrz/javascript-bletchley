Esquire.define('bletchley/hashes/Hash', ['bletchley/utils/helpers',
                                         'bletchley/utils/arrays'],
  function(helpers, arrays) {

    function Hash(name, hash) {

      this.hash = function(array, h) {
        return hash(arrays.toUint8Array(array), h);
      }

      helpers.Helper.call(this, name);
    }

    Hash.prototype = new helpers.Helper();
    return Hash;

  }
);
