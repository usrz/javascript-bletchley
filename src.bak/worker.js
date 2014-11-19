'use strict';

console.log("LOADED");
postMessage("LOADED");

require(['utils/uint8'], function(uint8) {
  onmessage = function(event) {
    postMessage(["PONG", event.data]);
  };
  postMessage(["INITIALIZED", uint8.toUint8Array.toString()]);
})

