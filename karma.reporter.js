console.log("WOHA, I have been read!");

function DetailedReporter(logger) {

  /*
   * Known events:
   *
   * - run_start
   * - run_complete
   *
   * - browser_complete
   * - browser_error
   * - browser_log
   * - browser_process_failure
   * - browser_register
   * - browser_start
   * - browsers_change
   * - exit
   * - file_list_modified
   * - spec_complete
   */

  var _log = logger.create('report');
  var _browserLogs = [];
  var _browsers = null;
  var _tests = null;

  /* ======================================================================== */
  /* RUN START/COMPLETE                                                       */
  /* ======================================================================== */

  function report(tests, indent) {
    if (! tests) return;
    indent = indent || '';
    if (tests.suites) {
      var suites = Object.keys(tests.suites).sort();
      for (var i in suites) {
        _log.info(indent, '-', suites[i]);
        report(tests.suites[suites[i]], '  ' + indent);
      }
    }

    if (tests.results) {
      var results = Object.keys(tests.results).sort();
      for (var i in results) {
        var result = tests.results[results[i]];
        var message = results[i] + ":";

        if (result.total > 0) {
          if (result.total == result.successes) {
            message += " ok";
          } else if (result.total == 1) {
            if (result.failures) message += " failed";
            if (result.skipped)  message += " skipped";
          } else {
            message += " " + result.successes + " ok";
            if (result.failures != 0) message += (", " + result.failures + " failed");
            if (result.skipped  != 0) message += (", " + result.skipped  + " skipped");
          }

          _log.info(indent, '*', message);
        }
      }
    }

  };

  /* ======================================================================== */
  /* RUN START/COMPLETE                                                       */
  /* ======================================================================== */

  this.onRunStart = function(browsers) {
    console.log();
    console.log();
    _log.info("+ ============================================================= +");
    _log.info("| STARTING NEW TEST RUN                                         |");
    _log.info("+ ============================================================= +");
    _browsers = {};
    _tests = {suites: {}};
  };

  this.onRunComplete = function(browsers, results) {

    _log.info("+ ============================================================= +");
    _log.info("| TEST RUN REPORT                                               |");
    _log.info("+ ============================================================= +");

    _log.info(' ');
    _log.info("Browser results:")
    _log.info(' ');
    for (var i in _browsers) {
      var browser = _browsers[i];

      _log.info(" - " + browser.name + ": " + browser.total + " tests");
      _log.info("   - " + browser.successes + " tests succeeded");
      _log.info("   - " + browser.failures + " tests failed");
      _log.info("   - " + browser.skipped + " tests skipped");
    }

    _log.info(' ');
    _log.info("Suites and tests results:")
    _log.info(' ');
    report(_tests);

    _log.info(' ');
    _log.info("+ ============================================================= +");
    _log.info("| TEST RUN COMPLETE                                             |");
    _log.info("+ ============================================================= +");

  };

  /* ======================================================================== */
  /* BROWSER START/LOG/ERROR                                                  */
  /* ======================================================================== */

  this.onBrowserStart = function(browser) {
    logger.create(browser.name).info("Starting tests");

    /* Remember this browser */
    _browsers[browser.id] = {
      "name": browser.name,
      "successes": 0,
      "failures": 0,
      "skipped": 0,
      "total": 0
    };
  };

  this.onBrowserLog = function(browser, message, level) {
    if (level == 'log') level = 'info';
    _browserLogs.push({level: level, message: message});
  };

  this.onBrowserError = function(browser, error) {
    logger.create(browser.name).error(error);
  };

  this.onSpecComplete = function(browser, result) {
    var suite = '';
    var tests = _tests;

    for (var i in result.suite) {
      var suiteName = result.suite[i];
      suite += (', ' + suiteName);

      if (! tests.suites) tests.suites = {};
      if (! tests.suites[suiteName]) tests.suites[suiteName] = {};
      tests = tests.suites[suiteName];
    }

    suite = suite.length > 2 ? ' | ' + suite.substring(2) + ' | ' : ' | ';

    var log = logger.create(browser.name + suite + result.description);

    _browserLogs.forEach(function(entry) {
      log[entry.level](entry.message);
    })
    _browserLogs = [];

    if (! tests.results) tests.results = {};
    if (! tests.results[result.description]) {
      tests.results[result.description] = {
        "successes": 0,
        "failures": 0,
        "skipped": 0,
        "total": 0
      };
    }
    var results = tests.results[result.description];

    _browsers[browser.id].total ++;
    results.total ++;

    if (result.skipped) {
      _browsers[browser.id].skipped ++;
      results.skipped ++;
      log.warn('Test skipped');
    } else if (result.success) {
      _browsers[browser.id].successes ++;
      results.successes ++;
      log.info('Success: ' + result.time + ' ms');
    } else {
      _browsers[browser.id].failures ++;
      results.failures ++;
      for (var i in result.log) {
        log.error(result.log[i]);
      }
    }
  };
}

/* ========================================================================== */
/* MODULE DECLARATION                                                         */
/* ========================================================================== */

DetailedReporter.$inject = ['logger'];
module.exports = {
  'reporter:detailed': ['type', DetailedReporter]
};
