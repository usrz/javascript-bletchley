'use strict';

Esquire.define('bletchley/kdfs', [ 'bletchley/utils/helpers',
                                   'bletchley/utils/extend',
                                   'bletchley/kdfs/pbkdf2',
                                   'bletchley/kdfs/scrypt' ],

  function(helpers, extend, pbkdf2, scrypt) {

    return new (extend("KDFs", helpers.Factory, function() {

      this.kdf = function(algorithm, password, salt, options) {
        return this.$helper(algorithm).kdf(password, salt, options);
      };

      helpers.Factory.call(this, [pbkdf2, scrypt]);
    }))();

  }
);
