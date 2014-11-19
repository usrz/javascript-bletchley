Esquire.define('bletchley/utils/helpers', [], function() {

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
    if (!helpers) return;

    var algorithms = [];
    var instances = {};

    for (var i in helpers) {
      var helper = helpers[i];
      var algorithm = helper.algorithm;
      algorithms.push(algorithm.toUpperCase());
      instances[normalize(algorithm)] = helper;
    }

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
