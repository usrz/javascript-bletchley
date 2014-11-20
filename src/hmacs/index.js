'use strict';

Esquire.define('bletchley/hmacs', ['bletchley/hmacs/HMAC',
                                   'bletchley/hashes',
                                   'bletchley/utils/arrays',
                                   'bletchley/utils/helpers'],
  function(HMAC, hashes, arrays, helpers) {

    function create(hashes) {
      var hmacs = [];
      var outerPaddings = {};
      var innerPaddings = {};
      for (var i in hashes.algorithms) {
        var algorithm = hashes.algorithms[i];
        var hash = hashes.get(algorithm);
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

    function HMACs() {
      var hmacs = this;

      this.hmac = function(algorithm, salt, secret) {
        return hmacs.get(algorithm).hmac(salt, secret);
      }

      helpers.Factory.call(this, create(hashes));
    }

    HMACs.prototype = new helpers.Factory();
    return new HMACs();


  }
);
