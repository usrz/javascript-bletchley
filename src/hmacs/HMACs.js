'use strict';

Esquire.define('bletchley/hmacs/HMACs', [ 'bletchley/utils/HelperFactory',
                                          'bletchley/hmacs/HMAC',
                                          'bletchley/hashes/Hashes' ],
  function(HelperFactory, HMAC, Hashes) {

    function HMACs() {
      var hmacs = [];
      var hashes = new Hashes();
      var helpers = hashes.$helpers;
      for (var i in helpers) {
        hmacs.push(new HMAC(helpers[i]));
      }

      HelperFactory.call(this, hmacs);
    }

    HMACs.prototype = Object.create(HelperFactory.prototype);
    HMACs.prototype.constructor = HMACs;

    HMACs.prototype.hmac = function(algorithm, salt, secret, output) {
      return this.$helper(algorithm).hmac(salt, secret, output);
    };

    return HMACs;

  }
);
