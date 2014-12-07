'use strict';

/* ========================================================================== *
 * Port of Tom Wu's "rng.js" and "prng4.js".                                  *
 * -------------------------------------------------------------------------- *
 * Original source at: http://www-cs-students.stanford.edu/~tjw/jsbn/         *
 * Licensed under BSD: http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE  *
 * ========================================================================== */
Esquire.define('bletchley/utils/Random', ['$global/crypto',
                                          'bletchley/utils/arrays'],
  function(crypto, arrays) {

    /* Arcfour PRNG */
    function Random(key) {

      /* Initialize arcfour context from key */
      var S = (function(key) {

        /* Create a key if none was specified */
        if (! key) {
          key = new Uint8Array(256);

          /* If we have crypto.getRandomValues() use it */
          if (crypto && (typeof(crypto.getRandomValues) === 'function')) {
            var result = crypto.getRandomValues(key);
            if (result) key = result; // PhantomJS returns undefined
          } else {
            console.warn("Native 'crypto.getRandomValues(...)' support not available");
          }

          /* Mix in some initial Math.random() data */
          for (var i = 0; i < 256;) {
            var x = Math.floor(Math.random() * 65536);
            key[i++] ^= x & 255;
            key[i++] ^= x >>  8;
          };
        }

        /* Validate the supplied key */
        else {
          key = arrays.toUint8Array(key);
          if (key.length < 256) {
            throw new RangeError("Not enough bytes to initialize RC4 random");
          }
        }

        /* Initialize arcfour context from key */
        var S = new Uint8Array(256);
        var i = 0;
        var j = 0;
        var t = 0;

        for(i = 0; i < 256; i ++) S[i] = i;
        for(i = 0; i < 256; ++i) {
          j = (j + S[i] + key[i]) & 255;
          t = S[i];
          S[i] = S[j];
          S[j] = t;
        }

        return S;
      })(key);

      /* Initial pointers */
      var i = 0;
      var j = 0;

      /* What's next? */
      var next = function() {
        var t;
        i = (i + 1) & 255;
        j = (j + S[i]) & 255;
        t = S[i];
        S[i] = S[j];
        S[j] = t;
        return S[(t + S[i]) & 255];
      }

      Object.defineProperty(this, "nextBytes", {
        enumerable: true,
        configurable: false,
        value: function(size) {
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
          for (var i = 0; i < size; i ++) array[i] = next();
          return array;
        }
      });

      /* RC4/skip1024 */
      this.nextBytes(1024);

    }

    /* ====================================================================== */
    /* Return our Random class                                                */
    /* ====================================================================== */

    /* Return our "random()" and "init()" functions */
    return Random;

  }
);
