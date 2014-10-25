'use strict';

(function(window) {

  var currentModules = [];

  /**
   * This function will be invoked after every test is executed and will clar
   * the list of modules required for injection.
   */
  window.afterEach(function() {
    console.debug("Cleaning up required modules list");
    currentModules = [];
  });

  /**
   * This should be called in a "beforeEach(...)" statement:
   *   beforeEach(module(['foo', 'bar', 'baz']));
   * in order to specify which modules should be made available for injection.
   */
  window.module = function() {

    /* Normalize our modules list to inject in a flat array */
    var modules = ['ng']; // The 'ng' module must be explicitly added
    for (var i = 0; i < arguments.length; i++) {
      if (typeof(arguments[i]) == 'string') {
        modules.push(arguments[i]);
      } else if (typeof(arguments[i]) == 'function') {
        modules.push(arguments[i]);
      } else if (arguments[i].length) {
        for (var j = 0; j < arguments[i].length; j++) {
          if (typeof(arguments[i][j] == 'string')) {
            modules.push(arguments[i][j]);
          } else if (typeof(arguments[i][j] == 'function')) {
            modules.push(arguments[i][j]);
          } else {
            throw new Error("Only strings/functions for modules: " + arguments[i][j]);
          }
        }
      } else {
        throw new Error("Only arrays, strings or functions for modules: " + arguments[i]);
      }
    }

    /* This will be called *BEFORE* each test invocation */
    return function() {
      console.debug("Requiring " + modules.length + " modules", modules);
      currentModules = modules;
    }
  }

  /**
   * This should be called as the function to test:
   *   it('should work', inject(['$whatever', function($whatever) { ... }]))
   * with the same structure of any AngularJS call.
   * A special "$done" service is available to be injected when in some way,
   * shape, or form, we're testing asynchronously...
   */
  window.inject = function() {
    var injections = [];
    for (var i = 0; i < arguments.length; i++) {
      injections.push(arguments[i]);
    }

    return function(done) {
      console.debug('Injecting from modules', currentModules);

      /* Clone our list of modules and add our "$done" factory */
      if (! done) done = function() {};
      var doneInjected = false;
      var modules = currentModules.slice(0);
      modules.push(function($provide) {

        /* Our "$done" factory */
        $provide.factory('$done', function() {
          doneInjected = true;
          return done;
        });

        /* Our "$exceptionHandler" decoration */
        $provide.decorator('$exceptionHandler', function() {
          return function() {
            /* No need to call "done()" on exit anymore */
            doneInjected = true;

            if (arguments.length == 0) {
              done(new Error("$exceptionHandler called with 'undefined'"));
            } else {
              done(arguments[0]);
            }
          }
        });
      });

      /* Create an injector and invoke our method */
      try {
        var injector = angular.injector(modules)
        injector.invoke.apply(injector, injections);

        /* If we injected $done, just return */
        if (doneInjected) return;
        console.debug("$done not injected, completing test");
        done();

      } catch (error) {
        done(error);
      }

    }
  }

})(window);
