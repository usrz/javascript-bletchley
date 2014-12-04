'use strict';

Esquire.define('bletchley/hashes', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/hashes/SHA1',
                                     'bletchley/hashes/SHA224',
                                     'bletchley/hashes/SHA256',
                                     'bletchley/hashes/SHA384',
                                     'bletchley/hashes/SHA512' ],
  function(helpers, extend, SHA1, SHA224, SHA256, SHA384, SHA512) {

    var sha1   = new SHA1();
    var sha224 = new SHA224();
    var sha256 = new SHA256();
    var sha384 = new SHA384();
    var sha512 = new SHA512();

    return new (extend(function() {

      this.hash = function(algorithm, message) {
        return this.$helper(algorithm).hash(message);
      };

      helpers.Factory.call(this, [sha1, sha224, sha256, sha384, sha512], 'hashes');
    }, helpers.Factory, "Hashes"))();

  }
);
