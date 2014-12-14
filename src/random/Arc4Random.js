'use strict';

/* ========================================================================== *
 * Port of Tom Wu's "rng.js" and "prng4.js".                                  *
 * -------------------------------------------------------------------------- *
 * Original source at: http://www-cs-students.stanford.edu/~tjw/jsbn/         *
 * Licensed under BSD: http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE  *
 * ========================================================================== */
Esquire.define('bletchley/random/Arc4Random', [ 'bletchley/random/Random' ], function(Random) {

  /* Arcfour PRNG */
  function Arc4Random(key) {

    /* Initialize arcfour context from key */
    var S = (function(key) {
      /* Initialize arcfour context from key */
      var S = new Array(256);
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
    })(Random.$seed(key, 256));

    /* Initial pointers */
    var i = 0;
    var j = 0;

    /* What's next? */
    Object.defineProperties(this, {
      "next": { enumerable: true, configurable: true, value: function() {
        var t;
        i = (i + 1) & 255;
        j = (j + S[i]) & 255;
        t = S[i];
        S[i] = S[j];
        S[j] = t;
        return S[(t + S[i]) & 255];
      }}
    });

    /* RC4/skip1024 */
    this.nextBytes(1024);
    Random.call(this);
  }

  /* ====================================================================== */
  /* Return our Random class                                                */
  /* ====================================================================== */

  Arc4Random.prototype = Object.create(Random.prototype);
  Arc4Random.prototype.constructor = Arc4Random;

  return Arc4Random;

});
