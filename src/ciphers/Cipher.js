'use strict';

Esquire.define('bletchley/ciphers/Cipher', [ 'bletchley/utils/Helper' ], function(Helper) {

  function Cipher(name) {
    Helper.call(this, name);
  };

  Cipher.prototype = Object.create(Helper.prototype);
  Cipher.prototype.constructor = Cipher;

  Cipher.prototype.encrypt = function(key, data, options) { throw new Error("Cipher 'encrypt' not implemented") }
  Cipher.prototype.decrypt = function(key, data, options) { throw new Error("Cipher 'decrypt' not implemented") }

  return Cipher;

});
