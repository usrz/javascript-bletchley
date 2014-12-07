'use strict';

Esquire.define('bletchley/kdfs/KDF', ['bletchley/utils/Helper',
                                      'bletchley/utils/arrays'],
  function(Helper, arrays) {

    function KDF(name, kdf) {
      Object.defineProperty(this, "kdf", {
        configurable: false,
        enumerable: true,
        value: function(password, salt, options) {
          return kdf(arrays.toUint8Array(password), arrays.toUint8Array(salt), options);
        }
      });

      Helper.call(this, name);
    };

    KDF.prototype = Object.create(Helper.prototype);
    KDF.prototype.constructor = KDF;

    return KDF;
  }
);
