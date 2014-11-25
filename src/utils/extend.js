'use strict';

Esquire.define('bletchley/utils/extend', [], function() {

  return function(extendedClass, baseClass, prototypeName) {
    if (typeof(extendedClass) !== 'function') throw new Error("Extended class nota function");
    if (typeof(baseClass) !== 'function') throw new Error("Base class nota function");

    extendedClass.prototype = Object.create(baseClass.prototype);
    extendedClass.prototype.constructor = extendedClass;

    if (typeof(prototypeName) === 'undefined') prototypeName = extendedClass.name;
    if (prototypeName) extendedClass.prototype.name = prototypeName;

    return extendedClass;
  };

});
