'use strict';

Esquire.define('bletchley/utils/BoundClass', [], function() {

  function BoundClass() {

    /* Bind and lock our functions */
    for (var name in this) {

      /* Only bind enumerable functions */
      var fn = this[name];
      if (typeof(fn) !== 'function') continue;

      /* Bind the function */
      (function(instance, name, fn) {

        /* Try to use native "bind" if possible */
        var boundFn = typeof(fn.bind) !== 'function' ?
                    function() { return fn.apply(instance, arguments); } :
                    fn.bind(instance);

        /* Redefine and lock our function */
        Object.defineProperty(instance, name, {
          enumerable: true,
          configurable: false,
          value: boundFn
        });

      })(this, name, fn);
    }
  }

  return BoundClass;

});
