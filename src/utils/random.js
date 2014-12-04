'use strict';

Esquire.define('bletchley/utils/random', ['$global/crypto',
                                          'bletchley/utils/arrays'],
  function(crypto, arrays) {

    /* Arcfour PRNG */
    function Arcfour(key) {

      /* Initialize arcfour context from key */
      var S = (function(key) {
        if (key.length < 256) {
          throw new RangeError("Not enough bytes to initialize RC4 random");
        }

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
      })(arrays.toUint8Array(key));

      /* Initial pointers */
      var i = 0;
      var j = 0;

      /* What's next? */
      this.next = function() {
        var t;
        i = (i + 1) & 255;
        j = (j + S[i]) & 255;
        t = S[i];
        S[i] = S[j];
        S[j] = t;
        return S[(t + S[i]) & 255];
      }
    }

    /* Initialize our Arcfour PRNG */
    var arcfour;

    /* Reinitialize our random */
    function init(key) {
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
      };

      /* Actually, give us a RC4-drop1024 */
      var newArcfour = new Arcfour(key);
      for (var i = 0; i < 1024; i ++) newArcfour.next();
      arcfour = newArcfour;
    };

    /* Our "random()" function */
    function random(size) {
      if (typeof(size) !== 'number') throw new TypeError("Size must be a number");
      if (size < 1) throw new RangeError("Size must be a positive integer");
      if (! arcfour) init(); // lazy initialization
      var array = new Uint8Array(size);
      for (var i = 0; i < size; i ++) array[i] = arcfour.next();
      return array;
    }

    /* Return our "random()" and "init()" functions */
    return Object.freeze({
      random: random,
      init: init
    });

  }
);
