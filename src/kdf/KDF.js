'use strict';

Esquire.define('bletchley/kdfs/KDF', ['bletchley/utils/helpers',
                                      'bletchley/utils/extend',
                                      'bletchley/utils/arrays'],
  function(helpers, extend, arrays) {

    return extend(function(name, kdf) {

      this.kdf = function(password, salt, options) {
        return kdf(arrays.toUint8Array(password), arrays.toUint8Array(salt), options);
      }

      helpers.Helper.call(this, name);
    }, helpers.Helper, "KDF");

  }
);
