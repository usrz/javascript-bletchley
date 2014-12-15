'use strict';

Esquire.define('bletchley/keys/RSAKeyFactory', [ 'bletchley/keys/KeyFactory',
                                                 'bletchley/keys/RSAKey',
                                                 'bletchley/random/Random',
                                                 'bletchley/utils/BigInteger' ],
  function(KeyFactory, RSAKey, Random, BigInteger) {

    /* ====================================================================== *
     * Key genration from random bits                                         *
     * ====================================================================== */

    function generate(random, bits, e) {

      /* Assume E is always Fermat's 4th prime */
      if (!e) e = BigInteger.fromInt(0x10001);
      else if (typeof(e) === 'number') e = BigInteger.fromInt(e);
      else throw new Error("Public exponent must be a number");

      /* Cowardly refuse to generate keys smaller than 512 bits (OEAP) */
      if (typeof(bits) !== 'number') throw new Error("Key size must be a number");
      if (bits < 512) throw new Error("Key size must be at least 512 bits");

      /* P and Q sizes */
      var qs = bits >> 1;
      var ps = bits - qs;

      /* Variables */
      var p;
      var q;

      for(;;) {

        /* Find prime integer P */
        for(;;) {
          p = BigInteger.fromNumber(ps, 1, random);
          if ((p.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) == 0)
              && p.isProbablePrime(10)) break;
        }

        /* Find prime integer Q */
        for(;;) {
          q = BigInteger.fromNumber(qs, 1, random);
          if ((q.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) == 0)
              && q.isProbablePrime(10)) break;
        }

        /* Swap to get P > Q */
        if(p.compareTo(q) <= 0) {
          var t = p;
          p = q;
          q = t;
        }

        /* P-1 and Q-1 to calculate PHI -> D */
        var p1 = p.subtract(BigInteger.ONE);
        var q1 = q.subtract(BigInteger.ONE);
        var phi = p1.multiply(q1);
        if (phi.gcd(e).compareTo(BigInteger.ONE) == 0) {
          var n = p.multiply(q);
          var d = e.modInverse(phi);
          return new RSAKey(n, e, d, p, q);
        }
      }
    };

    /* ====================================================================== */

    function RSAKeyFactory(random) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      this.generateKey = function(bits, params) {
        var e = (params && params.e);
        return generate(random, bits, e);
      }

      KeyFactory.call(this, "RSA");
    };

    RSAKeyFactory.prototype = Object.create(KeyFactory.prototype);
    RSAKeyFactory.prototype.constructor = RSAKeyFactory;

    RSAKeyFactory.prototype.importKey   = function(bits, params) { throw new Error("RSAKeyFactory 'importKey' not implemented") }

    return RSAKeyFactory;

  }
);
