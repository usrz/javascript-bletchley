'use strict';

Esquire.define('bletchley/keys/RSAKey', [ 'bletchley/utils/classes',
                                          'bletchley/blocks/Receiver',
                                          'bletchley/blocks/Forwarder',
                                          'bletchley/utils/ASN1',
                                          'bletchley/utils/BigInteger',
                                          'bletchley/utils/arrays' ],
  function(classes, Receiver, Forwarder, ASN1, BigInteger, arrays) {

    /* ======================================================================== *
     * Some rough ASN.1 DER encoding utilities: really bare bones!              *
     * ======================================================================== */

    var asn1RSAOID = new Uint8Array([0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01]);
    var asn1ZERO   = new Uint8Array([0x02, 0x01, 0x00]);
    var asn1NULL   = new Uint8Array([0x05, 0x00]);

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
     | PKCS#8 (subtle crypto's "pkcs8") private key in ASN.1                    |
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

    function encodePrivate(key) {
      if (key.d == null) throw new Error("No private exponent");
      return toASNSequence(
          asn1ZERO,
          toASNSequence(
            asn1RSAOID,
            asn1NULL
          ),
          toASNOctetString(
            toASNSequence(
              asn1ZERO,
              toASNNumber(key.n),
              toASNNumber(key.e),
              toASNNumber(key.d),
              toASNNumber(key.p),
              toASNNumber(key.q),
              toASNNumber(key.dmp1),
              toASNNumber(key.dmq1),
              toASNNumber(key.coeff)
            )
          )
        );
    };

    /* ======================================================================== *
     | X.509 (subtle crypto's "spki") public key in ASN.1                       |
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

    function encodePublic(key) {
      if (key.e == null) throw new Error("No private exponent");
      return toASNSequence(
          toASNSequence(
            asn1RSAOID,
            asn1NULL
          ),
          toASNBitString(
            toASNSequence(
              toASNNumber(key.n),
              toASNNumber(key.e)
            )
          )
        );
    };

    /* ======================================================================== */

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

    /* ======================================================================== *
     * Encipher and decypher, need to protect N, E, and P!                      *
     * ======================================================================== */

    function RSAEncipher(receiver, key) {
      if (key.e == null) throw new Error("Key lacks public exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(message);
        var r = x.modPowInt(key.e, key.n);

        // Allocating an array here allows us to go without I2OSP
        var buffer = new Uint8Array(key.byteLength + 1); // always leading zero
        var offset = buffer.length - r.byteLength();
        r.toUint8Array(buffer.subarray(offset));

        // Always push the block of the correct size
        return this.$next(buffer.subarray(1), last);
      }
      Forwarder.call(this, receiver);
    }

    //RSAEncipher.prototype = Object.create(Forwarder.prototype);
    //RSAEncipher.prototype.constructor = RSAEncipher;
    classes.extend(RSAEncipher, Forwarder);

    /* ======================================================================= */

    function RSADecipher(receiver, key) {
      if (key.d == null) throw new Error("Key lacks private exponent");
      this.push = function(message, last) {
        // we could go in ECB mode and process many blocks, but for now fail
        // as most implementations simply refuse to encrypt multiple blocks
        if (!last) throw new Error("Message too big for RSA");

        var x = BigInteger.fromArray(1, message);
        var r = x.modPow(key.d, key.n);

        var buffer = new Uint8Array(key.byteLength + 1); // always leading zero
        var offset = buffer.length - r.byteLength();
        r.toUint8Array(buffer.subarray(offset));

        return this.$next(buffer.subarray(1), last);
        // return this.$next(r.toUint8Array(), last);
      }
      Forwarder.call(this, receiver);
    }

    //RSADecipher.prototype = Object.create(Forwarder.prototype);
    //RSADecipher.prototype.constructor = RSADecipher;
    classes.extend(RSADecipher, Forwarder);

    /* ======================================================================== *
     | Internal RSA key structure, will be wrapped by the KeyManager            |
     * ======================================================================== */

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
      var byteLength = (bitLength + 7) >> 3;

      /* Our properties */
      Object.defineProperties(this, {
        /* Basics */
        'algorithm':  { enumerable: true, configurable: false, value: 'RSA'      },
        'bitLength':  { enumerable: true, configurable: false, value: bitLength  },
        'byteLength': { enumerable: true, configurable: false, value: byteLength },

        /* Internals */
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
        }},

        /* Export, encipher and decipher */
        'export': { enumerable: true, configurable: false, value: function(format) {
          if (typeof(format) === 'string') format = format.toLowerCase();
          else throw new Error("Invalid format (must be a string)");

          if ((format == 'pkcs8') || (format == 'pkcs#8')) {
            if (this.d == null) throw new Error("Key lacks private exponent");
            return encodePrivate(this);
          } else if ((format == 'spki') || (format == 'x509') || (format == 'x.509')) {
            if (this.e == null) throw new Error("Key lacks public exponent");
            return encodePublic(this);
          } else {
            throw new Error("Invalid/unsupported format '" + format + "'");
          }
        }},
        'encipher': { enumerable: true, configurable: false, value: function(receiver) {
          if (!(receiver instanceof Receiver)) throw new Error("Invalid receiver");
          return new RSAEncipher(receiver, this);
        }},
        'decipher': { enumerable: true, configurable: false, value: function(receiver) {
          if (!(receiver instanceof Receiver)) throw new Error("Invalid receiver");
          return new RSADecipher(receiver, this);
        }}
      });
    }

    return RSAKey;

  });
