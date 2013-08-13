var assert = require("assert");
var Pulldown = require("../pulldown");
var nock = require("nock");
var sinon = require("sinon");
var spy, log;

var setup = function() {
  spy = sinon.spy();
  Pulldown.prototype.getFile = function(url, out, doneGetFile) {
    spy.apply(this, Array.prototype.slice.call(arguments));
    return doneGetFile(null, { url: url, fileDestination: out });
  };

  log = [];
  Pulldown.prototype.log = function(message, colour) {
    log.push(message);
  }
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

  it("doesn't call getFile if nothing is found", function(done) {
    var api = nock("http://pulldown-api.herokuapp.com/")
              .get("/set/jquery")
              .reply(200, []);
    new Pulldown().init(["jquery"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(!spy.called, "it did not call the getFile spy");
      assert(log.indexOf("Nothing found for jquery") > -1, "It tells the user it didn't find anything");
      done();
    });
  });
});
