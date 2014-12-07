'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/arrays',
                                            'bletchley/utils/Random',
                                            'bletchley/codecs/Codecs',
                                            'bletchley/hashes/Hashes',
                                            'bletchley/hmacs/HMACs',
                                            'bletchley/kdfs/KDFs' ],
  function(arrays, Random, Codecs, Hashes, HMACs, KDFs) {

    return function Crypto(random) {
      var codecs = new Codecs();
      var hashes = new Hashes();
      var hmacs = new HMACs();
      var kdfs = new KDFs();

      if (! random) {
        random = new Random();
      } else if (!(random instanceof Random)) {
        throw new Error("Must be constructed with a Random instance");
      }

      Object.defineProperties(this, {
        "random":    { enumerable: true, configurable: false, value: random.nextBytes  },
        "stringify": { enumerable: true, configurable: false, value: arrays.encodeUTF8 },
        "encode":    { enumerable: true, configurable: false, value: codecs.encode     },
        "decode":    { enumerable: true, configurable: false, value: codecs.decode     },
        "hash":      { enumerable: true, configurable: false, value: hashes.hash       },
        "hmac":      { enumerable: true, configurable: false, value: hmacs.hmac        },
        "kdf":       { enumerable: true, configurable: false, value: kdfs.kdf          }
      });
    };

  }
);
