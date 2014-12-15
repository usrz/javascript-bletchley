'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/arrays',
                                            'bletchley/codecs',
                                            'bletchley/utils/BoundClass',
                                            'bletchley/random/Random',
                                            'bletchley/random/SecureRandom',
                                            'bletchley/ciphers/Ciphers',
                                            'bletchley/hashes/Hashes',
                                            'bletchley/hmacs/HMACs',
                                            'bletchley/kdfs/KDFs' ],
  function(arrays, codecs, BoundClass, Random, SecureRandom, Ciphers, Hashes, HMACs, KDFs) {

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
        "random":    { enumerable: true, configurable: true, value: random.nextBytes  },
        "stringify": { enumerable: true, configurable: true, value: arrays.decodeUTF8 },
        "encode":    { enumerable: true, configurable: true, value: codecs.encode     },
        "decode":    { enumerable: true, configurable: true, value: codecs.decode     },
        "encrypt":   { enumerable: true, configurable: true, value: ciphers.encrypt   },
        "decrypt":   { enumerable: true, configurable: true, value: ciphers.decrypt   },
        "hash":      { enumerable: true, configurable: true, value: hashes.hash       },
        "hmac":      { enumerable: true, configurable: true, value: hmacs.hmac        },
        "kdf":       { enumerable: true, configurable: true, value: kdfs.kdf          }
      });

      BoundClass.call(this);
    };

  }
);
