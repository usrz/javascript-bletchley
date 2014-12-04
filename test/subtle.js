'use strict';

esquire(['bletchley/crypto/Crypto',
         'bletchley/crypto/SubtleCrypto',
         '$global/navigator',

         'test/hashes',
         'test/hmacs'],

  function(Crypto, SubtleCrypto, navigator,
           testHashes, testHMACs) {

    /* Super idiotic browser detection */
    var browserName;
    if      (/PhantomJS\//.test(navigator.userAgent)) browserName = "PhantomJS";
    else if (/Chrome\//   .test(navigator.userAgent)) browserName = "Chrome";
    else if (/Safari\//   .test(navigator.userAgent)) browserName = "Safari";
    else if (/Firefox\//  .test(navigator.userAgent)) browserName = "Firefox";
    else if (/Trident\//  .test(navigator.userAgent)) browserName = "MSIE";
    else browserName = "Unknown";

    /* The current test, injected by beforeEach(), cleared by afterEach() */
    var currentTest = null;

    /* Mark current test as skipped for given browser/test full title */
    function canSkip(browser, test) {
      if (currentTest) {
        if (browser == browserName) {
          var title = currentTest.fullTitle();
          if (((typeof(test) === 'string') && (test == title)) ||
              ((test instanceof RegExp) && (test.test(title)))) {
            currentTest.pending = true;
            return true;
          }
        }
      }
      return false;
    }

    /* A fake crypto marking tests as skipped for specific cases */
    function SkippingCrypto() {
      this.random    = function() { throw new Error("Do not call") }
      this.stringify = function() { throw new Error("Do not call") }
      this.encode    = function() { throw new Error("Do not call") }
      this.decode    = function() { throw new Error("Do not call") }
      this.kdf       = function() { throw new Error("Do not call") }

      this.hash = function() {
        /* PhantomJS: No subtle crypto */
        canSkip("PhantomJS", /.*/);

        /* Chrome: No support for SHA1/SHA-224 */
        canSkip("Chrome", /^Subtle crypto implementation Hashes SHA(1|-224) hashing /);

        /* Chrome: No support for SHA1 */
        canSkip("Safari", /^Subtle crypto implementation Hashes SHA1 hashing /);

        /* Firefox: No support for SHA1/SHA-224 */
        canSkip("Firefox", /^Subtle crypto implementation Hashes SHA(1|-224) hashing /);

        /* Chrome: No support for SHA1/SHA-224/SHA-512, empty messages */
        canSkip("MSIE", /^Subtle crypto implementation Hashes SHA(1|-224|-512) hashing /);
        canSkip("MSIE", /^Subtle crypto implementation Hashes SHA(-256|-384) hashing should hash the FIPS-180 test vector of 0 bits$/);

        throw new Error("Subtle crypto failure");
      }

      this.hmac = function() {
        /* PhantomJS: No subtle crypto */
        canSkip("PhantomJS", /.*/);

        /* Chrome: No support for SHA1/SHA-224 */
        canSkip("Chrome", /^Subtle crypto implementation HMACs SHA(1|-224) /);

        /* Safari: No support for SHA1 */
        canSkip("Safari", /^Subtle crypto implementation HMACs SHA1 /);

        /* Firefox: No support for SHA1/SHA-224, empty salt */
        canSkip("Firefox", /^Subtle crypto implementation HMACs SHA(1|-224) /);
        canSkip("Firefox", /^Subtle crypto implementation HMACs SHA(-256|-384|-512) should compute a valid HMAC for empty( secret and)? salt$/);

        /* MSIE: No support for SHA1/SHA-224/SHA-512, empty salt AND/OR empty secret */
        canSkip("MSIE", /^Subtle crypto implementation HMACs SHA(1|-224|-512) /);
        canSkip("MSIE", /^Subtle crypto implementation HMACs SHA(-256|-384) should compute a valid HMAC for empty( secret)?( and)?( salt)?$/);

        throw new Error("Subtle crypto failure");
      }

    }

    SkippingCrypto.prototype = Object.create(Crypto.prototype);
    SkippingCrypto.prototype.constructor = SkippingCrypto;
    SkippingCrypto.prototype.name = "SkippingCrypto";

    /* Wrap our skipping test crypto in a new SubtleCrypto */
    var subtleCrypto = new SubtleCrypto(new SkippingCrypto());

    /* Run the tests */
    describe("Subtle crypto implementation", function() {
      beforeEach (function() { currentTest = this.currentTest });
      afterEach  (function()  { currentTest = null });

      testHashes(subtleCrypto, true);
      testHMACs(subtleCrypto, true);
    });
  }
);
