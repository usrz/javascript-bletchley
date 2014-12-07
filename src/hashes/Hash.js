'use strict';

Esquire.define('bletchley/hashes/Hash', [ 'bletchley/utils/helpers',
                                          'bletchley/utils/extend',
                                          'bletchley/utils/arrays' ],
  function(helpers, extend, arrays) {

    return extend("Hash", helpers.Helper, function(algorithm, blockSize, digestSize) {

      Object.defineProperties(this, {
        "blockSize":  { enumerable: true, configurable: false, value: blockSize },
        "digestSize": { enumerable: true, configurable: false, value: digestSize },
        "hash":       { enumerable: true, configurable: false, value: function(message, output) {
          return this.reset().update(message).finish(output);
        }},
      });

      helpers.Helper.call(this, algorithm);
    });

    return Hash;

  }
);
