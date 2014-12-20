'use strict';

Esquire.define('bletchley/blocks/Receiver', [ 'bletchley/utils/classes' ],

  function(classes) {

    function Receiver() {
      /* Lock all our functions */
      classes.lock(this);
    }

    Receiver.prototype.push = function(buffer, last) {
      throw new Error("Not implelemented");
    }

    /* Receiver extends Object */
    return classes.extend(Receiver);

  }
);
