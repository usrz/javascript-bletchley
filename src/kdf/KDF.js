'use strict';

Esquire.define('bletchley/kdfs/KDF', ['bletchley/utils/Helper',
                                      'bletchley/utils/arrays'],
  function(Helper, arrays) {

    function KDF(name) {
      Helper.call(this, name);
    };

    KDF.prototype = Object.create(Helper.prototype);
    KDF.prototype.constructor = KDF;

    KDF.prototype.kdf = function() { throw new Error("KDF not implemented") }

    return KDF;
  }
);
