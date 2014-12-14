'use strict';

Esquire.define('test/FakeRandom', ['bletchley/random/Random', 'bletchley/codecs/Codecs'], function(Random, Codecs) {

  var codecs = new Codecs();

  function FakeRandom(hex) {
    var buf = codecs.decode('HEX', hex);
    var pos = 0;
    this.next = function() {
      if (pos < buf.length) return buf[pos ++];
      throw new Error("Exhausted!");
    }
  }

  FakeRandom.prototype = Object.create(Random.prototype);
  FakeRandom.prototype.constructor = FakeRandom;

  return FakeRandom;

});
