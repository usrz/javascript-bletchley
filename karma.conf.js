'use strict';


module.exports = function(config) {

  config.set({
    /* Base tests definition */
    basePath: '.',
    frameworks: ['requirejs', 'mocha', 'chai'],
    port: 9876,
    autoWatch: true,
    singleRun: false,

    /* These need to be in order */
    files: [

      /* Our libraries (in order) */
      'lib/angular-1.3.0.js',
      'lib/angular-mocks-simple.js',

      /* Source and test files loaded by "require" */
      { pattern: 'src/**/*.js',   included: false },
      { pattern: 'test/**/*.js',  included: false },
      { pattern: 'karma.test.js', included: true  },
    ],

    /* Pretty */
    // logLevel: config.LOG_DEBUG,
    reporters: ['verbose'],
    colors: true,

    /* Our browsers */
    browsers: ['Chrome'], // 'Chrome', 'Firefox', 'Safari'],
  });
};
