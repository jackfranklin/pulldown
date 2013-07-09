var assert = require("assert");
var Pulldown = require("../pulldown");
var sinon = require("sinon");

var getFileMock = require('./mock/getFile');
var getLocalJsonMock = require('./mock/getLocalJson');

Pulldown.prototype.getFile = getFileMock;
Pulldown.prototype.getLocalJson = getLocalJsonMock;

describe("Pulling down URLs", function() {
  it("passes the URL on", function(done) {
    var oldMethod = Pulldown.prototype.downloadFiles;
    var theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = function(urls, done) {
      theSpy.call(this, urls);
      oldMethod.call(this, urls, done);
    };
    var pulldown = new Pulldown();
    pulldown.init(["http://code.jquery.com/jquery-1.10.0.min.js"], function() {
      var expectedArgs = [{
        url: "http://code.jquery.com/jquery-1.10.0.min.js"
      }]
      assert(theSpy.calledWith(expectedArgs));
      done();
    });
  });

  it("can save a file to a specific URL", function(done) {
    var oldMethod = Pulldown.prototype.downloadFiles;
    var theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = function(urls, done) {
      theSpy.call(this, urls);
      oldMethod.call(this, urls, done);
    };
    var pulldown = new Pulldown();
    pulldown.init(["http://code.jquery.com/jquery-1.10.0.min.js::foo.js"], function() {
      var expectedArgs = [{
        url: "http://code.jquery.com/jquery-1.10.0.min.js",
        outputName: "foo.js"
      }]
      assert(theSpy.calledWith(expectedArgs));
      done();
    });
  });

  it("handles multiple :: properly", function(done) {
    var oldMethod = Pulldown.prototype.downloadFiles;
    var theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = function(urls, done) {
      theSpy.call(this, urls);
      oldMethod.call(this, urls, done);
    };
    var pulldown = new Pulldown();
    pulldown.init(["http://made::up.com::foo.js"], function() {
      var expectedArgs = [{
        url: "http://made::up.com",
        outputName: "foo.js"
      }];
      assert(theSpy.calledWith(expectedArgs));
      done();
    });
  });
});
