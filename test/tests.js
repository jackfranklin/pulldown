var assert = require('assert');
var nodefetch = require('../nodefetch');
var shell = require('shelljs');

//override userHome method so I can use a test nodefetch.json file in the test dir rather than the "real" one in the home
nodefetch.userHome = function() {
  return ".";
}

//quick utility function to get rid of our test settings file
function removeSettings() {
  shell.test("-f", "nodefetch.json") && shell.rm("nodefetch.json");
}

var tests = {};

//test getSettings
tests.getSettings = function() {
  assert.equal(nodefetch.settingsFileExists(), false);
  nodefetch.getSettingsFile(function() {
    assert.equal(nodefetch.settingsFileExists(), true);
  });
};

//test readPackagesFromSettings
tests.readPackagesFromSettings = function() {
  nodefetch.getSettingsFile(function() {
    var packages = nodefetch.readPackagesFromSettings();
    assert.equal(packages['jquery'], 'http://code.jquery.com/jquery.min.js');
    assert.equal(packages['reset'], 'http://meyerweb.com/eric/tools/css/reset/reset.css');
  });
};

tests.updateSettings = function() {
  nodefetch.getSettingsFile(function() {
    var packages = nodefetch.readPackagesFromSettings();
    nodefetch.updateSettings();
    assert.deepEqual(nodefetch.packages, {});
    packages = nodefetch.readPackagesFromSettings();
    assert.notEqual(nodefetch.packages, {});
  });
};


tests.processArguments = function() {
  nodefetch.getSettingsFile(function() {
    nodefetch.readPackagesFromSettings();
    assert.equal(nodefetch.getPackageUrl("jquery").url, "http://code.jquery.com/jquery.min.js");
    assert.equal(nodefetch.getPackageUrl("jquery").output, "jquery.min.js");
    assert.equal(nodefetch.getPackageUrl("backbone:b.js").output, "b.js");
  });
}

//very quick and dirty test runner but it does the job
for(test in tests) {
  removeSettings();
  console.log("-> Executing", test);
  tests[test]();
}
