'use strict';

Esquire.define('bletchley/hmacs', [ 'bletchley/hmacs/HMAC',
                                    'bletchley/hashes/sha1',
                                    'bletchley/hashes/sha224',
                                    'bletchley/hashes/sha256',
                                    'bletchley/hashes/sha384',
                                    'bletchley/hashes/sha512',
                                    'bletchley/utils/arrays',
                                    'bletchley/utils/helpers',
                                    'bletchley/utils/extend' ],
  function(HMAC, sha1, sha224, sha256, sha384, sha512, arrays, helpers, extend) {

    function create(hashes) {
      var hmacs = [];
      var outerPaddings = {};
      var innerPaddings = {};
      for (var i in hashes) {
        var hash = hashes[i];
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

    var hmacs = create([sha1, sha224, sha256, sha384, sha512]);

    return new (extend(function() {

      var h = this;
      this.hmac = function(algorithm, salt, secret) {
        return this.$helper(algorithm).hmac(salt, secret);
      };

      helpers.Factory.call(this, hmacs, 'hmacs');
    }, helpers.Factory, "HMACs"))();

  }
);
