'use strict';

Esquire.define('bletchley/utils/HelperFactory', [ 'bletchley/utils/Helper' ], function(Helper) {

  function normalize(name) {
    if (typeof(name) !== 'string') throw new Error("Invalid algorithm name '" + name + "'");
    return name.replace(/[- ]/g,'').toLowerCase();
  }

  function HelperFactory(helpers) {
    var algorithms = [];
    var instances = {};

    /* Check helpers */
    if (!helpers.length) throw new Error("No helpers specified");

    /* Bind our functions */
    var factory = this;
    for (var i in factory) {
      (function(i, fn) {
        if (typeof(fn) !== 'function') return;

        /* Try to use native "bind" if possible */
        var boundFn = typeof(fn.bind) !== 'function' ?
                    function() { return fn.apply(factory, arguments); } :
                    fn.bind(factory);

        /* Redefine and lock our function */
        Object.defineProperty(factory, i, {
          enumerable: factory.propertyIsEnumerable(i),
          configurable: false,
          value: boundFn
        });

      })(i, factory[i]);
    }

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
          if (instances[algorithm]) return instances[algorithm];
          var helper = instances[normalize(algorithm)];
          if (helper) return instances[algorithm] = helper;
          throw new Error("'" + algorithm + "' not in [" + names + "]");
        }
      }
    });
  }

  return HelperFactory;

});
