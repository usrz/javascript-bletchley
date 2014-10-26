'use strict';

define([], function() {

  function normalize(stringOrArray) {
    if (Array.isArray(stringOrArray)) return stringOrArray;
    var split = stringOrArray.split('.');
    var components = [];
    for (var i = 0; i < split.length; i ++)
      if (split[i]) components.push(split[i]);
    return components;
  }

  function match(object, properties) {
    /* Edge cases/exits */
    if (! object) return undefined;
    if (properties.length == 0) return undefined;
    if (properties.length == 1) return object[properties[0]];

    /* Recurse in */
    return match(object[properties[0]], properties.slice(1));

  }

  function has() {
    /* Edge cases */
    if (arguments.length == 0) return null;
    if (arguments.length == 1) return arguments[0];

    /* Iterate (recursively) through every argument */
    for (var i = 1; i < arguments.length; i ++) {
      var result = match(arguments[0], normalize(arguments[i]));
      if (result) return result;
    }
  }

  return has;

});
