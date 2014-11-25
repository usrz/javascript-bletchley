'use strict';

Esquire.define('bletchley/hashes', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/hashes/sha1',
                                     'bletchley/hashes/sha224',
                                     'bletchley/hashes/sha256',
                                     'bletchley/hashes/sha384',
                                     'bletchley/hashes/sha512' ],
  function(helpers, extend, sha1, sha224, sha256, sha384, sha512) {

    return new (extend(function() {

      this.hash = function(algorithm, message) {
        return this.$helper(algorithm).hash(message);
      }.bind(this);

      helpers.Factory.call(this, [sha1, sha224, sha256, sha384, sha512], 'hashes');
    }, helpers.Factory, "Hashes"))();

  }
);
