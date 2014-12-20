'use strict';

Esquire.define('bletchley/kdfs/KDF', ['bletchley/utils/classes',
                                      'bletchley/utils/arrays'],

  function(classes, arrays) {

    function KDF(name) {
      /* Lock our functions */
      classes.lock(this);
    };

    /* KDF extends Object */
    return classes.extend(KDF);

  }
);
