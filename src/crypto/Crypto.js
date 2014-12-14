'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/arrays',
                                            'bletchley/random/Random',
                                            'bletchley/random/SecureRandom',
                                            'bletchley/ciphers/Ciphers',
                                            'bletchley/codecs/Codecs',
                                            'bletchley/hashes/Hashes',
                                            'bletchley/hmacs/HMACs',
                                            'bletchley/kdfs/KDFs' ],
  function(arrays, Random, SecureRandom, Ciphers, Codecs, Hashes, HMACs, KDFs) {

    return function Crypto(random) {
      if (! random) {
        random = new SecureRandom();
      } else if (!(random instanceof Random)) {
        throw new Error("Must be constructed with a Random instance");
      }

      var ciphers = new Ciphers(random);
      var codecs = new Codecs();
      var hashes = new Hashes();
      var hmacs = new HMACs();
      var kdfs = new KDFs();

      Object.defineProperties(this, {
        "random":    { enumerable: true, configurable: false, value: random.nextBytes  },
        "stringify": { enumerable: true, configurable: false, value: arrays.decodeUTF8 },
        "encode":    { enumerable: true, configurable: false, value: codecs.encode     },
        "decode":    { enumerable: true, configurable: false, value: codecs.decode     },
        "encrypt":   { enumerable: true, configurable: false, value: ciphers.encrypt   },
        "decrypt":   { enumerable: true, configurable: false, value: ciphers.decrypt   },
        "hash":      { enumerable: true, configurable: false, value: hashes.hash       },
        "hmac":      { enumerable: true, configurable: false, value: hmacs.hmac        },
        "kdf":       { enumerable: true, configurable: false, value: kdfs.kdf          }
      });
    };

  }
);
