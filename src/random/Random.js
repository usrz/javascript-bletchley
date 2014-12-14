'use strict';

/* ========================================================================== *
 * Port of Tom Wu's "rng.js" and "prng4.js".                                  *
 * -------------------------------------------------------------------------- *
 * Original source at: http://www-cs-students.stanford.edu/~tjw/jsbn/         *
 * Licensed under BSD: http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE  *
 * ========================================================================== */
Esquire.define('bletchley/random/Random', [ 'bletchley/utils/BoundClass',
                                           'bletchley/utils/arrays',
                                           '$global/crypto' ],
  function(BoundClass, arrays, crypto) {

    function Random() {
      BoundClass.call(this);
    }

    /* ====================================================================== */
    /* Return our Random class                                                */
    /* ====================================================================== */

    Random.prototype = Object.create(BoundClass.prototype);
    Random.prototype.constructor = Random;

    Random.prototype.next = function() {
      throw new Error("Random not implemented");
    }

    Random.prototype.nextBytes = function(size) {
      var array;

      if (typeof(size) === 'number') {
        if (size < 1) throw new RangeError("Size must be a positive integer");
        var array = new Uint8Array(size);
      } else if (size instanceof Uint8Array) {
        array = size;
      } else {
        throw new TypeError("Parameter must be a number or Uint8Array");
      }

      size = array.length;
      for (var i = 0; i < size; i ++) array[i] = this.next();
      return array;
  };

    return Random;

  }
);
