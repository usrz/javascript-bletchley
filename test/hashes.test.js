esquire(['bletchley/hashes', 'bletchley/codecs', 'bletchley/test/binary', 'promize'], function(hashes, codecs, binary) {

  var hash = hashes.hash;
  var encode = codecs.encode;
  var decode = codecs.decode;

  describe("Hashes", function() {

    it("should exist", function() {
      expect(hashes).to.exist;
      expect(hashes).to.be.a('object');
      expect(hashes.hash).to.be.a('function');
      expect(hashes.algorithms).to.include("SHA1");
      expect(hashes.algorithms).to.include("SHA-224");
      expect(hashes.algorithms).to.include("SHA-256");
      expect(hashes.algorithms).to.include("SHA-384");
      expect(hashes.algorithms).to.include("SHA-512");
    });

    /* ====================================================================== */

    describe("SHA1", function() {

      it("should hash empty data", function() {

        expect(encode('HEX', hash('SHA1', emptyData)))
          .to.equal(emptySHA1);

      });

      it("should hash a well-known string", function() {

        expect(encode('HEX', hash('SHA1', decode("UTF-8", knownString))))
          .to.equal(knownSHA1);

      });

      it("should hash 10k of binary data", function() {

        expect(encode('HEX', hash('SHA1', decode('BASE64', binary.base64))))
          .to.equal(binarySHA1);

      });

    });

    /* ====================================================================== */

    describe("SHA-224", function() {

      it("should hash empty data", function() {

        expect(encode('HEX', hash('SHA-224', emptyData)))
          .to.equal(emptySHA224);

      });

      it("should hash a well-known string", function() {

        expect(encode('HEX', hash('SHA-224', decode("UTF-8", knownString))))
          .to.equal(knownSHA224);

      });

      it("should hash 10k of binary data", function() {

        expect(encode('HEX', hash('SHA-224', decode('BASE64', binary.base64))))
          .to.equal(binarySHA224);

      });

    });

    /* ====================================================================== */

    describe("SHA-256", function() {

      it("should hash empty data", function() {

        expect(encode('HEX', hash('SHA-256', emptyData)))
          .to.equal(emptySHA256);

      });

      it("should hash a well-known string", function() {

        expect(encode('HEX', hash('SHA-256', decode("UTF-8", knownString))))
          .to.equal(knownSHA256);

      });

      it("should hash 10k of binary data", function() {

        expect(encode('HEX', hash('SHA-256', decode('BASE64', binary.base64))))
          .to.equal(binarySHA256);

      });

    });

    /* ====================================================================== */

    describe("SHA-384", function() {

      it("should hash empty data", function() {

        expect(encode('HEX', hash('SHA-384', emptyData)))
          .to.equal(emptySHA384);

      });

      it("should hash a well-known string", function() {

        expect(encode('HEX', hash('SHA-384', decode("UTF-8", knownString))))
          .to.equal(knownSHA384);

      });

      it("should hash 10k of binary data", function() {

        expect(encode('HEX', hash('SHA-384', decode('BASE64', binary.base64))))
          .to.equal(binarySHA384);

      });

    });

    /* ====================================================================== */

    describe("SHA-512", function() {

      it("should hash empty data", function() {

        expect(encode('HEX', hash('SHA-512', emptyData)))
          .to.equal(emptySHA512);

      });

      it("should hash a well-known string", function() {

        expect(encode('HEX', hash('SHA-512', decode("UTF-8", knownString))))
          .to.equal(knownSHA512);

      });

      it("should hash 10k of binary data", function() {

        expect(encode('HEX', hash('SHA-512', decode('BASE64', binary.base64))))
          .to.equal(binarySHA512);

      });

    });

    /* ======================================================================== */

    var emptyData = new Uint8Array();
    var emptySHA1   = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
    var emptySHA224 = 'd14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f';
    var emptySHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    var emptySHA384 = '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b';
    var emptySHA512 = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';

    var knownString = 'The quick brown fox jumps over the lazy dog';
    var knownSHA1   = '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12';
    var knownSHA224 = '730e109bd7a8a32b1cb9d9a09aa2325d2430587ddbc0c38bad911525';
    var knownSHA256 = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';
    var knownSHA384 = 'ca737f1014a48f4c0b6dd43cb177b0afd9e5169367544c494011e3317dbf9a509cb1e5dc1e85a941bbee3d7f2afbc9b1';
    var knownSHA512 = '07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6';

    var binarySHA1   = "e73b326d07a80caf4b111a70d620485cafd25fa1";
    var binarySHA224 = "34ec93d85f705da86f8f9b1d3c866be17ab64a0a08e5ae721872a70e";
    var binarySHA256 = "7d26528f61705cdda3ec99636db5caaf55013ce199c6d23c92da5112375bfc6d";
    var binarySHA384 = "626c445d51e31edae915a6167f49214f372433af0da1cee062c33cccad637a86fd09849216b7b833886b9cdcf4b06f38";
    var binarySHA512 = "abd1271df074b762f4425b33ba950ceefe6b35b6e49b361a6bec7a974bc037a2be43030c23e46d241938e7fcbec65dd6b4a33a6cc1ffb86fde74716f28852fdc";

  });

});
