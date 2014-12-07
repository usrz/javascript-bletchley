'use strict';

Esquire.define('bletchley/hmacs/HMACs', [ 'bletchley/utils/helpers',
                                          'bletchley/hmacs/HMAC',
                                          'bletchley/hashes/Hashes' ],
  function(helpers, HMAC, Hashes) {

    function HMACs() {
      var hmacs = [];
      var hashes = new Hashes();
      var algorithms = hashes.$algorithms;
      for (var i in algorithms) {
        var hash = new hashes.$helper(algorithms[i]);
        hmacs.push(new HMAC(hash));
      }

      helpers.Factory.call(this, hmacs);
    }

    HMACs.prototype = Object.create(helpers.Factory.prototype);
    HMACs.prototype.constructor = HMACs;

    HMACs.prototype.hmac = function(algorithm, salt, secret, output) {
      return this.$helper(algorithm).hmac(salt, secret, output);
    };

    return HMACs;

  }
);
