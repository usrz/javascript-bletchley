'use strict';

Esquire.define('bletchley/crypto/WorkerCrypto', [ '$promise',
                                                  'bletchley/crypto/AsyncCrypto',
                                                  'bletchley/utils/Random',
                                                  'bletchley/utils/extend',
                                                  'rodosha' ],
  function(Promise, AsyncCrypto, Random, extend, rodosha) {

    var internalRandom = new Random();

    var WorkerCrypto = extend("WorkerCrypto", AsyncCrypto, function(proxy) {
      if (proxy && proxy['!$proxyId$!']) {
        AsyncCrypto.call(this, proxy);
      } else {
        throw new Error("Construct using WorkerCrypto.newInstance()");
      }
    });

    WorkerCrypto.newInstance = function() {

      return rodosha.create('bletchley/crypto/Crypto', 'bletchley/utils/Random', false)
        .then(function(rodosha) {
          return Promise.all([
            rodosha.proxy('bletchley/crypto/Crypto'),
            rodosha.proxy('bletchley/utils/Random')
          ]);

        }).then(function(result) {
          var CryptoProxy = result[0];
          var RandomProxy = result[1];

          /*
           * This might be tricky... We might not have decent PRNG in the
           * worker (like, only Math.random() in there), so just get a key
           * from the local random, and use it to initialize the remote one
           */
          var randomData = internalRandom.nextBytes(256);
          return Promise.all([CryptoProxy, new RandomProxy(randomData)]);

        }).then(function(result) {
          var CryptoProxy = result[0];
          var randomInstance = result[1];

          return new CryptoProxy(randomInstance);

        }).then(function(result) {
          return new WorkerCrypto(result);
        });
    };

    /* Return our WorkerCrypto class */
    return WorkerCrypto;
  }
);

