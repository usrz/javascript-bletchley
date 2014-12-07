Esquire.define('bletchley/codecs/Codecs', [ 'bletchley/utils/helpers',
                                            'bletchley/codecs/BASE64',
                                            'bletchley/codecs/HEX' ],

  function(helpers, BASE64, HEX) {

    function Codecs() {

      // Object.defineProperties(this, {

      //   "encode": { configurable: false, enumerable: true, value: function(algorithm, array) {
      //     return this.$helper(algorithm).encode(array);
      //   }},

      //   "decode": { configurable: false, enumerable: true, value: function(algorithm, string) {
      //     return this.$helper(algorithm).decode(string);
      //   }}
      // });

      helpers.Factory.call(this, [ new BASE64(), new HEX() ]);
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
