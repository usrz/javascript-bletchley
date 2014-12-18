'use strict';

/* ========================================================================== *
 * Port of Tom Wu's "rng.js" and "prng4.js".                                  *
 * -------------------------------------------------------------------------- *
 * Original source at: http://www-cs-students.stanford.edu/~tjw/jsbn/         *
 * Licensed under BSD: http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE  *
 * ========================================================================== */
Esquire.define('bletchley/random/Random', ['bletchley/utils/classes',
                                           'bletchley/utils/arrays',
                                           '$global/crypto'],
  function(classes, arrays, crypto) {

    function Random() {
      classes.bind(this);
    }

    Object.defineProperties(Random, {

      /* Get or create an array of at least 1 byte for nextBytes() */
      "$array": { enumerable: false, configurable: false, value: function(size) {
        var array;

        if (typeof(size) === 'number') {
          var array = new Uint8Array(size);
        } else if (size instanceof Uint8Array) {
          array = size;
          size = array.length;
        } else {
          throw new TypeError("Parameter must be a number or Uint8Array");
        }

        if (size < 1) throw new RangeError("Size must be a positive integer");
        return array;
      }},

      /* Get a seed for initializing Random instances */
      "$seed": { enumerable: false, configurable: false, value: function(seed, length) {
        /* Pre seeded? */
        if (seed) {
          seed = arrays.toUint8Array(seed);
          if (seed.length >= length) return seed;
          throw new Error("At least " + length + " bytes required to seed Random");
        }

        /* Create a new seed */
        seed = new Uint8Array(length);

        /* If we have crypto.getRandomValues() use it */
        if (crypto && (typeof(crypto.getRandomValues) === 'function')) {
          var result = crypto.getRandomValues(seed);
          if (result) seed = result; // PhantomJS returns undefined
        } else {
          console.warn("Native 'crypto.getRandomValues(...)' support not available");
        }

        /* Mix in some initial Math.random() data */
        for (var i = 0; i < length; i ++) {
          seed[i] ^= Math.floor(Math.random() * 256) & 255;
        };

        /* Return our seed */
        return seed;
      }}
    });

    /* ====================================================================== */

    Random.prototype.next = function() {
      throw new Error("Random not implemented");
    }

    Random.prototype.nextBytes = function(size) {
      var array = Random.$array(size);
      size = array.length;
      for (var i = 0; i < size; i ++) array[i] = this.next();
      return array;
    };

    return Random;

  }
);
