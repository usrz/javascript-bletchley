'use strict';

Esquire.define('bletchley/crypto/async', ['bletchley/crypto/sync', 'rodosha', 'bletchley/utils/helpers', 'bletchley/utils/extend'], function(sync, rodosha, helpers, extend) {

  var initialValues = {
    codecs: [],
  }

  var proxy = rodosha.create(false)
    .then(function(rodosha) {
      console.log("SLAVE IS", rodosha);
      return rodosha.proxy('bletchley/crypto/sync');
    }).then(function(proxy) {
      console.log("PROXY IS", proxy);
      initialValues.codecs = proxy.codecs.initialValue();

      return proxy;
    });

  console.log("PROXY IS", proxy);

  function AsyncCrypto() {
    var x = this;

    this.ready = function() {
      return proxy.then(function(p) { return x });
    }


    Object.defineProperty(this, "codecs", { enumerable: true, configurable: false, get: function() { return initialValues.codecs }});

    this.encode = function() { var a = arguments; return proxy.then(function(p) { console.log("E", p); return p.encode.apply(proxy, a) })}
    this.decode = function() { var a = arguments; return proxy.then(function(p) { console.log("D", p); return p.decode.apply(proxy, a) })}
    this.hash   = function() {
      var a = arguments;
      return proxy.then(function(p) {
        return p.hash.apply(proxy, a)
      })
    }

    extend.promisify(this);
    //helpers.Factory.call(this);
  };

  function AsyncCrypto2() {
    console.log("CALLED2");
  }

  AsyncCrypto.prototype = Object.create(helpers.Factory.prototype);
  AsyncCrypto.prototype.constructor = AsyncCrypto2;
  AsyncCrypto.prototype.name = "AsyncCrypto";

  return new AsyncCrypto();

});

