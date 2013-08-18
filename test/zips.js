var assert   = require("assert");
var Pulldown = require("../pulldown");
var nock     = require("nock");
var sinon    = require("sinon");
var URL      = require('url');
var spy, log;
var oldGetFile = Pulldown.prototype.processFileGet;
var oldExtractZip = Pulldown.prototype.extractZip;
var oldLog = Pulldown.prototype.log;

var stubGetFileForZip = function() {
  nock.cleanAll();
  spy = sinon.spy();
  Pulldown.prototype.processFileGet = function(url, out, cb) {
    out = out || URL.parse(url).pathname.split("/").pop();
    var outPath = this.zipOutPath(out);
    this.extractZip(url, out, outPath, cb);
  };

  Pulldown.prototype.extractZip = function(url, file, out, cb) {
    spy.apply(this, Array.prototype.slice.call(arguments));
    return cb(null, { url: url, fileDestination: out, unzipped: true });
  };
};

var stubLogs = function() {
  log = [];
  Pulldown.prototype.log = function(message, colour) {
    log.push(message);
  };
};

var restoreFns = function() {
  Pulldown.prototype.log = oldLog;
  Pulldown.prototype.processFileGet = oldGetFile;
  Pulldown.prototype.extractZip = oldExtractZip;
};

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};


describe("Downloading and extracting a zip", function() {
  beforeEach(stubGetFileForZip);
  after(restoreFns);
  it("extracts it to the CWD", function(done) {
    var api = mockAndReturn("jquery", [ "//cdn//foo.zip" ]);
    new Pulldown().init(["jquery"], function() {
      assert(spy.calledWith(
        "https://cdn//foo.zip", // url
        "foo.zip", // file name
        "foo" // output dir
      ), "extractZip called with arguments");
      done();
    });
  });

  it("allows the output dir to be defined", function(done) {
    var api = mockAndReturn("jquery", [ "//cdn//foo.zip" ]);
    new Pulldown().init(["jquery", "-o", "bar"], function() {
      assert(spy.calledWith(
        "https://cdn//foo.zip", // url
        "foo.zip", // file name
        "bar/foo" // output dir
      ), "extractZip called with arguments");
      done();
    });
  });
});
