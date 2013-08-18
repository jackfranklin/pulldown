var assert   = require("assert");
var Pulldown = require("../pulldown");
var nock     = require("nock");
var fs       = require("fs");
var shell    = require("shelljs");

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};

var setup = function() {
  nock("http://madeup.com")
    .persist()
    .get("/foo.js")
    .reply(200, fs.readFileSync("test/fixtures/foo.js"));


  nock("http://pulldown-api.herokuapp.com/")
    .persist()
    .get("/set/jquery")
    .reply(200, [ "http://madeup.com/foo.js" ]);
};

var assertFileExists = function(name) {
  assert(fs.existsSync(name), "File " + name + " exists");
};




describe("Downloading a file", function() {
  beforeEach(function() {
    setup();
    shell.cd("test/tmp");
  });
  afterEach(function() {
    shell.cd("../..");
  });
  it("downloads the file", function(done) {
    new Pulldown().init(["jquery"], function() {
      assertFileExists("foo.js");
      done();
    });
  });

  it("can download to a custom name", function(done) {
    new Pulldown().init(["jquery::test.js"], function() {
      assertFileExists("test.js");
      done();
    });
  });

  it("supports complex paths", function(done) {
    new Pulldown().init(["jquery::foo/bah/test.js"], function() {
      assertFileExists("foo/bah/test.js");
      done();
    });
  });
});
