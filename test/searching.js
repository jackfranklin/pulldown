var assert = require("assert");
var Pulldown = require("../pulldown");
var sinon = require("sinon");

var getFileMock = require('./mock/getFile');
var getLocalJsonMock = require('./mock/getLocalJson');

Pulldown.prototype.getFile = getFileMock;
Pulldown.prototype.getLocalJson = getLocalJsonMock;

describe("Searching for a library", function() {

  it("uses the local json file first", function (done) {
    var oldMethod = Pulldown.prototype.downloadFiles;
    var theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = function(urls, done) {
      theSpy.call(this, urls);
      oldMethod.call(this, urls, done);
    };
    var pulldown = new Pulldown();
    pulldown.getLocalJson = function() {
      return {
        jquery: "http://madeup.com/foo.js"
      };
    };
    pulldown.init(["jquery"], function () {
      var expectedArgs = [{
        url: "http://madeup.com/foo.js"
      }];
      assert(theSpy.calledWith(expectedArgs));
      done();
    });
  });

  it("falls back to the CDN", function(done) {
    var oldMethod = Pulldown.prototype.downloadFiles;
    var theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = function(urls, done) {
      theSpy.call(this, urls);
      oldMethod.call(this, urls, done);
    };
    var pulldown = new Pulldown();
    pulldown.init(["jquery"], function () {
      var expectedArgs = [{
        url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js'
      }];
      assert(theSpy.calledWith(expectedArgs));
      done();
    });
  });
});

