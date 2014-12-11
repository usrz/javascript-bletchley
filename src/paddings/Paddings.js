'use strict';

Esquire.define('bletchley/paddings/Paddings', [ 'bletchley/utils/HelperFactory',
                                                'bletchley/paddings/PKCS1Padding' ],

  function(HelperFactory, PKCS1Padding) {

    var pkcs1 = new PKCS1Padding();

    function Paddings() {
      HelperFactory.call(this, [ pkcs1 ]);
    }

    Paddings.prototype = Object.create(HelperFactory.prototype);
    Paddings.prototype.constructor = Paddings;

    Paddings.prototype.pad = function(algorithm, receiver, random, keySize) {
      return this.$helper(algorithm).pad(receiver, random, keySize);
    };

    Paddings.prototype.unpad = function(algorithm, receiver, random, keySize) {
      return this.$helper(algorithm).unpad(receiver, random, keySize);
    };

    return Paddings;

  }
);
