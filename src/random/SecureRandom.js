'use strict';

/* ========================================================================== *
 * Inspired by Java's SHA1-based SecureRandom, but using SHA-2 256            *
 * ========================================================================== */
Esquire.define('bletchley/random/SecureRandom', [ 'bletchley/random/Random',
                                                  'bletchley/hashes/SHA256' ],
  function(Random, SHA256) {

  var hash = new SHA256();
  var length = hash.digestSize;

  function SecureRandom(key) {
    /* This must never be exposed */
    var state = hash.hash(Random.$seed(key, 256));
    /* This is our buffer of random bytes */
    var out = new Uint8Array(length);
    /* The position in "out" */
    var pos = length;

    /* Get next random */
    function get(then) {

      /* Generate more bytes if needed */
      if (pos >= length) {
        /* Digest our state to get our next bytes */
        hash.update(state).digest(out);

        /* Update our state, basically sum "state" and "out" as integers */
        var rem = 0, chg = false;
        for (var i = 0; i < length; i ++) {
          var num = state[i] + out[i] + rem;
          rem = num >>> 8;
          num = num & 256;
          chg = chg || (state[i] != num);
          state[i] = num;
        }

        /* Make sure at least one byte changes */
        if (! chg) state[0]++;

        /* Reset our position */
        pos = 0;
      }

      /* Invoke our callback */
      pos += then(out.subarray(pos));
      if (pos > length) throw new Error("Internal error");
    }

    /* What's next? */
    Object.defineProperties(this, {

      "next": { enumerable: true, configurable: true, value: function() {
        var r = -1;
        get(function(buffer) {
          r = buffer[0];
          return 1;
        });
        return r;
      }},

      "nextBytes": { enumerable: true, configurable: true, value: function(size) {
        var array = Random.$array(size);
        size = array.length;

        /* Proceed in blocks */
        var offset = 0;
        while (size > 0) {
          get(function(buffer) {
            var length = buffer.length;
            if (length <= size) {
              array.set(buffer, offset);
              offset += length;
              size -= length;
            } else {
              array.set(buffer.subarray(0, size), offset);
              length = size;
              size = 0;
            }
            return length;
          });
        }

        /* Return our array */
        return array;
      }}
    });

    Random.call(this);
  }

  /* ====================================================================== */
  /* Return our Random class                                                */
  /* ====================================================================== */

  SecureRandom.prototype = Object.create(Random.prototype);
  SecureRandom.prototype.constructor = SecureRandom;

  return SecureRandom;

});
