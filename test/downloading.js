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

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
}


describe("Searching for a library", function() {
  beforeEach(setup);

  it("searches the api for it", function(done) {
    var api = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
    var pulldown = new Pulldown();
    pulldown.init(["jquery"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js", undefined), "getFile was called with the expected arguments");
      done();
    });
  });

  it("doesn't call getFile if nothing is found", function(done) {
    var api = mockAndReturn("jquery", []);
    new Pulldown().init(["jquery"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(!spy.called, "it did not call the getFile spy");
      assert(log.indexOf("Nothing found for jquery") > -1, "It tells the user it didn't find anything");
      done();
    });
  });
});

describe("Downloading with custom file name", function() {
  beforeEach(setup);
  it("lets the user specify the filename", function(done) {
    var api = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
    new Pulldown().init(["jquery::foo.js"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js", "foo.js"), "getFile was called with the expected arguments");
      done();
    });
  });
});

describe("Searching for a set", function() {
  beforeEach(setup);

  it("calls getFile for each of the files", function(done) {
    var apiSet = mockAndReturn("backbone", [ "backbone.js", "underscore", "jquery" ]);
    var apiBackbone = mockAndReturn("backbone.js", [ "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js" ]);
    var apiUnderscore = mockAndReturn("underscore", [ "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js" ]);
    var apiJQuery = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);

    new Pulldown().init(["backbone"], function() {
      assert(apiSet.isDone(), "the API was hit");
      assert(spy.calledThrice, "getFile was called 3 times");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"), "getFile was called for Backbone");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js"), "getFile was called for Underscore");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"), "getFile was called for jQuery");
      done();
    });
  });
});

describe("Downloading from local JSON", function() {
  beforeEach(function() {
    setup();
    Pulldown.prototype.getLocalJson = function() {
      return { "jquery": "http://foo.com/madeup.js" };
    };
  });

  it("searches that before searching the web", function(done) {
    new Pulldown().init(["jquery"], function() {
      assert(spy.calledWith("http://foo.com/madeup.js"), "getFile was called with the local URL");
      done();
    });
  });
});

describe("Downloading from URL", function() {
  beforeEach(setup);
  it("can accept a URL to download", function(done) {
    new Pulldown().init(["http://foo.com/madeup.js"], function() {
      assert(spy.calledWith("http://foo.com/madeup.js"), "getFile was called with the URL passed to Pulldown");
      done();
    });
  });

  it("can accept a URL to download and a custom name", function(done) {
    new Pulldown().init(["http://foo.com/madeup.js::test.js"], function() {
      assert(spy.calledWith("http://foo.com/madeup.js", "test.js"), "getFile was called with the URL passed to Pulldown");
      done();
    });
  });
});
