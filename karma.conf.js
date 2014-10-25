'use strict';


module.exports = function(config) {

  config.set({
    /* Base tests definition */
    basePath: '.',
    frameworks: ['requirejs', 'mocha', 'chai'],
    port: 9876,
    autoWatch: true,
    singleRun: false,

    plugins: [
      "karma-chai",
      "karma-mocha",
      "karma-requirejs",
      "karma-chrome-launcher",
      "karma-firefox-launcher",
      "karma-phantomjs-launcher",
      "karma-safari-launcher",
      require('./karma.reporter')
    ],

    /* These need to be in order */
    files: [

      /* Our libraries (in order) */
      'lib/angular-1.3.0.js',
      'lib/angular-mocks-simple.js',

      /* Source files (angular modules) */
      { pattern: 'src/modules/*.js', included: false },
      { pattern: 'src/*.js',         included: true  },

      /* Test files (use require.js) */
      { pattern: 'karma.test.js', included: true  },
      { pattern: 'test/*.js',     included: false },
    ],

    /* Pretty */
    logLevel: config.LOG_INFO,
    reporters: ['detailed'],
    colors: true,

    /* Our browsers */
    browsers: ['PhantomJS', 'Chrome'], // 'Firefox', 'Safari'],
  });
};
