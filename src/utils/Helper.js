'use strict';

Esquire.define('bletchley/utils/Helper', ['bletchley/utils/BoundClass'], function(BoundClass) {

  function Helper(algorithm) {
    if (!algorithm) throw new Error("Algorithm not specified");

    Object.defineProperty(this, "algorithm", {
      configurable: false,
      enumerable: true,
      value: algorithm
    });

    /* Bind and lock functions */
    BoundClass.call(this);
  }

  Helper.prototype = Object.create(BoundClass.prototype);
  Helper.prototype.constructor = Helper;

  return Helper;

})
