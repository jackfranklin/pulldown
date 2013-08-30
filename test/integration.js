var CLI     = require("../bin/cli");
var fs      = require("fs");
var shell   = require("shelljs");
var assert  = require("assert");
var helpers = require("./helpers");

var cli;

CLI.prototype.log = function() {};

beforeEach(function() {
  cli = new CLI();
  if(shell.test("-d", "test/tmp")) {
    shell.rm("-r", "test/tmp");
  }
  shell.mkdir("test/tmp");
  shell.cd("test/tmp");
});

afterEach(function() {
  shell.cd("../../");
});

describe("downloading a single library", function() {
  it("downloads jquery", function(done) {
    cli.run({ _:["jquery"] }, function() {
      helpers.assertFileExists("jquery.min.js");
      done();
    });
  });

  it("can take a custom filename", function(done) {
    cli.run({ _:["jquery::foo.js"] }, function() {
      helpers.assertFileExists("foo.js");
      done();
    });
  });

  it("can take a custom path", function(done) {
    cli.run({ _:["jquery::bar/foo.js"] }, function() {
      assert(shell.test("-d", "bar"), "It makes bar the directory");
      helpers.assertFileExists("bar/foo.js");
      done();
    });
  });

  it("can take the -o flag", function(done) {
    cli.run({ _:["jquery"], o: "foo" }, function() {
      helpers.assertFileExists("foo/jquery.min.js");
      done();
    });
  });

  it("can combine the custom path and --output", function(done) {
    cli.run({ _:["jquery::foo.js"], output: "bar" }, function() {
      helpers.assertFileExists("bar/foo.js");
      done();
    });
  });

  it("wont download the file with the -d flag", function(done) {
    cli.run({ _:["jquery"], d: true }, function() {
      assert(!fs.existsSync("jquery.js"));
      done();
    });
  });
});

describe("downloading from a URL", function() {
  var jqueryUrl = "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js";
  it("can download from a URL", function(done) {
    cli.run({_:[jqueryUrl]}, function() {
      assert(fs.existsSync("jquery.min.js"));
      done();
    });
  });

  it("can take a filename", function(done) {
    cli.run({_:[jqueryUrl + "::testing.js"]}, function() {
      assert(fs.existsSync("testing.js"));
      assert(!fs.existsSync("jquery.min.js"));
      done();
    });
  });
});
