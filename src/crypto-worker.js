'use strict';

Esquire.define('bletchley/crypto/worker', ['rodosha'], function(rodosha) {

  return rodosha.create('bletchley/codecs/utf8', 'bletchley/hashes', 'bletchley/hmacs', true)
    .then(function(rodosha) {
      console.log("CREATED");
      return Promise.all([
        codecs, // use synchronous codecs!
        rodosha.proxy('bletchley/hashes'),
        rodosha.proxy('bletchley/hmacs'),
      ]);
    }).then(function(args) {
      console.log("PROXIED");
      return Crypto.async.apply(null, args);
    });

});

