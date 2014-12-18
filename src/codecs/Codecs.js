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

    Codecs.prototype = Object.create(HelperFactory.prototype);
    Codecs.prototype.constructor = Codecs;

    Codecs.prototype.encode = function(algorithm, array) {
      return this.$helper(algorithm).encode(array);
    };

    Codecs.prototype.decode = function(algorithm, string) {
      return this.$helper(algorithm).decode(string);
    };

    return Codecs;

  }
);
