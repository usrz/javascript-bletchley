'use strict';

Esquire.define('bletchley/hashes/Hash', ['bletchley/utils/helpers',
                                         'bletchley/utils/extend',
                                         'bletchley/utils/arrays'],
  function(helpers, extend, arrays) {

    var Hash = extend(function(name, blockSize, digestSize, hash) {
      this.blockSize = blockSize;
      this.digestSize = digestSize;

      this.hash = function(array, output, h) {
        return hash.call(this, arrays.toUint8Array(array), output, h);
      }

      helpers.Helper.call(this, name);
    }, helpers.Helper, "Hash");

    Object.defineProperty(Hash.prototype, "$$result", {
      configurable: false,
      enumerable: false,
      value: function(output, fn) {
        var result, view;
        if (output) {
          fn.call(this, new DataView(output.buffer, output.byteOffset, output.byteLength));
          return output;
        } else {
          var hash = new ArrayBuffer(this.digestSize);
          fn.call(this, new DataView(hash));
          return new Uint8Array(hash);
        }
      }
    });

    return Hash;

  }
);
