'use strict';

Esquire.define('bletchley/utils/HelperFactory', [ 'bletchley/utils/classes',
                                                  'bletchley/utils/Helper' ],
function(classes, Helper) {

  function normalize(name) {
    if (!name) throw new Error("Algorithm name not specified");
    if (typeof(name) !== 'string') throw new Error("Invalid algorithm name '" + name + "'");
    return name.replace(/[-\s]/g,'').toUpperCase();
  }

  function HelperFactory(factory) {
    var instances = {};

    if (typeof(factory) !== 'function') {
      throw new Error("Helper factory must be a function");
    }

    /* Our helper getter */
    var algorithms = Object.keys(instances);
    Object.defineProperties(this, {
      "$helper": {
        enumerable: false,
        configurable: false,
        value: function(algorithm) {
          /* See if we have something in cache */
          if (instances[algorithm]) return instances[algorithm];

          /* Normalize and try again */
          var normalized = normalize(algorithm);
          if (normalized != algorithm) {
            return instances[algorithm] = this.$helper(normalized);
          }

          /* Algorithm and normalized are the same, see if we can create */
          var instance = factory(algorithm);
          if (instance) return instances[algorithm] = factory(algorithm);

          /* Can't create? Bummer! */
          throw new Error("Unknown algorithm '" + algorithm + "'");
        }
      }
    });

    /* Bind and lock functions */
    classes.bind(this);
  }

  /* Return our class */
  return HelperFactory;

});
