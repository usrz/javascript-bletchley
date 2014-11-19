Esquire.define('bletchley/hashes', [ 'bletchley/hashes/sha1',
                                     'bletchley/hashes/sha224',
                                     'bletchley/hashes/sha256',
                                     'bletchley/hashes/sha384',
                                     'bletchley/hashes/sha512',
                                     'bletchley/utils/helpers' ],
  function(sha1, sha224, sha256, sha384, sha512, helpers) {

    return helpers.makeFactory({
      compute: function(algorithm, message) {
        return this.get(algorithm).hash(message);
      }
    }, [sha1, sha224, sha256, sha384, sha512], true);

  }
);
