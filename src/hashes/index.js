'use strict';

Esquire.define('bletchley/hashes', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/hashes/SHA1',
                                     'bletchley/hashes/SHA224',
                                     'bletchley/hashes/SHA256',
                                     'bletchley/hashes/sha384',
                                     'bletchley/hashes/sha512' ],
  function(helpers, extend, SHA1, SHA224, SHA256, sha384, sha512) {

    var sha1   = new SHA1();
    var sha224 = new SHA224();
    var sha256 = new SHA256();

    return new (extend(function() {

      this.hash = function(algorithm, message) {
        return this.$helper(algorithm).hash(message);
      };

      helpers.Factory.call(this, [sha1, sha224, sha256, sha384, sha512], 'hashes');
    }, helpers.Factory, "Hashes"))();

  }
);
