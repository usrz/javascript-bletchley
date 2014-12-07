'use strict';

Esquire.define('bletchley/hmacs', [ 'bletchley/utils/helpers',
                                    'bletchley/utils/extend',
                                    'bletchley/hmacs/HMAC',
                                    'bletchley/hashes/SHA1',
                                    'bletchley/hashes/SHA224',
                                    'bletchley/hashes/SHA256',
                                    'bletchley/hashes/SHA384',
                                    'bletchley/hashes/SHA512' ],
  function(helpers, extend, HMAC, SHA1, SHA224, SHA256, SHA384, SHA512) {

    var hmacs = (function create(hashes) {
      var hmacs = [];
      for (var i in hashes) {
        var hash = new hashes[i]();
        hmacs.push(new HMAC(hash));
      }
      return hmacs;
    })([SHA1, SHA224, SHA256, SHA384, SHA512]);

    return new (extend("HMACs", helpers.Factory, function() {

      this.hmac = function(algorithm, salt, secret) {
        return this.$helper(algorithm).hmac(salt, secret);
      };

      helpers.Factory.call(this, hmacs, 'hmacs');
    }))();

  }
);
