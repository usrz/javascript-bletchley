'use strict';

Esquire.define('bletchley/codecs/Codecs', [ 'bletchley/utils/HelperFactory',
                                            'bletchley/codecs/Base64',
                                            'bletchley/codecs/HEX' ],

  function(HelperFactory, Base64, HEX) {

    function Codecs() {
      HelperFactory.call(this, function(algorithm) {
        switch (algorithm) {
          case 'BASE64': return new Base64();
          case 'HEX':    return new HEX();
        }
      });
    }

    Codecs.prototype.encode = function(algorithm, array) {
      return this.$helper(algorithm).encode(array);
    };

    Codecs.prototype.decode = function(algorithm, string) {
      return this.$helper(algorithm).decode(string);
    };

    /* Codecs extends HelperFactory */
    return HelperFactory.$super(Codecs);

  }
);
