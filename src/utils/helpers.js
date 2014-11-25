'use strict';

Esquire.define('bletchley/utils/helpers', [], function() {

  function normalize(name) {
    if (typeof('name') !== 'string') throw new Error("Invalid name " + name);
    return name.replace(/[- ]/g,'').toLowerCase();
  }

  function Helper(algorithm) {
    if (!algorithm) throw new Error("Algorithm not specified in " + this);
    this.algorithm = algorithm;
    Object.freeze(this);
  };

  function Factory(helpers, algorithmsProperty) {
    var algorithms = [];
    var instances = {};

    /* Process helpers */
    for (var i in helpers) {
      var helper = helpers[i];
      if (! (helper instanceof Helper)) throw new Error("Invalid helper " + helper);

      var algorithm = helper.algorithm;
      if (! algorithm) throw new Error("Unknown algorithm for " + helper);

      algorithms.push(algorithm.toUpperCase());
      instances[normalize(algorithm)] = helper;
    }

    /* Our helper getter */
    Object.defineProperty(this, "$helper", {
      configurable: false,
      enumerable: false,
      value: function(algorithm) {
        var helper = instances[normalize(algorithm)];
        if (! helper) throw new Error("Unrecognized algorithm " + algorithm + ", available " + algorithms);
        return helper;
      }
    });

    /* If exposed, our algorithms */
    if (algorithmsProperty) {
      Object.defineProperty(this, algorithmsProperty, {
        configurable: false,
        enumerable: false,
        get: function() {
          return algorithms;
        }
      });
    }

    /* Freeze! */
    Object.freeze(this);
  }

  return Object.freeze({
    Helper:  Helper,
    Factory: Factory,
  });

});
