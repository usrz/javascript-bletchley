'use strict';

Esquire.define('bletchley/hmacs', [ 'bletchley/hashes',
                                    'bletchley/hmacs/HMAC',
                                    'bletchley/utils/arrays',
                                    'bletchley/utils/helpers',
                                    'bletchley/utils/extend' ],
  function(hashes, HMAC, arrays, helpers, extend) {

    var hmacs = (function create(hashes) {
      var hmacs = [];
      var outerPaddings = {};
      var innerPaddings = {};
      for (var i in hashes.$algorithms) {
        var hash = hashes.$helper(hashes.$algorithms[i]);
        var blockSize = hash.blockSize;

        var innerPadding;
        if (blockSize in innerPaddings) {
          innerPadding = innerPaddings[blockSize];
        } else {
          innerPadding = arrays.createUint8Array(blockSize, 0x36);
          innerPaddings[blockSize] = innerPadding;
        }

        var outerPadding;
        if (blockSize in outerPaddings) {
          outerPadding = outerPaddings[blockSize];
        } else {
          outerPadding = arrays.createUint8Array(blockSize, 0x5c);
          outerPaddings[blockSize] = outerPadding;
        }

        hmacs.push(new HMAC(hash, innerPadding, outerPadding));
      }
      return hmacs;
    })(hashes);

    return new (extend(function() {

      this.hmac = function(algorithm, salt, secret) {
        return this.$helper(algorithm).hmac(salt, secret);
      };

      helpers.Factory.call(this, hmacs, 'hmacs');
    }, helpers.Factory, "HMACs"))();

  }
);
