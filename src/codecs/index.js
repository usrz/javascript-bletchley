Esquire.define('bletchley/codecs', [ 'bletchley/utils/helpers',
                                     'bletchley/codecs/base64',
                                     'bletchley/codecs/hex',
                                     'bletchley/codecs/utf8' ],
  function(helpers, base64, hex, utf8) {

    return helpers.makeFactory({
      encode: function(algorithm, array) {
        return this.get(algorithm).encode(array);
      },
      decode: function(algorithm, string) {
        return this.get(algorithm).decode(string);
      }
    }, [base64, hex, utf8], true);

  }
);
