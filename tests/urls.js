var assert = require("assert");
var Pulldown = require("../pulldown");
var sinon = require("sinon");


describe("Pulling down URLs", function() {
  var pulldown, theSpy;
  beforeEach(function() {
    theSpy = sinon.spy();
    Pulldown.prototype.downloadFiles = theSpy;
    pulldown = new Pulldown();
  });

  it("passes the URL on", function() {
    pulldown.init(["http://code.jquery.com/jquery-1.10.0.min.js"]);
    var expectedArgs = [{
      url: "http://code.jquery.com/jquery-1.10.0.min.js"
    }]
    assert(theSpy.calledWith(expectedArgs));
  });

  it("can save a file to a specific URL", function() {
    pulldown.init(["http://code.jquery.com/jquery-1.10.0.min.js::foo.js"]);
    var expectedArgs = [{
      url: "http://code.jquery.com/jquery-1.10.0.min.js",
      outputName: "foo.js"
    }]
    assert(theSpy.calledWith(expectedArgs));
  });

  it("handles multiple :: properly", function() {
    pulldown.init(["http://made::up.com::foo.js"]);
    var expectedArgs = [{
      url: "http://made::up.com",
      outputName: "foo.js"
    }];
    assert(theSpy.calledWith(expectedArgs));
  });
});
