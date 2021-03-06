module.exports = function(grunt) {

  /* Grunt initialization */
  grunt.initConfig({

    /* Unit testing */
    'karma': {
      options: {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        singleRun: true,
        logLevel: 'INFO'
      },
      // 'PhantomJS': { browsers: ['PhantomJS']      },
      'Chrome':    { browsers: ['Chrome']         },
      'Firefox':   { browsers: ['Firefox-Crypto'] },
      'Safari':    { browsers: ['Safari']         },
    },

    /* Simple mocha */
    'esquire-mocha': {
      'options': { slow: 250 },
      'default': {
        src: [ 'index.js',
               'test/**/*.test.js',
               'test/index.js' ]
      }
    },

    /* Uglify task */
    'uglify': {
      build: {
        src: 'src/**/*.js',
        dest: 'bletchley.min.js',
        options: {
          wrap: true
        }
      }
    },

    /* Documentation task */
    'jsdoc-ng' : {
      'dist' : {
        src: ['src/*.js', 'README.md' ],
        dest: 'docs',
        template : 'jsdoc-ng',
        options: {
          "plugins": ["plugins/markdown"],
          "templates": {
            "cleverLinks":    true,
            "monospaceLinks": true,
            "minify": false
          },
          "markdown": {
            "parser": "gfm",
            "hardwrap": true
          }
        }
      }
    },

    /* Publish GirHub Pages */
    'gh-pages': {
      src: '**/*',
      options: {
        base: 'docs'
      }
    }

  });

  /* Load our plugins */
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-esquire-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc-ng');
  grunt.loadNpmTasks('grunt-gh-pages');

  /* Default tasks */
  grunt.registerTask('default', ['test', 'uglify']);
  grunt.registerTask('test', ['karma', 'esquire-mocha']);
  grunt.registerTask('docs', ['jsdoc-ng', 'gh-pages']);

};
