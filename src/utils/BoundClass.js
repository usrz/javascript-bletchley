'use strict';

Esquire.define('bletchley/utils/BoundClass', [], function() {

  function BoundClass() {

    /* Bind and lock our functions */
    var instance = this;
    for (var i in instance) {
      (function(i, fn) {
        if (typeof(fn) !== 'function') return;

        /* Try to use native "bind" if possible */
        var boundFn = typeof(fn.bind) !== 'function' ?
                    function() { return fn.apply(instance, arguments); } :
                    fn.bind(instance);

        /* Redefine and lock our function */
        Object.defineProperty(instance, i, {
          enumerable: instance.propertyIsEnumerable(i),
          configurable: false,
          value: boundFn
        });

      })(i, instance[i]);
    }

  }

  return BoundClass;

});
