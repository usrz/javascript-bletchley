'use strict';

Esquire.define('bletchley/hashes/Hash', [ 'bletchley/utils/Helper',
                                          'bletchley/utils/arrays' ],
  function(Helper, extend, arrays) {

    function Hash(algorithm, blockSize, digestSize) {

      Object.defineProperties(this, {
        "blockSize":  { enumerable: true, configurable: false, value: blockSize },
        "digestSize": { enumerable: true, configurable: false, value: digestSize },
        "hash":       { enumerable: true, configurable: false, value: function(message, output) {
          return this.reset().update(message).finish(output);
        }},
      });

      Helper.call(this, algorithm);
    };

    Hash.prototype = Object.create(Helper.prototype);
    Hash.prototype.constructor = Hash;

    return Hash;

  }
);
