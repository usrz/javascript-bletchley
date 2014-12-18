'use strict';

Esquire.define('bletchley/hashes/Hashes', [ 'bletchley/utils/HelperFactory',
                                            'bletchley/hashes/SHA1',
                                            'bletchley/hashes/SHA224',
                                            'bletchley/hashes/SHA256',
                                            'bletchley/hashes/SHA384',
                                            'bletchley/hashes/SHA512' ],

  function(HelperFactory, SHA1, SHA224, SHA256, SHA384, SHA512) {

    function Hashes() {
      HelperFactory.call(this, function (algorithm) {
        switch (algorithm) {
          case "SHA1":   return new SHA1();
          case "SHA224": return new SHA224();
          case "SHA256": return new SHA256();
          case "SHA384": return new SHA384();
          case "SHA512": return new SHA512();
        }
      });
    }

    Hashes.prototype = Object.create(HelperFactory.prototype);
    Hashes.prototype.constructor = Hashes;

    Hashes.prototype.hash = function(algorithm, message, output) {
      return this.$helper(algorithm).hash(message, output);
    };

    return Hashes;

  }
);
