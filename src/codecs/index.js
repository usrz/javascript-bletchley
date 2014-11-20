'use strict';

Esquire.define('bletchley/codecs', [ 'bletchley/utils/helpers',
                                     'bletchley/codecs/base64',
                                     'bletchley/codecs/hex',
                                     'bletchley/codecs/utf8' ],
  function(helpers, base64, hex, utf8) {

    function Codecs() {
      var codecs = this;

      this.encode = function(algorithm, array) {
        return codecs.get(algorithm).encode(array);
      };

      this.decode = function(algorithm, string) {
        return codecs.get(algorithm).decode(string);
      };

      helpers.Factory.call(this, [base64, hex, utf8]);
    }

    Codecs.prototype = new helpers.Factory();
    return new Codecs();

  }
);
