'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/arrays',
                                            'bletchley/codecs',
                                            'bletchley/random/Random',
                                            'bletchley/random/SecureRandom',
                                            'bletchley/ciphers/Ciphers',
                                            'bletchley/hashes/Hashes',
                                            'bletchley/hmacs/HMACs',
                                            'bletchley/kdfs/KDFs' ],
  function(arrays, codecs, Random, SecureRandom, Ciphers, Hashes, HMACs, KDFs) {

    return function Crypto(random) {
      if (! random) {
        random = new SecureRandom();
      } else if (!(random instanceof Random)) {
        throw new Error("Must be constructed with a Random instance");
      }

      var ciphers = new Ciphers(random);
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
