var assert = require('assert');
var nodefetch = require('../nodefetch');
var shell = require('shelljs');


//use a scrap folder for all the test DLs
shell.rm("-rf", "testdls");
shell.mkdir("testdls");
shell.cd("testdls");

//override userHome method so I can use a test nodefetch.json file in the test dir rather than the "real" one in the home
nodefetch.userHome = function() {
  return ".";
}

//quick utility function to get rid of our test settings file
function removeTestFiles() {
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
    assert.equal(nodefetch.parsePackageArgument("jquery").url, "http://code.jquery.com/jquery.min.js");
    assert.equal(nodefetch.parsePackageArgument("jquery").output, "jquery.min.js");
    assert.equal(nodefetch.parsePackageArgument("backbone:b.js").output, "b.js");
    assert.throws(function() {
      nodefetch.parsePackageArgument("doesntexist");
    }, Error);
  });
}

tests.getFile = function() {
  nodefetch.getSettingsFile(function() {
    nodefetch.readPackagesFromSettings();
    var parsed = nodefetch.parsePackageArgument("jquery:test-download.js");
    nodefetch.getFile(parsed.url, parsed.output, function() {
      assert.ok(shell.test("-f", parsed.output));
    });
    var parsed2 = nodefetch.parsePackageArgument("jquery");
    nodefetch.getFile(parsed2.url, parsed2.output, function() {
      assert.ok(shell.test("-f", parsed2.output));
    });
  });
};

//very quick and dirty test runner but it does the job
for(test in tests) {
  removeTestFiles();
  console.log("-> Executing", test);
  tests[test]();
}
