'use strict';

Esquire.define('bletchley/paddings/Paddings', [ 'bletchley/utils/HelperFactory',
                                                'bletchley/paddings/PKCS1Padding',
                                                'bletchley/paddings/OAEPPadding' ],

  function(HelperFactory, PKCS1Padding, OAEPPadding) {

    var pkcs1 = new PKCS1Padding();
    var oaep = new OAEPPadding();

    function Paddings() {
      HelperFactory.call(this, function(algorithm) {
        switch (algorithm) {
          case 'PKCS1': return new PKCS1Padding();
          case 'OAEP':  return new OAEPPadding();
        }
      });
    }

    Paddings.prototype = Object.create(HelperFactory.prototype);
    Paddings.prototype.constructor = Paddings;

    Paddings.prototype.pad = function(algorithm, receiver, random, keySize, options) {
      return this.$helper(algorithm).pad(receiver, random, keySize, options);
    };

    Paddings.prototype.unpad = function(algorithm, receiver, random, keySize, options) {
      return this.$helper(algorithm).unpad(receiver, random, keySize, options);
    };

    return Paddings;

  }
);
