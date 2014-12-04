'use strict';

Esquire.define('bletchley/worker', [ 'bletchley/crypto/WorkerCrypto' ], function(WorkerCrypto) {
  return WorkerCrypto.newInstance();
});

