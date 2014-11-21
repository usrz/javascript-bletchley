'use strict';

Esquire.define('bletchley/utils/helpers', ['promize'], function(promize) {

  function normalize(name) {
    if (typeof('name') !== 'string') throw new Error("Invalid name " + name);
    return name.replace(/[- ]/g,'').toLowerCase();
  }

  function Helper(algorithm) {
    if (!algorithm) return;
    this.algorithm = algorithm;
    Object.freeze(this);
  };

  function Factory(helpers) {
    var algorithms = [];
    var instances = {};

    for (var i in helpers) {
      var helper = helpers[i];
      if (! (helper instanceof Helper)) throw new Error("Invalid helper " + helper);

      var algorithm = helper.algorithm;
      if (! algorithm) throw new Error("Unknown algorithm for " + helper);

      algorithms.push(algorithm.toUpperCase());
      instances[normalize(algorithm)] = helper;
    }

    this.helpers = Object.freeze(instances);
    this.algorithms = Object.freeze(algorithms);
    this.get = function(algorithm) {
      var helper = instances[normalize(algorithm)];
      if (! helper) throw new Error("Unrecognized algorithm " + algorithm);
      return helper;
    }

    Object.freeze(this);
  }

  return Object.freeze({
    Helper:  Helper,
    Factory: Factory,
  });

});
