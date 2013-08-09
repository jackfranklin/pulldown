var assert = require("assert");
var Pulldown = require("../pulldown");
var nock = require("nock");
var sinon = require("sinon");
var spy;

var setup = function() {
  spy = sinon.spy();
  Pulldown.prototype.getFile = function(url, out, doneGetFile) {
    spy.apply(this, Array.prototype.slice.call(arguments));
    return doneGetFile(null, { url: url, fileDestination: out });
  };
};


describe("Searching for a library", function() {
  beforeEach(setup);

  it("searches the api for it", function(done) {
    var api = nock("http://pulldown-api.herokuapp.com/")
              .get("/set/jquery")
              .reply(200, [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
    var pulldown = new Pulldown();
    pulldown.init(["jquery"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js", undefined), "getFile was called with the expected arguments");
      done();
    });
  });
});
