Esquire.define('bletchley/kdfs/KDFs', [ 'bletchley/utils/HelperFactory',
                                        'bletchley/kdfs/PBKDF2',
                                        'bletchley/kdfs/SCrypt' ],

  function(HelperFactory, PBKDF2, SCrypt) {

    function KDFs() {
      HelperFactory.call(this, [new PBKDF2(), new SCrypt()]);
    }

    KDFs.prototype = Object.create(HelperFactory.prototype);
    KDFs.prototype.constructor = KDFs;

    KDFs.prototype.kdf = function(algorithm, password, salt, options) {
      return this.$helper(algorithm).kdf(password, salt, options);
    };

    return KDFs;

  }
);
