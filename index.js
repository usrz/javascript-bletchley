'use strict';

var esquire = require('esquire');

var path = require('path').join(__dirname, "src");
require("fs").readdirSync(path).forEach(function(file) {
  require("./src/" + file);
});

module.exports = esquire('bletchley');
