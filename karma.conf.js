'use strict';

module.exports = function(config) {

  config.set({
    /* Base tests definition */
    basePath: '.',
    frameworks: ['mocha', 'requirejs', 'chai'],
    port: 9876,
    autoWatch: true,
    singleRun: false,

    /* These need to be in order */
    files: [

      /* Our libraries (in order) */
      'lib/angular-1.3.0.js',
      'lib/angular-mocks-1.3.0.js',

      /* Source files (angular modules) */
      { pattern: 'src/modules/*.js', included: false },
      { pattern: 'src/*.js',         included: true  },

      /* Test files (use require.js) */
      { pattern: 'karma.test.js', included: true  },
      { pattern: 'test/*.js',     included: false },
    ],

    /* Pretty */
    logLevel: config.LOG_INFO,
    reporters: ['mocha', 'clear-screen'],
    colors: true,

    htmlReporter: {
      outputDir: 'reports'
    },

    /* Our browsers */
    browsers: ['PhantomJS'], //'Chrome', 'Firefox', 'Safari'],
  });
};
