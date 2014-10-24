describe("UZDefer", function() {
  beforeEach(module('UZDefer'));

  var constant = "A silly constant to be deferred...";

  it("should exist", inject(['_defer', function(_defer) {
    expect(_defer).to.exist;
  }]));

  it("should defer a static value", function(done) {
    inject(['$timeout', '_defer', function($timeout, _defer) {

      _defer(constant)
        .then(function(success) {
          expect(success).to.equal(constant);
          done();
        }, function(failure) {
          done(failure);
        });

      $timeout.flush();
    }]);
  });

  it("should resolve a deferred function", function(done) {
    inject(['$timeout', '_defer', function($timeout, _defer) {

      _defer(function() { return constant })
        .then(function(success) {
          expect(success).to.equal(constant);
          done();
        }, function(failure) {
          done(failure);
        });

      $timeout.flush();
    }]);
  });

  it("should reject a thrown string", function(done) {
    inject(['$timeout', '_defer', function($timeout, _defer) {

      _defer(function() { throw constant })
        .then(function(success) {
          done(success);
        }, function(failure) {
          expect(failure).to.be.a('string');
          expect(failure).to.equal(constant);
          done();
        });

      $timeout.flush();
    }]);
  });

  it("should reject a thrown error", function(done) {
    inject(['$timeout', '_defer', function($timeout, _defer) {

      _defer(function() { throw new Error(constant) })
        .then(function(success) {
          done(success);
        }, function(failure) {
          expect(failure).to.be.an.instanceof(Error);
          expect(failure.message).to.equal(constant);
          done();
        });

      $timeout.flush();
    }]);
  });

  it("should resolve a wrapped resolved promise", function(done) {
    inject(['$timeout', '$q', '_defer', function($timeout, $q, _defer) {

      var promise = $q(function(resolve, reject) {
        resolve(constant);
      });

      _defer(function() { return promise; })
        .then(function(success) {
          expect(success).to.be.a('string');
          expect(success).to.equal(constant);
          done();
        }, function(failure) {
          done(failure);
        });

      $timeout.flush();
    }]);
  });

  it("should reject a wrapped rejected promise", function(done) {
    inject(['$timeout', '$q', '_defer', function($timeout, $q, _defer) {

      var promise = $q(function(resolve, reject) {
        reject(constant);
      });

      _defer(function() { return promise; })
        .then(function(success) {
          done(success);
        }, function(failure) {
          expect(failure).to.be.a('string');
          expect(failure).to.equal(constant);
          done();
        });

      $timeout.flush();
    }]);
  });

});
