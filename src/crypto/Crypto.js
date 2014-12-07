'use strict';

Esquire.define('bletchley/crypto/Crypto', [ 'bletchley/utils/arrays',
                                            'bletchley/utils/Random',
                                            'bletchley/codecs/Codecs',
                                            'bletchley/hashes/Hashes',
                                            'bletchley/hmacs',
                                            'bletchley/kdfs' ],
  function(arrays, Random, Codecs, Hashes, hmacs, kdfs) {

    var codecs = new Codecs();
    var hashes = new Hashes();

    return function Crypto(random) {
      if (! random) {
        random = new Random();
      } else if (!(random instanceof Random)) {
        throw new Error("Must be constructed with a Random instance");
      }

      Object.defineProperty(this, "random",    { enumerable: true, configurable: false, value: random.nextBytes });
      Object.defineProperty(this, "stringify", { enumerable: true, configurable: false, value: arrays.encodeUTF8 });
      Object.defineProperty(this, "encode",    { enumerable: true, configurable: false, value: codecs.encode    });
      Object.defineProperty(this, "decode",    { enumerable: true, configurable: false, value: codecs.decode    });
      Object.defineProperty(this, "hash",      { enumerable: true, configurable: false, value: hashes.hash      });
      Object.defineProperty(this, "hmac",      { enumerable: true, configurable: false, value: hmacs.hmac       });
      Object.defineProperty(this, "kdf",       { enumerable: true, configurable: false, value: kdfs.kdf         });
    };

  }
);
