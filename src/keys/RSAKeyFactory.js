'use strict';

Esquire.define('bletchley/keys/RSAKeyFactory', [ 'bletchley/keys/KeyFactory',
                                                 'bletchley/keys/RSAKey',
                                                 'bletchley/random/Random',
                                                 'bletchley/utils/ASN1',
                                                 'bletchley/utils/BigInteger',
                                                 'bletchley/utils/arrays' ],
  function(KeyFactory, RSAKey, Random, ASN1, BigInteger, arrays) {

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


    /* ====================================================================== *
     * Some rogh ASN.1 DER decoding utilities: really bare bones!             *
     * ====================================================================== */

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

    /* ====================================================================== *
     | Parse PKCS#8 ("pkcs8") private key from ASN.1 (Lapo is a God)          |
     | http://polarssl.org/kb/cryptography/asn1-key-structures-in-der-and-pem |
     |                                                                        |
     | SEQUENCE                                                               |
     |  |                                                                     |
     |  +--> INTEGER = 0 (version)                                            |
     |  |                                                                     |
     |  +--> SEQUENCE                                                         |
     |  |     |                                                               |
     |  |     +--> OID = 1.2.840.113549.1.1.1 (RSA encryption)                |
     |  |     +--> NULL  (pkcs#8 algorithm parameters)                        |
     |  |                                                                     |
     |  +--> OCTET STRING                                                     |
     |        |                                                               |
     |        +--> SEQUENCE                                                   |
     |              |                                                         |
     |              +--> INTEGER = 0 (version)                                |
     |              +--> INTEGER = ...big... (N)                              |
     |              +--> INTEGER = ..small.. (E)                              |
     |              +--> INTEGER = ...big... (D)                              |
     |              +--> INTEGER = ...big... (P)                              |
     |              +--> INTEGER = ...big... (Q)                              |
     |              +--> INTEGER = ...big... (DMP1)                           |
     |              +--> INTEGER = ...big... (DMQ1)                           |
     |              +--> INTEGER = ...big... (COEFF)                          |
     |                                                                        |
     * ====================================================================== */

    function parsePrivate(asn1) {

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

    /* ====================================================================== *
     | Parse X.509 ("spki") public key from ASN.1 (Lapo is a genius)          |
     | http://polarssl.org/kb/cryptography/asn1-key-structures-in-der-and-pem |
     |                                                                        |
     | SEQUENCE                                                               |
     |  |                                                                     |
     |  +--> SEQUENCE                                                         |
     |  |     |                                                               |
     |  |     +--> OID = 1.2.840.113549.1.1.1 (RSA encryption)                |
     |  |     +--> NULL  (pkcs#8 algorithm parameters)                        |
     |  |                                                                     |
     |  +--> BIT STRING                                                       |
     |        |                                                               |
     |        +--> SEQUENCE                                                   |
     |              |                                                         |
     |              +--> INTEGER = ...big... (N)                              |
     |              +--> INTEGER = ..small.. (E)                              |
     |                                                                        |
     * ====================================================================== */

    function parsePublic(asn1) {

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

    /* ====================================================================== */

    function RSAKeyFactory(random) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      this.generateKey = function(bits, params) {
        var e = (params && params.e);
        return generate(random, bits, e);
      }

      this.importKey = function(data, params) {
        var asn1 = ASN1.decode(arrays.toUint8Array(data));

        if (asn1.typeName() != "SEQUENCE") throw new Error("ASN.1 format error: expected SEQUENCE instead of " + asn1.typeName());
        if (asn1.sub.length < 2)           throw new Error("ASN.1 format error: expected SEQUENCE of at least 2 members");

        var t = asn1.sub[0].typeName();
        var c = asn1.sub[0].content();

        if ((t == 'INTEGER') && (c == '0')) { // PKCS#8
          return parsePrivate(asn1);
        } else if (t == 'SEQUENCE') { // X.509
          return parsePublic(asn1);
        } else {
          throw new Error("ASN.1 format error: unknown format");
        }
      }

      KeyFactory.call(this, "RSA");
    };

    RSAKeyFactory.prototype = Object.create(KeyFactory.prototype);
    RSAKeyFactory.prototype.constructor = RSAKeyFactory;

    RSAKeyFactory.prototype.importKey   = function(bits, params) { throw new Error("RSAKeyFactory 'importKey' not implemented") }

    return RSAKeyFactory;

  }
);
