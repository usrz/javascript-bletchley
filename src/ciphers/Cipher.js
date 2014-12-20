'use strict';

Esquire.define('bletchley/ciphers/Cipher', [ 'bletchley/utils/classes' ],

  function(classes) {

    function Cipher() {
      classes.lock(this);
    };

    Cipher.prototype.encrypt = function(key, data, options) { throw new Error("Cipher 'encrypt' not implemented") }
    Cipher.prototype.decrypt = function(key, data, options) { throw new Error("Cipher 'decrypt' not implemented") }

    /* Cipher extends Object */
    return classes.extend(Cipher);

  }
);
