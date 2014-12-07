Esquire.define('bletchley/codecs/Codecs', [ 'bletchley/utils/helpers',
                                            'bletchley/codecs/Base64',
                                            'bletchley/codecs/HEX' ],

  function(helpers, Base64, HEX) {

    function Codecs() {
      helpers.Factory.call(this, [ new Base64(), new HEX() ]);
    }

    Codecs.prototype = Object.create(helpers.Factory.prototype);
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
