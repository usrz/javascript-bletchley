'use strict';

Esquire.define('bletchley/keys/KeyManager', [ 'bletchley/utils/classes',
                                              'bletchley/ciphers/Ciphers',
                                              'bletchley/blocks/Forwarder',
                                              'bletchley/random/Random',
                                              'bletchley/keys/RSAKeyFactory',
                                              'bletchley/utils/HelperFactory' ],
  function(classes, Ciphers, Forwarder, Random, RSAKeyFactory, HelperFactory) {

    /* ====================================================================== */

    /* Wrapper for encipher/decipher */
    function CipherForwarder(receiver) {
      //if (!(receiver instanceof Receiver)) throw new Error("Invalid Receiver: " + receiver);

      Object.defineProperties(this, {
        push: { enumerable: true, configurable: true, value: function(message, last) {
          return this.$next(message, last);
        }}
      });

      Forwarder.call(this, receiver);
    }

    classes.extend(CipherForwarder, Forwarder);

    //CipherForwarder.

    // CipherForwarder.prototype = Object.create(Forwarder.prototype);
    // CipherForwarder.prototype.constructor = CipherForwarder;

    /* ====================================================================== */

    /* Wrapper for key */
    function Key(key, exportable) {
      if (! key) throw new Error("No key");

      Object.defineProperties(this, {

        'algorithm':  { enumerable: true, configurable: false, value: key.algorithm },
        'bitLength':  { enumerable: true, configurable: false, value: key.bitLength  },
        'byteLength': { enumerable: true, configurable: false, value: key.byteLength },

        'export': { enumerable: true, configurable: false, value: function(format) {
          if (exportable) return key.export(format);
          throw new Error("Key not exportable");
        }},

        'encipher': { enumerable: true, configurable: false, value: function(receiver) {
          return new CipherForwarder(key.encipher(receiver));
        }},

        'decipher': { enumerable: true, configurable: false, value: function(receiver) {
          return new CipherForwarder(key.decipher(receiver));
        }},

      });
    };

    /* ====================================================================== */

    function KeyManager(random) {
      if (!(random instanceof Random)) throw new Error("Invalid Random");

      /* Our properties */
      Object.defineProperties(this, {

        generateKey: { enumerable: true, configurable: true, value: function(algorithm, bits, params) {
          var key = this.$helper(algorithm).generateKey(bits, params);
          var exportable = true; // default, export generated keys
          if (params && params.hasOwnProperty(exportable)) {
            exportable = params.exportable && true || false;
          }
          return new Key(key, exportable);
        }},

        importKey: { enumerable: true, configurable: true, value: function(algorithm, data, params) {
          var key = this.$helper(algorithm).importKey(data, params);
          var exportable = false; // default, do not export imported keys
          if (params && params.hasOwnProperty(exportable)) {
            exportable = params.exportable && true || false;
          }
          return new Key(key, exportable);
        }}

      });

      /* Helpers */
      HelperFactory.call(this, function(algorithm) {
        if (algorithm === 'RSA') return new RSAKeyFactory(random);
      });
    }

    KeyManager.prototype = Object.create(HelperFactory.prototype);
    KeyManager.prototype.constructor = KeyManager;

    return KeyManager;

  }
);
