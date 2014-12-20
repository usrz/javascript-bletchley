'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/arrays',
                                            'bletchley/codecs',
                                            'bletchley/utils/classes',
                                            'bletchley/random/Random',
                                            'bletchley/random/SecureRandom',
                                            'bletchley/ciphers/Ciphers',
                                            'bletchley/keys/KeyManager',
                                            'bletchley/hashes/Hashes',
                                            'bletchley/hmacs/HMACs',
                                            'bletchley/kdfs/KDFs' ],
  function(arrays, codecs, classes, Random, SecureRandom, Ciphers, KeyManager, Hashes, HMACs, KDFs) {

    return function Crypto(random) {
      if (! random) {
        random = new SecureRandom();
      } else if (!(random instanceof Random)) {
        throw new Error("Must be constructed with a Random instance");
      }

      var keys = new KeyManager(random);
      var ciphers = new Ciphers(random);
      var hashes = new Hashes();
      var hmacs = new HMACs();
      var kdfs = new KDFs();

      Object.defineProperties(this, {
        "random":      { enumerable: true, configurable: true, value: random.nextBytes  },

        "stringify":   { enumerable: true, configurable: true, value: arrays.decodeUTF8 },
        "encode":      { enumerable: true, configurable: true, value: codecs.encode     },
        "decode":      { enumerable: true, configurable: true, value: codecs.decode     },

        "importKey":   { enumerable: true, configurable: true, value: keys.importKey    },
        "generateKey": { enumerable: true, configurable: true, value: keys.generateKey  },

        "encrypt":     { enumerable: true, configurable: true, value: ciphers.encrypt   },
        "decrypt":     { enumerable: true, configurable: true, value: ciphers.decrypt   },

        "hash":        { enumerable: true, configurable: true, value: function() { return hashes.hash.apply(hashes, arguments) } },
        "hmac":        { enumerable: true, configurable: true, value: function() { return hmacs.hmac.apply(hmacs, arguments) } },
        "kdf":         { enumerable: true, configurable: true, value: kdfs.kdf          }
      });

      classes.bind(this);
    };

  }
);
