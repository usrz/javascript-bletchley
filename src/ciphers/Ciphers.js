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

      HelperFactory.call(this, [ rsaOaep, rsaPkcs ]);
    }

    Ciphers.prototype = Object.create(HelperFactory.prototype);
    Ciphers.prototype.constructor = Ciphers;

    Ciphers.prototype.encode = function(algorithm, array) {
      return this.$helper(algorithm).encode(array);
    };

    Ciphers.prototype.decode = function(algorithm, string) {
      return this.$helper(algorithm).decode(string);
    };

    return Ciphers;

  }
);
