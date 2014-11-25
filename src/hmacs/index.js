'use strict';

Esquire.define('bletchley/hmacs', [ 'bletchley/hmacs/HMAC',
                                    'bletchley/hashes',
                                    'bletchley/utils/arrays',
                                    'bletchley/utils/helpers',
                                    'bletchley/utils/extend' ],
  function(HMAC, hashes, arrays, helpers, extend) {

    function create(hashes) {
      var hmacs = [];
      var outerPaddings = {};
      var innerPaddings = {};
      for (var i in hashes.hashes) {
        var algorithm = hashes.hashes[i];
        var hash = hashes.$helper(algorithm);
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
    }

    /* ====================================================================== */

    return new (extend(function() {

      this.hmac = function(algorithm, salt, secret) {
        return this.$helper(algorithm).hmac(salt, secret);
      }.bind(this);

      helpers.Factory.call(this, create(hashes), 'hmacs');
    }, helpers.Factory, "HMACs"))();

  }
);
