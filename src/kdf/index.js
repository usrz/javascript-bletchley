'use strict';

Esquire.define('bletchley/kdfs', [ 'bletchley/utils/helpers',
                                   'bletchley/utils/extend',
                                   'bletchley/kdfs/pbkdf2' ],

  function(helpers, extend, pbkdf2) {

    return new (extend(function() {

      this.kdf = function(algorithm, password, salt, options, asyncHMAC) {
        return this.$helper(algorithm).kdf(password, salt, options, asyncHMAC);
      };

      helpers.Factory.call(this, [pbkdf2]);
    }, helpers.Factory, "KDFs"))();

  }
);
