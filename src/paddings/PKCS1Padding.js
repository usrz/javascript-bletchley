Esquire.define('bletchley/paddings/PKCS1Padding', [ 'bletchley/paddings/Padding',
                                                    'bletchley/paddings/PKCS1Padder',
                                                    'bletchley/paddings/PKCS1Unpadder' ],
  function(Padding, PKCS1Padder, PKCS1Unpadder) {

    function PKCS1Padding() {
      Padding.call(this, "PKCS1");
    }

    PKCS1Padding.prototype = Object.create(Padding.prototype);
    PKCS1Padding.prototype.constructor = PKCS1Padding;

    PKCS1Padding.prototype.pad = function(receiver, random, keySize) {
      return new PKCS1Padder(receiver, random, keySize);
    };

    PKCS1Padding.prototype.unpad = function(receiver, random, keySize) {
      return new PKCS1Unpadder(receiver, keySize);
    };

    return PKCS1Padding;

  }
);
