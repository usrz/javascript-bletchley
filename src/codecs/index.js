'use strict';

Esquire.define('bletchley/codecs', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/codecs/base64',
                                     'bletchley/codecs/hex',
                                     'bletchley/codecs/utf8' ],
  function(helpers, extend, base64, hex, utf8) {

    return new (extend(function() {

      this.encode = function(algorithm, array) {
        return this.$helper(algorithm).encode(array);
      }.bind(this);

      this.decode = function(algorithm, string) {
        return this.$helper(algorithm).decode(string);
      }.bind(this);

      helpers.Factory.call(this, [base64, hex, utf8], 'codecs');

    }, helpers.Factory, "Codecs"))();


  }
);
