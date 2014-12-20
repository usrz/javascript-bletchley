'use strict';

Esquire.define('bletchley/utils/classes', function() {

  function props(instance, properties) {
    if (instance === null) return properties;
    if (instance === Object.prototype) return properties;

    /* Object's prototype inherited properties */
    properties = props(Object.getPrototypeOf(instance), properties);

    /* Own (enumerable or not) properties */
    Object.getOwnPropertyNames(instance).forEach(function(name) {
      properties[name] = instance.propertyIsEnumerable(name);
    });

    return properties;
  }

  /* ======================================================================== */

  function bind(instance) {
    console.warn("REQUESTED BINDING OF", name(instance));

    /* Find all the properties (inherited or not) */
    var properties = props(instance, {});

    /* Iterate all properties */
    for (var i in properties) (function (name) {
      var enumerable = properties[name];
      var property = instance[name];

      /* Bind and lock all the functions */
      if (typeof(property) === 'function') {
        if (name === 'constructor') return;
        if (name === '$super') return;
        Object.defineProperty(instance, name, {
          configurable: false,
          enumerable: enumerable,
          value: function() {
            /* Do not trust "function.bind()" */
            return property.apply(instance, arguments)
          }
        });
      }
    })(i);

  }

  /* ======================================================================== */

  function name(object) {
    if (object === undefined) return '(undefined)';
    if (object === null) return '(null)';

    var type = typeof(object);
    if (type === 'function') {
      var name = object.name;
      if (! name) return '(function)';
      return '(function ' + name + ')';
    }

    if (type === 'object') {
      var prototype = Object.getPrototypeOf(object);
      if (prototype && prototype.constructor && prototype.constructor.name) {
        return '(object ' + prototype.constructor.name + ')';
      } else {
        return ('(object)');
      }
    }

    return '(' + type + ')';
  }

  /* ======================================================================== */

  function lock(object) {
    var properties = props(object, {});

    for (var name in properties) (function (name) {
      var enumerable = properties[name];
      var property = object[name];
      if (typeof(property) == 'function') {
        Object.defineProperty(object, name, {
          enumerable: enumerable,
          configurable: false,
          value: property
        });
      }
    })(name);
    return object;
  }

  function extend(ext, base) {
    if (!base) base = Object;
    if (typeof(base) !== 'function') throw new Error("Base class must be a function");
    if (typeof(ext) !== 'function') throw new Error("Extending class must be a function");

    /* Our prototype */
    var prototype = Object.create(base.prototype);

    /* Copy anything defined on the extended prototype */
    var properties = Object.getOwnPropertyNames(ext.prototype);
    console.warn("COPYING", properties, "FROM", name(ext));
    for (var i in properties) (function(name) {
      prototype[name] = ext.prototype[name];
    })(properties[i]);

    /* Force set our constructor */
    prototype.constructor = ext;

    /* Lock up the prototype */
    ext.prototype = prototype;

    /* Instrument our extended class */
    Object.defineProperty(ext, "$super", {
      configurable: false,
      enumerable: false,
      value: function(sub) {
        return extend(sub, ext);
      }
    });

    /* Freeze the extended class */
    return Object.freeze(ext);
  }


  return Object.freeze({
    "extend": extend,
    "lock": lock,
    "bind": bind,
    "name": name
  });

});
