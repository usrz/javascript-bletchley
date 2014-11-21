'use strict';

var esquire = require('esquire');
var defers = require('defers');
var path = require('path');
var fs = require('fs');

function requireAll(base) {
  if (fs.lstatSync(base).isDirectory()) {
    fs.readdirSync(base).forEach(function(file) {
      requireAll(path.join(base, file));
    });
  } else if (fs.lstatSync(base).isFile()) {
    require(base);
  }
}
requireAll(path.join(__dirname, "src"));

module.exports = esquire('bletchley/codecs');
