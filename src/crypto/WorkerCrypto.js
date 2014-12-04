'use strict';

Esquire.define('bletchley/crypto/WorkerCrypto', [ '$promise',
                                                  'bletchley/crypto/AsyncCrypto',
                                                  'bletchley/utils/random',
                                                  'rodosha' ],
  function(Promise, AsyncCrypto, random, rodosha) {

    var randomData = random.random(256);

    return Object.freeze({ newInstance: function() {
      return rodosha.create('bletchley/sync', 'bletchley/utils/random', false)
      .then(function(rodosha) {
        return Promise.all([
          rodosha.proxy('bletchley/sync'),
          rodosha.proxy('bletchley/utils/random')
        ]);
      }).then(function(result) {
        var crypto = result[0];
        var random = result[1];

        /*
         * This might be tricky... We might not have decent PRNG in the
         * worker (like, only Math.random() in there), so just get a key
         * from the local random, and use it to initialize the remote one
         */
        return Promise.all([crypto, random.init(randomData)]);

      }).then(function(result) {
        return new AsyncCrypto(result[0]);
      });
    }});
  }
);

