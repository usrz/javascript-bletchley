'use strict';

Esquire.define('bletchley/ciphers/RSAKey', [ 'bletchley/utils/BigInteger', 'bletchley/utils/arrays' ], function(BigInteger, arrays) {

  function parseBigInt(x) {
    if (x == null) return null;
    if (x instanceof BigInteger) return x;
    if (typeof(x) === 'number') return BigInteger.fromInt(x);
    if (typeof(x) === 'string') return BigInteger.fromString(x, 16);

    /* From arrays: we're always dealing with POSITIVE numbers */
    if (x instanceof Uint8Array) return BigInteger.fromArray(1, x);
    if (Array.isArray(x)) return BigInteger.fromArray(1, x);
    return  BigInteger.fromArray(1, arrays.toUint8Array(x));
  }

  function RSAKey(N, E, D, P, Q, DMP1, DMQ1, COEFF) {

    var n     = parseBigInt(N);
    var e     = parseBigInt(E);
    var d     = parseBigInt(D);
    var p     = parseBigInt(P);
    var q     = parseBigInt(Q);
    var dmp1  = parseBigInt(DMP1);
    var dmq1  = parseBigInt(DMQ1);
    var coeff = parseBigInt(COEFF);

    if ((n == null) && ((p == null) || (q == null))) {
      throw new Error("Invalid RSA key: N, P or Q must be specified");
    }

    /* Normalize E to a number */
    if (e != null) {
      if (e.bitLength() > 52) {
        throw new Error("Invalid RSA key: E is greater than 52 bits");
      } else {
        e = parseInt(e.toString(16), 16);
      }
    }

    /* We must have the public and/or private exponent */
    if ((e == null) && (d == null)) {
      throw new Error("Invalid RSA key: E or D must be specified");
    }

    Object.defineProperties(this, {
      'n': { enumerable: true, configurable: false, get: function() {
        if (n != null) return n;
        return n = p.multiply(q);
      }},
      'e': { enumerable: true, configurable: false, value: e },
      'd': { enumerable: true, configurable: false, value: d },
      'p': { enumerable: true, configurable: false, get: function() {
        if (p != null) return p;
        if (q == null) return null;
        return p = n.divide(q);
      }},
      'q': { enumerable: true, configurable: false, get: function() {
        if (q != null) return q;
        if (p == null) return null;
        return q = n.divide(p);
      }},
      'dmp1': { enumerable: true, configurable: false, get: function() {
        if (dmp1 != null) return dmp1;
        if (d == null) return null;
        if (this.p == null) return null;
        var p1 = p.subtract(BigInteger.ONE);
        return dmp1 = d.mod(p1);
      }},
      'dmq1': { enumerable: true, configurable: false, get: function() {
        if (dmq1 != null) return dmq1;
        if (d == null) return null;
        if (this.q == null) return null;
        var q1 = q.subtract(BigInteger.ONE);
        return dmq1 = d.mod(q1);
      }},
      'coeff': { enumerable: true, configurable: false, get: function() {
        if (coeff != null) return coeff;
        if (this.p == null) return null;
        if (this.q == null) return null;
        return coeff = this.q.modInverse(this.p);
      }},
      'bitLength': { enumerable: false, configurable: false, value: function() {
        return this.n.bitLength();
      }}
    });
  }

  return RSAKey;

});
