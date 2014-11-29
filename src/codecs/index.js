'use strict';

Esquire.define('bletchley/codecs', [ 'bletchley/utils/helpers',
                                     'bletchley/utils/extend',
                                     'bletchley/utils/arrays',
                                     'bletchley/codecs/base64',
                                     'bletchley/codecs/hex',
                                     '$global/TextDecoder',
                                     '$global/Buffer',
                                     '$global/decodeURIComponent',
                                     '$global/escape' ],

  function(helpers, extend, arrays, base64, hex, TextDecoder, Buffer, decodeURIComponent, escape) {

    return new (extend(function() {

      /* Stringify array */
      var stringify;

      if (TextDecoder) {
        var textDecoder = new TextDecoder("UTF8");
        stringify = function(array) {
          return textDecoder.decode(array)
        }
      } else if (Buffer) {
        stringify = function(array) {
          return new Buffer(array).toString('utf8');
        }
      } else if (decodeURIComponent && escape) {
        stringify = function(array) {
          var raw = arrays.toUint8String(array);
          return decodeURIComponent(escape(raw));
        }
      }

      if (! stringify) throw new Error("No native support for UTF-8");

      this.stringify = function(array) {
        return stringify(arrays.toUint8Array(array));
      }

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
