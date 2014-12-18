'use strict';

Esquire.define('bletchley/utils/Helper', ['bletchley/utils/BoundClass'], function(BoundClass) {

  function Helper() {
    BoundClass.call(this);
  }

  Helper.prototype = Object.create(BoundClass.prototype);
  Helper.prototype.constructor = Helper;

  return Helper;

})
