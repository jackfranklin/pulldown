var assert = require("assert");
var Pulldown = require("../pulldown");
var sinon = require("sinon");

describe("Finding a library", function() {
  var pulldown, theSpy;
  beforeEach(function() {
    theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = theSpy;
    pulldown = new Pulldown();
  });

  it("uses the local json file first", function() {
    pulldown.getLocalJson = function() {
      return {
        jquery: "http://madeup.com/foo.js"
      };
    };
    pulldown.init(["jquery"]);
    var expectedArgs = [{
      url: "http://madeup.com/foo.js"
    }];
    assert(theSpy.calledWith(expectedArgs));
  });

  it("falls back to the CDN", function() {
    // this one fails and I can't work out why
    // something's going wrong in the middleman callback
    // works if manually run, this fails
    // spy is never called
    pulldown.init(["jquery"]);
    assert(theSpy.called);
  });
});

