'use strict';

Esquire.define('bletchley/ciphers/RSAKey', [ 'bletchley/utils/ASN1', 'bletchley/utils/BigInteger', 'bletchley/utils/arrays' ], function(ASN1, BigInteger, arrays) {

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

  /* ======================================================================== */

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
   |  +--> BIT STRING / OCTET STRING                                          |
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
    if (asn1.sub[2].sub[0].sub[3].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");
    if (asn1.sub[2].sub[0].sub[4].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");
    if (asn1.sub[2].sub[0].sub[5].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");
    if (asn1.sub[2].sub[0].sub[6].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");
    if (asn1.sub[2].sub[0].sub[7].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");
    if (asn1.sub[2].sub[0].sub[8].typeName() != "INTEGER") throw new Error("ASN.1 format error: E");

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
   |  +--> BIT STRING / OCTET STRING                                          |
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

  return RSAKey;

});
