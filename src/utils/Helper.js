'use strict';

Esquire.define('bletchley/utils/Helper', [], function() {

  function Helper(algorithm) {
    if (!algorithm) throw new Error("Algorithm not specified");

    Object.defineProperty(this, "algorithm", {
      configurable: false,
      enumerable: true,
      value: algorithm
    });
  };

  return Helper;

})
