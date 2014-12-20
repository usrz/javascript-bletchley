'use strict';

Esquire.define('bletchley/codecs', ['bletchley/codecs/Codecs'],

  function(Codecs) {

    var codecs = new Codecs();

    return Object.freeze({
      "encode": function encode() { return codecs.encode.apply(codecs, arguments) },
      "decode": function decode() { return codecs.decode.apply(codecs, arguments) },
    });

  }
);
