'use strict';

Esquire.define('bletchley/hashes/Hash', [ 'bletchley/utils/Helper', 'bletchley/utils/Chunker', 'bletchley/utils/arrays' ], function(Helper, Chunker, arrays) {

  function Hash(algorithm, blockSize, digestSize) {

    /* Bake in our Chunker */
    var $this = this;
    var chunker = new Chunker(blockSize, function(block, blockSize, totalLength, last, dataView) {
      if (last) $this.$flush(block, blockSize, totalLength, dataView);
      else $this.$compute(dataView);
    });

    Object.defineProperties(this, {
      "blockSize":  { enumerable: true,  configurable: false, value: blockSize  },
      "digestSize": { enumerable: true,  configurable: false, value: digestSize },
      "$chunker":   { enumerable: false, configurable: false, value: chunker }
    });

    Helper.call(this, algorithm);
  };

  Hash.prototype = Object.create(Helper.prototype);
  Hash.prototype.constructor = Hash;

  Hash.prototype.hash = function(message, output) {
    return this.reset().update(message).digest(output);
  }

  Hash.prototype.update = function(message) {
    this.$chunker.push(message);
    return this;
  }

  Hash.prototype.reset = function(message) {
    this.$reset();
    return this;
  }

  Hash.prototype.digest = function(output) {

    /* No output? Create a new buffer */
    if (! output) {
      output = new Uint8Array(this.digestSize);
    } else if (!(output instanceof Uint8Array)) {
      throw new Error("Output must be a Uint8Array");
    } else if (output.length < this.digestSize) {
      throw new Error("Required at least " + this.digestSize + " for output");
    }

    /* Flush, get the current hash, reset, and return */
    this.$chunker.flush();
    this.$hash(new DataView(output.buffer, output.byteOffset, output.byteLength));
    return output;

  };

  Hash.prototype.$reset   = function() { throw new Error("Hash $reset not implemented") }
  Hash.prototype.$compute = function() { throw new Error("Hash $compute not implemented") }
  Hash.prototype.$flush   = function() { throw new Error("Hash $flush not implemented") }
  Hash.prototype.$hash    = function() { throw new Error("Hash $reset not implemented") }

  return Hash;

});
