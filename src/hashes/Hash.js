'use strict';

Esquire.define('bletchley/hashes/Hash', ['bletchley/utils/helpers',
                                         'bletchley/utils/extend',
                                         'bletchley/utils/arrays'],
  function(helpers, extend, arrays) {

    return extend(function(name, blockSize, hash) {
      this.blockSize = blockSize;

      this.hash = function(array, h) {
        return hash(arrays.toUint8Array(array), h);
      }

      helpers.Helper.call(this, name);
    }, helpers.Helper, "Hash");

  }
);
