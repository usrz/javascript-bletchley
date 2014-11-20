'use strict';

Esquire.define('bletchley/hashes', [ 'bletchley/hashes/sha1',
                                     'bletchley/hashes/sha224',
                                     'bletchley/hashes/sha256',
                                     'bletchley/hashes/sha384',
                                     'bletchley/hashes/sha512',
                                     'bletchley/utils/helpers' ],
  function(sha1, sha224, sha256, sha384, sha512, helpers) {

    function Hashes() {
      var hashes = this;

      this.hash = function(algorithm, message) {
        return hashes.get(algorithm).hash(message);
      }

      helpers.Factory.call(this, [sha1, sha224, sha256, sha384, sha512]);
    }

    Hashes.prototype = new helpers.Factory();
    return new Hashes();

  }
);
