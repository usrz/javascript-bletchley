'use strict';

define(['crypto_module'], function(module) {

  /* ======================================================================== */
  /* UZCrypto's "_hmac" service                                               */
  /* ======================================================================== */

  module.factory('_hmac', ['$q', '_subtle', '_encoder', '_defer', function($rootScope, $q, _subtle, _encoder, _defer) {
    return function() {

    };
  }]);

});

// subtle.importKey("raw",
//                  new Uint8Array(),
//                  { name: "HMAC", hash: { name: "SHA-256" }},
//                  false,
//                  [ 'sign' ])
//   .then(
//     function (success) {
//       console.log("KEY IMPORTED", success);

//       subtle.sign({ name: "HMAC" },
//                   success,
//                   new Uint8Array())
//         .then(
//           function (success) {
//             console.log("HMAC SUCCESS", success);
//             k = success;

//           },
//           function (failure) {
//             console.log("HMAC FAILED", failure);
//           });

//     },
//     function (failure) {
//       console.log("FAILED TO IMPORT KEY", failure);
//     }
//   );

// var a = new Uint8Array(k);
// var s = "0x";
// for (var i = 0; i < a.length; i++) {
//   if (a[i] < 16) s += '0';
//   s += Number(a[i]).toString(16);
// }
// console.log(s);







