var assert = require("assert");
var fs = require("fs");
var childProcess = require("child_process");
var rimraf = require("rimraf");

fs.exists("test/tmp", function(exists) {
  if(!exists) fs.mkdirSync("test/tmp");
});


describe("Integration Tests", function() {
  beforeEach(function(done) {
    rimraf.sync("test/tmp");
    fs.mkdirSync("test/tmp");
    done();
  });

  afterEach(function(done) {
    rimraf.sync("test/tmp");
    done();
  });

  it("downloads files and uses the name from cdnjs", function(done) {
    // without the blank CB func, the test timesout
    // TODO: figure out why it timesout without blank callback
    pd = childProcess.exec('cd test/tmp && pulldown jquery', function() {});
    pd.on("exit", function(code) {
      fs.readdir("test/tmp", function(err, files) {
        console.log(files);
      });
      fs.exists("test/tmp/jquery.min.js", function(exists) {
        assert(exists);
        done();
      });
    });
  });

  it("downloads files with the custom name if specified", function(done) {
    pd = childProcess.exec('cd test/tmp && pulldown jquery::jquery.js', function() {});
    pd.on("exit", function(code) {
      fs.readdir("test/tmp", function(err, files) {
        console.log(files);
      });
      fs.exists("test/tmp/jquery.js", function(exists) {
        assert(exists);
        done();
      });
    });
  });

  it("can download multiple files at once", function(done) {
    pd = childProcess.exec('cd test/tmp && pulldown jquery underscore', function() {});
    pd.on("exit", function(code) {
      fs.readdir("test/tmp", function(err, files) {
        console.log(files);
      });
      var jqueryExists = fs.existsSync("test/tmp/jquery.min.js");
      var underscoreExists = fs.existsSync("test/tmp/underscore-min.js");
      assert(jqueryExists && underscoreExists);
      done();
    });
  });

  it("supports names for multiple downloads", function(done) {
    pd = childProcess.exec('cd test/tmp && pulldown jquery::foo.js underscore::bar.js', function() {});
    pd.on("exit", function(code) {
      fs.readdir("test/tmp", function(err, files) {
        console.log(files);
      });
      var jqueryExists = fs.existsSync("test/tmp/foo.js");
      var underscoreExists = fs.existsSync("test/tmp/bar.js");
      assert(jqueryExists && underscoreExists);
      done();
    });
  });
});
