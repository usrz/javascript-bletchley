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

  function Factory(helpers) {
    var algorithms = [];
    var instances = {};

    /* Bind our functions */
    var factory = this;
    for (var i in factory) {
      (function(i, fn) {
        /* Try to use native "bind" if possible */
        if (typeof(fn) !== 'function') return;
        factory[i] = typeof(fn.bind) === 'function' ? fn.bind(factory) :
                   function() { return fn.apply(factory, arguments); } ;
      })(i, factory[i]);
    }

    /* Process helpers */
    if (!helpers.length) throw new Error("No helpers specified");
    for (var i in helpers) {
      var helper = helpers[i];
      if (! (helper instanceof Helper)) throw new Error("Invalid helper " + helper);

      var algorithm = helper.algorithm;
      if (! algorithm) throw new Error("Unknown algorithm for " + helper);

      algorithms.push(algorithm.toUpperCase());
      instances[normalize(algorithm)] = helper;
    }

    /* Our helper getter */
    var names = algorithms.join(', ');
    Object.defineProperties(this, {
      "$algorithms": {
        enumerable: false,
        configurable: false,
        value: Object.freeze(algorithms)
      },
      "$helper": {
        enumerable: false,
        configurable: false,
        value: function(algorithm) {
          var helper = instances[normalize(algorithm)];
          if (helper) return helper;
          throw new Error("'" + algorithm + "' not in [" + names + "]");
        }
      }
    });

    /* Freeze! */
    Object.freeze(this);
  }

  return Object.freeze({
    Helper:  Helper,
    Factory: Factory,
  });

});
