'use strict';

Esquire.define('bletchley/kdfs/KDFs', [ 'bletchley/utils/HelperFactory',
                                        'bletchley/hmacs/HMACs',
                                        'bletchley/kdfs/PBKDF2',
                                        'bletchley/kdfs/SCrypt' ],

  function(HelperFactory, HMACs, PBKDF2, SCrypt) {

    var hmacs = new HMACs();

    function KDFs() {
      var kdfs = this;
      HelperFactory.call(this, function (name) {

        /* Parse our algorithm like "PBKDF2/SHA256" */
        var algorithm = /([^\/]+)(\/([^\/]+))?/.exec(name);

        /* Get the hashing function to associate with the KDF */
        var hmac = algorithm[3] ? hmacs.$helper(algorithm[3]) : null;

        /* KDF Algoritmh */
        switch (algorithm[1]) {
          case 'PBKDF':  return new PBKDF2(hmacs, hmac);
          case 'PBKDF2': return new PBKDF2(hmacs, hmac);
          case 'SCRYPT': return new SCrypt(kdfs, algorithm[3]);
        }
      });
    }

    KDFs.prototype = Object.create(HelperFactory.prototype);
    KDFs.prototype.constructor = KDFs;

    KDFs.prototype.kdf = function(algorithm, password, salt, options) {
      return this.$helper(algorithm).kdf(password, salt, options);
    };

    return KDFs;

  }
);
