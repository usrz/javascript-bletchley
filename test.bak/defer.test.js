define(['crypto'], function(crypto) {
  describe("defer", function() {
    beforeEach(module('UZCrypto'));

    var constant = "A silly constant to be deferred...";

    it("should exist", inject(['_defer', function(_defer) {
      expect(_defer).to.exist;
    }]));

    it("should defer a static value", inject(['$done', '_defer', function($done, _defer) {

      _defer(constant)
        .then(function(success) {
          expect(success).to.equal(constant);
          $done();
        }, function(failure) {
          $done(failure);
        });

    }]));

    it("should resolve a deferred function", inject(['$done', '_defer', function($done, _defer) {

      _defer(function() { return constant })
        .then(function(success) {
          expect(success).to.equal(constant);
          $done();
        }, function(failure) {
          $done(failure);
        });

    }]));

    it("should reject a thrown string", inject(['$done', '_defer', function($done, _defer) {

      _defer(function() { throw constant })
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.a('string');
          expect(failure).to.equal(constant);
          $done();
        });

    }]));

    it("should reject a thrown error", inject(['$done', '_defer', function($done, _defer) {

      _defer(function() { throw new Error(constant) })
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.equal(constant);
          $done();
        });

    }]));

    it("should resolve a wrapped resolved promise", inject(['$done', '$q', '_defer', function($done, $q, _defer) {

      _defer(function() { return $q.when(constant) })
        .then(function(success) {
          expect(success).to.be.a('string');
          expect(success).to.equal(constant);
          $done();
        }, function(failure) {
          $done(failure);
        });

    }]));

    it("should reject a wrapped rejected promise", inject(['$done', '$q', '_defer', function($done, $q, _defer) {

      _defer(function() { return $q.reject(constant) })
        .then(function(success) {
          $done(success);
        }, function(failure) {
          expect(failure).to.be.a('string');
          expect(failure).to.equal(constant);
          $done();
        });

    }]));

  });
});

