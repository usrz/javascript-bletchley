'use strict';

Esquire.define('bletchley/codecs', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/codecs/base64',
                                     'bletchley/codecs/hex',
                                     'bletchley/codecs/utf8' ],
  function(helpers, extend, base64, hex, utf8) {

    var Codecs = extend(function() {
     extend.solidify(this);
      helpers.Factory.call(this, [base64, hex, utf8]);
    }, helpers.Factory, "Codecs");

    Codecs.prototype.encode = function(algorithm, array) {
      return this.get(algorithm).encode(array);
    }

    Codecs.prototype.decode = function(algorithm, string) {
      return this.get(algorithm).decode(string);
    };

    return new Codecs();

  }
);
