'use strict';

Esquire.define('bletchley/hmacs/HMACs', [ 'bletchley/utils/HelperFactory',
                                          'bletchley/hmacs/HMAC',
                                          'bletchley/hashes/Hashes' ],
  function(HelperFactory, HMAC, Hashes) {

    function HMACs() {
      var hmacs = [];
      var hashes = new Hashes();
      var algorithms = hashes.$algorithms;
      for (var i in algorithms) {
        var hash = new hashes.$helper(algorithms[i]);
        hmacs.push(new HMAC(hash));
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
