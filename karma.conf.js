'use strict';

module.exports = function(config) {

  config.set({
    /* Base tests definition */
    basePath: '.',
    frameworks: ['esquire', 'mocha', 'chai'],
    port: 9876,
    autoWatch: true,
    singleRun: false,

    /* These need to be in order */
    files: [
      'node_modules/rodosha/src/*',
      'src/**/*.js',
      'test/**/*.test.js',
      'test/index.js',
      'test/subtle.js'
    ],

    /* Pretty */
    // logLevel: config.LOG_DEBUG,
    reporters: ['verbose'],
    colors: true,

    /* Our browsers */
    customLaunchers: {
      "Firefox-Crypto": {
        base: 'Firefox',
        prefs: { "dom.webcrypto.enabled": true },
      }
    },
    browsers: ['PhantomJS', 'Chrome', 'Firefox-Crypto', 'Safari'],
  });
};
