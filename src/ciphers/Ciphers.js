'use strict';

Esquire.define('bletchley/ciphers/Ciphers', [ 'bletchley/utils/HelperFactory',
                                              'bletchley/ciphers/RSACipher',
                                              'bletchley/paddings/Paddings',
                                              'bletchley/random/Random' ],

  function(HelperFactory, RSACipher, Paddings, Random) {

    var paddings = new Paddings();

    function Ciphers(random) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      var rsaOaep = new RSACipher(paddings.$helper('OAEP'), random);
      var rsaPkcs = new RSACipher(paddings.$helper('PKCS1'), random);

      HelperFactory.call(this, function (name) {

        /* Parse our algorithm like "RSA/PKCS1" */
        var algorithm = /([^\/]+)(\/([^\/]+))?/.exec(name);

        /* Get the padding function to associate with the Cipher */
        var padding = algorithm[3] ? paddings.$helper(algorithm[3]) : null;

        /* Cipher Algoritmh */
        switch (algorithm[1]) {
          case 'RSA':  return new RSACipher(padding, random);
        }
      });
    }

    Ciphers.prototype.encrypt = function(algorithm, key, data, options) {
      return this.$helper(algorithm).encrypt(key, data, options);
    };

    Ciphers.prototype.decrypt = function(algorithm, key, data, options) {
      return this.$helper(algorithm).decrypt(key, data, options);
    };

    /* Ciphers extends HelperFactory */
    return HelperFactory.$super(Ciphers);

  }
);
