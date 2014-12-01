'use strict';

Esquire.define('bletchley/crypto/worker', ['$promise', 'bletchley/crypto/AsyncCrypto', 'bletchley/utils/random', 'rodosha'],
  function(Promise, AsyncCrypto, random, rodosha) {

    return rodosha.create('bletchley/crypto/sync', 'bletchley/utils/random', false)
      .then(function(rodosha) {
        return Promise.all([
          rodosha.proxy('bletchley/crypto/sync'),
          rodosha.proxy('bletchley/utils/random')
        ]);
      }).then(function(result) {
        var crypto = result[0];
        var randpx = result[1];

        /*
         * This might be tricky... We might not have decent PRNG in the
         * worker (like, only Math.random() in there), so just get a key
         * from the local random, and use it to initialize the remote one
         */
        var randinit = random.random(256);
        return Promise.all([crypto, randpx.init(randinit)]);

      }).then(function(result) {
        return new AsyncCrypto(result[0]);
      });

  }
);

