'use strict';

Esquire.define('bletchley/keys/KeyFactory', [ 'bletchley/utils/Helper' ], function(Helper) {

  function KeyFactory(name) {
    Helper.call(this, name);
  };

  KeyFactory.prototype = Object.create(Helper.prototype);
  KeyFactory.prototype.constructor = KeyFactory;

  KeyFactory.prototype.generateKey = function(bits, params) { throw new Error("KeyFactory 'generateKey' not implemented") }
  KeyFactory.prototype.importKey   = function(data) { throw new Error("KeyFactory 'importKey' not implemented") }

  return KeyFactory;

});
