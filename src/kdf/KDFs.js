Esquire.define('bletchley/kdfs/KDFs', [ 'bletchley/utils/helpers',
                                        'bletchley/kdfs/PBKDF2',
                                        'bletchley/kdfs/SCrypt' ],

  function(helpers, PBKDF2, SCrypt) {

    function KDFs() {
      helpers.Factory.call(this, [new PBKDF2(), new SCrypt()]);
    }

    KDFs.prototype = Object.create(helpers.Factory.prototype);
    KDFs.prototype.constructor = KDFs;

    KDFs.prototype.kdf = function(algorithm, password, salt, options) {
      return this.$helper(algorithm).kdf(password, salt, options);
    };

    return KDFs;

  }
);
