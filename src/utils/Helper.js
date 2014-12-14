'use strict';

Esquire.define('bletchley/utils/Helper', ['bletchley/utils/BoundClass'], function(BoundClass) {

  function Helper(algorithm) {
    if (!algorithm) throw new Error("Algorithm not specified");

    /* Normalize algorithm names */
    var aliases = [];
    if (typeof(algorithm) === 'string') {
      if (algorithm.length > 0) aliases.push(algorithm.toUpperCase());
    } else if (Array.isArray(algorithm)) {
      for (var i = 0; i < algorithm.length; i ++) {
        var alias = algorithm[i];
        if (typeof(algorithm) !== 'string') throw new Error("Algorithm alias must be a string");
        if (alias.length > 0) aliases.push(alias.toUpperCase());
      }
    } else {
      throw new Error("Algorithm must be a string or Array");
    }

    /* Just maske sure we have a name */
    if (aliases.length < 1) throw new Error("Algorithm not specified");

    /* Freeze and redefine name */
    Object.freeze(aliases);
    algorithm = aliases[0];

    /* Our properties */
    Object.defineProperties(this, {
      "algorithm": { configurable: false, enumerable: true, value: algorithm },
      "aliases":   { configurable: false, enumerable: true, value: aliases   }
    });

    /* Bind and lock functions */
    BoundClass.call(this);
  }

  Helper.prototype = Object.create(BoundClass.prototype);
  Helper.prototype.constructor = Helper;

  return Helper;

})
