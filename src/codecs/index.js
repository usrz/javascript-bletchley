'use strict';

Esquire.define('bletchley/codecs', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/codecs/base64',
                                     'bletchley/codecs/hex' ],
  function(helpers, extend, base64, hex) {

    return new (extend(function() {

      this.encode = function(algorithm, array) {
        return this.$helper(algorithm).encode(array);
      }

      this.decode = function(algorithm, string) {
        return this.$helper(algorithm).decode(string);
      }

      helpers.Factory.call(this, [base64, hex]);

    }, helpers.Factory, "Codecs"))();

  }
);
