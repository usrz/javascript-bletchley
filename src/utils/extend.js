'use strict';

Esquire.define('bletchley/utils/extend', [], function() {

  return function(name, baseClass, extendedClass) {
    if (arguments.length === 2) {
      extendedClass = baseClass;
      baseClass = name;
      name = null;
    }

    if (typeof(baseClass) !== 'function') throw new Error("Base class nota function");
    if (typeof(extendedClass) !== 'function') throw new Error("Extended class nota function");

    extendedClass.prototype = Object.create(baseClass.prototype);
    extendedClass.prototype.constructor = extendedClass;
    //if (name) extendedClass.name = name;

    return extendedClass;
  };

});
