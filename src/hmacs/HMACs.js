'use strict';

Esquire.define('bletchley/hmacs/HMACs', [ 'bletchley/utils/HelperFactory',
                                          'bletchley/hmacs/HMAC',
                                          'bletchley/hashes/Hashes' ],
  function(HelperFactory, HMAC, Hashes) {

    var hashes = new Hashes();

    function HMACs() {
      HelperFactory.call(this, function (algorithm) {
        return new HMAC(hashes.$helper(algorithm));
      });
    }

    HMACs.prototype = Object.create(HelperFactory.prototype);
    HMACs.prototype.constructor = HMACs;

    HMACs.prototype.hmac = function(algorithm, salt, secret, output) {
      return this.$helper(algorithm).hmac(salt, secret, output);
    };

    return HMACs;

  }
);
