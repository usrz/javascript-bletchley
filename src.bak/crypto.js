'use strict';

var worker = null;

/* Just load our services */
define(['services/decode',
        'services/defer',
        'services/encode',
        'services/hash',
        'services/hmac',
        'services/subtle'], function() {

  /*Init */
  try {
    var blob = new Blob([
      "importScripts('http://127.0.0.1:9876/base/node_modules/requirejs/require.js');",
      "importScripts('http://127.0.0.1:9876/base/src/worker.js');",
      "requirejs.config({ baseUrl: 'http://127.0.0.1:9876/base/src' });"
    ]);
    var url = URL.createObjectURL(blob);
    var worker = new Worker(url);

    console.error("WORKER IS...", worker);

    worker.onmessage = function(event) {
      console.error("MESSAGE", event.data);
    }

    worker.onerror = function(error) {
      console.error("ERROR", error);
      console.error("ERROR MESSAGE", error.message);
    }

    worker.postMessage("PING");
  } catch (error) {
    console.error("ERROR INITIALIZING WORKER", error);
  }

});
