'use strict';

Esquire.define('bletchley/hashes/Hashes', [ 'bletchley/utils/HelperFactory',
                                            'bletchley/hashes/SHA1',
                                            'bletchley/hashes/SHA224',
                                            'bletchley/hashes/SHA256',
                                            'bletchley/hashes/SHA384',
                                            'bletchley/hashes/SHA512' ],

  function(HelperFactory, SHA1, SHA224, SHA256, SHA384, SHA512) {

    function Hashes() {
      var sha1   = new SHA1();
      var sha224 = new SHA224();
      var sha256 = new SHA256();
      var sha384 = new SHA384();
      var sha512 = new SHA512();

      HelperFactory.call(this, [sha1, sha224, sha256, sha384, sha512]);
    }

    Hashes.prototype = Object.create(HelperFactory.prototype);
    Hashes.prototype.constructor = Hashes;

    Hashes.prototype.hash = function(algorithm, message, output) {
      return this.$helper(algorithm).hash(message, output);
    };

    return Hashes;

  }
);
