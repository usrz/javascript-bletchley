'use strict';

Esquire.define('bletchley/codecs/Codec', [ 'bletchley/utils/classes' ],

  function(classes) {

    function Codec() {
      /* Lock all our functions */
      classes.lock(this);
    };

    Codec.prototype.encode = function() { throw new Error("Codec 'encode' not implemented") }
    Codec.prototype.decode = function() { throw new Error("Codec 'decode' not implemented") }

    /* Codec extends Object */
    return classes.extend(Codec);

  }
);
