Esquire.define('bletchley/utils/helpers', [], function() {

  function normalize(name) {
    if (typeof('name') !== 'string') throw new Error("Invalid name " + name);
    return name.replace(/[- ]/g,'').toLowerCase();
  }

  function makeHelper(helper, algorithm, freeze) {
    helper.algorithm = algorithm;
    if (freeze) Object.freeze(helper);
    return helper;
  };

  function makeFactory(factory, helpers, freeze) {

    var algorithms = [];
    var instances = {};

    for (var i in helpers) {
      var helper = helpers[i];
      var algorithm = helper.algorithm;
      algorithms.push(algorithm.toUpperCase());
      instances[normalize(algorithm)] = helper;
    }

    factory.algorithms = Object.freeze(algorithms);
    factory.get = function(algorithm) {
      var helper = instances[normalize(algorithm)];
      if (! helper) throw new Error("Unrecognized algorithm " + algorithm);
      return helper;
    }

    if (freeze) Object.freeze(factory);
    return factory;
  }

  return Object.freeze({
    makeHelper:  makeHelper,
    makeFactory: makeFactory
  });

});
