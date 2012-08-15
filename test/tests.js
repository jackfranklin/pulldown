var assert = require('assert');
var nodefetch = require('../nodefetch');
var shell = require('shelljs');

//tell nodefetch we're testing
nodefetch.isTest = true;

//override userHome method so I can use a test nodefetch.json file
nodefetch.userHome = function() {
  return "."; //sets to current directory
}

//test getSettings
