Esquire.define('bletchley/hashes/Hash', ['bletchley/utils/helpers',
                                         'bletchley/utils/arrays'],
  function(helpers, arrays) {

    return function Hash(name, compute) {
      this.compute = function(compute) {
        return compute(arrays.toUint8Array(array));
      }
      helpers.makeHelper(this, name, true);
    };
  }
);
