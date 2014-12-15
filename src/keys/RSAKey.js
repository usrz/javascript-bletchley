'use strict';

Esquire.define('bletchley/keys/RSAKey', [ 'bletchley/utils/ASN1', 'bletchley/utils/BigInteger', 'bletchley/utils/arrays' ], function(ASN1, BigInteger, arrays) {

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

    /* We must have a modulus N */
    if (n == null) {
      if ((p == null) && (q == null)) {
        throw new Error("Invalid RSA key: N or P and Q must be specified");
      } else {
        n = p.multiply(q);
      }
    }

    /*
     * Calculate bit length and block size
     * The BigInteger.byteLength() function does a different calculation:
     *
     *   (bitLength() >> 3 ) + 1
     *
     * Here, we don't want to prepend a 0 byte if the first bit in the first
     * byte is "1", as we don't work with negative integers...
     */
    var bitLength = n.bitLength();
    var blockSize = (bitLength + 7) >> 3;

    /* Our properties */
    Object.defineProperties(this, {
      'bitLength': { enumerable: true, configurable: false, value: bitLength },
      'blockSize': { enumerable: true, configurable: false, value: blockSize },
      'n': { enumerable: true, configurable: false, value: n },
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
      }}
    });
  }

  /* ======================================================================== */

  RSAKey.generate = function(random, bits, e) {

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

  /* ======================================================================== *
   * Some rough ASN.1 DER decoding and encoding utilities: really bare bones! *
   * ======================================================================== */

  var asn1RSAOID = new Uint8Array([0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01]);
  var asn1ZERO   = new Uint8Array([0x02, 0x01, 0x00]);
  var asn1NULL   = new Uint8Array([0x05, 0x00]);

  var asn1Buffer = new Uint8Array(4096);

  function getASNBigInteger(asn1, field) {
    if (asn1 == null) {
      throw new Error("ASN.1 format error: null field " + field);
    }

    var type = asn1.typeName();
    if (type == "NULL") return null;
    if (type != "INTEGER") {
      throw new Error("ASN.1 format error: invalid type '" + type + "' for field " + field);
    }

    var length = asn1.toUint8Array(asn1Buffer);

    /* Zero length (odd) and an integer "0" could mean field not available */
    if ((length == 0) || ((length == 1) && (asn1Buffer[0] == 0))) return null;

    /* Keep only the bytes we need and return the number */
    return  BigInteger.fromArray(1, asn1Buffer.subarray(0, length));
  }

  function fillASNBuffer(tag, length, callback) {
    if (length < 127) {
      // 02, len, bytes...
      var buf = new Uint8Array(length + 2);
      buf[0] = tag;
      buf[1] = length;
      callback(buf.subarray(2));
      return buf;

    } else if (length < 256) {
      // 02, 0x81, len, bytes...
      var buf = new Uint8Array(length + 3);
      buf[0] = tag;
      buf[1] = 0x81
      buf[2] = length;
      callback(buf.subarray(3));
      return buf;

    } else if (length < 65536) {
      // 02, 0x82, len[hi], len[lo], bytes...
      var buf = new Uint8Array(length + 4);
      buf[0] = tag;
      buf[1] = 0x82
      buf[2] = (length >>> 8) & 0xFF;
      buf[3] = length & 0xFF;
      callback(buf.subarray(4));
      return buf;

    } else {
      throw new Error("Too big, I give up!");
    }
  }

  function toASNNumber(number) {
    /* This might sound strange, but for undefined RSA parameters we return 0 */
    if (number == null) return asn1ZERO;
    /* Convert to a BigInteger if necessary */
    if (typeof(number) === 'number') number = BigInteger.fromInt(number);
    /* Check the type and process the number */
    if (number instanceof BigInteger) {
      if (number.equals(BigInteger.ZERO)) return asn1ZERO;
      var length = number.byteLength();
      return fillASNBuffer(0x02, length, function(buffer) {
        number.toUint8Array(buffer);
      });
    }
    /* Fail miserably */
    throw new Error("Must specify a number or BigInteger");
  }

  function toASNSequence() {
    var length = 0;
    var members = new Array();
    for (var i = 0; i < arguments.length; i ++) {
      if (arguments[i] instanceof Uint8Array) {
        length += arguments[i].length;
        members.push(arguments[i]);
      } else {
        throw new Error("Array at argument " + (i + 1) + " is not a Uint8Array");
      }
    }

    return fillASNBuffer(0x30, length, function(buffer) {
      var offset = 0;
      for (var i = 0; i < members.length; i ++) {
        buffer.set(members[i], offset);
        offset += members[i].length;
      }
    });
  }

  function toASNBitString(array) {
    if (array instanceof Uint8Array) {
      return fillASNBuffer(0x03, array.length + 1, function(buffer) {
        buffer[0] = 0; // we only deal with octets, so forget "missing" bits...
        buffer.set(array, 1);
      });
    }
    throw new Error("Array at argument " + (i + 1) + " is not a Uint8Array");
  }

  function toASNOctetString(array) {
    if (array instanceof Uint8Array) {
      return fillASNBuffer(0x04, array.length, function(buffer) {
        buffer.set(array);
      });
    }
    throw new Error("Array at argument " + (i + 1) + " is not a Uint8Array");
  }

  /* ======================================================================== *
   | Parse PKCS#8 private key from ASN.1 (Lapo is a God)                      |
   | https://polarssl.org/kb/cryptography/asn1-key-structures-in-der-and-pem  |
   |                                                                          |
   | SEQUENCE                                                                 |
   |  |                                                                       |
   |  +--> INTEGER = 0 (version)                                              |
   |  |                                                                       |
   |  +--> SEQUENCE                                                           |
   |  |     |                                                                 |
   |  |     +--> OID = 1.2.840.113549.1.1.1 (RSA encryption)                  |
   |  |     +--> NULL  (pkcs#8 algorithm parameters)                          |
   |  |                                                                       |
   |  +--> OCTET STRING                                                       |
   |        |                                                                 |
   |        +--> SEQUENCE                                                     |
   |              |                                                           |
   |              +--> INTEGER = 0 (version)                                  |
   |              +--> INTEGER = ...big... (N)                                |
   |              +--> INTEGER = ..small.. (E)                                |
   |              +--> INTEGER = ...big... (D)                                |
   |              +--> INTEGER = ...big... (P)                                |
   |              +--> INTEGER = ...big... (Q)                                |
   |              +--> INTEGER = ...big... (DMP1)                             |
   |              +--> INTEGER = ...big... (DMQ1)                             |
   |              +--> INTEGER = ...big... (COEFF)                            |
   |                                                                          |
   * ======================================================================== */

  RSAKey.parsePrivate = function(array) {
    var asn1 = ASN1.decode(arrays.toUint8Array(array));

    /* Basic container */
    if (asn1.typeName() != "SEQUENCE") throw new Error("ASN.1 format error: 1");
    if (asn1.sub.length < 3)           throw new Error("ASN.1 format error: 2");

    /* Version */
    if (asn1.sub[0].typeName() != "INTEGER") throw new Error("ASN.1 format error: 3");
    if (asn1.sub[0].content() != "0")        throw new Error("ASN.1 format error: Unknown X.509 version");

    /* Alogrithm OID and parameters sequence */
    if (asn1.sub[1].typeName() != "SEQUENCE") throw new Error("ASN.1 format error: 4");
    if (asn1.sub[1].sub.length < 1)           throw new Error("ASN.1 format error: 5");

    /* Validate the OID of our algorithm */
    if (asn1.sub[1].sub[0].typeName() != "OBJECT_IDENTIFIER")   throw new Error("ASN.1 format error: 5");
    if (asn1.sub[1].sub[0].content() != "1.2.840.113549.1.1.1") throw new Error("ASN.1 format error: Not an RSA key");

    // /* Get the sub-sequence parsed from the BIT STRING / OCTET STRING */
    if (asn1.sub[2].sub.length != 1)                 throw new Error("ASN.1 format error: 6");
    if (asn1.sub[2].sub[0].typeName() != "SEQUENCE") throw new Error("ASN.1 format error: 7");
    if (asn1.sub[2].sub[0].sub.length < 3)           throw new Error("ASN.1 format error: 8");
    if (asn1.sub[2].sub[0].sub[0].content() != "0")  throw new Error("ASN.1 format error: Unknown RSA key version");

    /* Check our types */
    if (asn1.sub[2].sub[0].sub[1].typeName() != "INTEGER") throw new Error("ASN.1 format error: N");
    if (asn1.sub[2].sub[0].sub[2].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");
    if (asn1.sub[2].sub[0].sub[3].typeName() != "INTEGER") throw new Error("ASN.1 format error: D");
    if (asn1.sub[2].sub[0].sub[4].typeName() != "INTEGER") throw new Error("ASN.1 format error: P");
    if (asn1.sub[2].sub[0].sub[5].typeName() != "INTEGER") throw new Error("ASN.1 format error: Q");
    if (asn1.sub[2].sub[0].sub[6].typeName() != "INTEGER") throw new Error("ASN.1 format error: DMP1");
    if (asn1.sub[2].sub[0].sub[7].typeName() != "INTEGER") throw new Error("ASN.1 format error: DMQ1");
    if (asn1.sub[2].sub[0].sub[8].typeName() != "INTEGER") throw new Error("ASN.1 format error: COEFF");

    /* Get a hold on our N, E, P, Q, DMP1, DMQ1 and COEFF and create the key */
    return new RSAKey(getASNBigInteger(asn1.sub[2].sub[0].sub[1], "N"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[2], "E"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[3], "D"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[4], "P"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[5], "Q"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[6], "DMP1"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[7], "DMQ1"),
                      getASNBigInteger(asn1.sub[2].sub[0].sub[8], "COEFF"));
  };

  RSAKey.prototype.encodePrivate = function() {
    if (this.d == null) throw new Error("No private exponent");
    return toASNSequence(
        asn1ZERO,
        toASNSequence(
          asn1RSAOID,
          asn1NULL
        ),
        toASNOctetString(
          toASNSequence(
            asn1ZERO,
            toASNNumber(this.n),
            toASNNumber(this.e),
            toASNNumber(this.d),
            toASNNumber(this.p),
            toASNNumber(this.q),
            toASNNumber(this.dmp1),
            toASNNumber(this.dmq1),
            toASNNumber(this.coeff)
          )
        )
      );
  };

  /* ======================================================================== *
   | Parse X.509 ("spki") public key from ASN.1 (Lapo is a genius)            |
   | https://polarssl.org/kb/cryptography/asn1-key-structures-in-der-and-pem  |
   |                                                                          |
   | SEQUENCE                                                                 |
   |  |                                                                       |
   |  +--> SEQUENCE                                                           |
   |  |     |                                                                 |
   |  |     +--> OID = 1.2.840.113549.1.1.1 (RSA encryption)                  |
   |  |     +--> NULL  (pkcs#8 algorithm parameters)                          |
   |  |                                                                       |
   |  +--> BIT STRING                                                         |
   |        |                                                                 |
   |        +--> SEQUENCE                                                     |
   |              |                                                           |
   |              +--> INTEGER = ...big... (N)                                |
   |              +--> INTEGER = ..small.. (E)                                |
   |                                                                          |
   * ======================================================================== */

  RSAKey.parsePublic = function(array) {
    var asn1 = ASN1.decode(arrays.toUint8Array(array));

    /* Basic container */
    if (asn1.typeName() != "SEQUENCE") throw new Error("ASN.1 format error: 1");
    if (asn1.sub.length < 2)           throw new Error("ASN.1 format error: 2");

    /* Alogrithm OID and parameters sequence */
    if (asn1.sub[0].typeName() != "SEQUENCE") throw new Error("ASN.1 format error: 3");
    if (asn1.sub[0].sub.length < 1)           throw new Error("ASN.1 format error: 4");

    /* Validate the OID of our algorithm */
    if (asn1.sub[0].sub[0].typeName() != "OBJECT_IDENTIFIER")   throw new Error("ASN.1 format error: 5");
    if (asn1.sub[0].sub[0].content() != "1.2.840.113549.1.1.1") throw new Error("ASN.1 format error: Not an RSA key");

    /* Get the sub-sequence parsed from the BIT STRING / OCTET STRING */
    if (asn1.sub[1].sub.length != 1)                 throw new Error("ASN.1 format error: 6");
    if (asn1.sub[1].sub[0].typeName() != "SEQUENCE") throw new Error("ASN.1 format error: 7");
    if (asn1.sub[1].sub[0].sub.length < 2)           throw new Error("ASN.1 format error: 8");

    /* Get a hold on our N and E and create the key */
    return new RSAKey(getASNBigInteger(asn1.sub[1].sub[0].sub[0], "N"),
                      getASNBigInteger(asn1.sub[1].sub[0].sub[1], "E"));
  };

  RSAKey.prototype.encodePublic = function() {
    if (this.e == null) throw new Error("No private exponent");
    return toASNSequence(
        toASNSequence(
          asn1RSAOID,
          asn1NULL
        ),
        toASNBitString(
          toASNSequence(
            toASNNumber(this.n),
            toASNNumber(this.e)
          )
        )
      );
  };

  return RSAKey;

});
