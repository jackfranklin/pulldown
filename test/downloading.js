var assert   = require("assert");
var Pulldown = require("../pulldown");
var nock     = require("nock");
var sinon    = require("sinon");
var spy, log;
var oldGetFile = Pulldown.prototype.processFileGet;

var setup = function() {
  spy = sinon.spy();
  Pulldown.prototype.processFileGet = function(url, out, doneGetFile) {
    spy.apply(this, Array.prototype.slice.call(arguments));
    return doneGetFile(null, { url: url, fileDestination: out });
  };
  stubLogs();
};

var after = function() {
  restoreGetFile();
  nock.cleanAll();
};

var stubLogs = function() {
  log = [];
  Pulldown.prototype.log = function(message, colour) {
    log.push(message);
  };
};

var restoreGetFile = function() {
  Pulldown.prototype.processFileGet = oldGetFile;
};

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};

beforeEach(setup);
afterEach(after);

describe("Searching for a library", function() {
  it("searches the api for it", function(done) {
    var api = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
    var pulldown = new Pulldown();
    pulldown.init(["jquery"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js", undefined), "processFileGet was called with the expected arguments");
      done();
    });
  });

  it("doesn't call processFileGet if nothing is found", function(done) {
    var api = mockAndReturn("jquery", []);
    new Pulldown().init(["jquery"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(!spy.called, "it did not call the processFileGet spy");
      assert(log.indexOf("Nothing found for jquery") > -1, "It tells the user it didn't find anything");
      done();
    });
  });
});

describe("Downloading with custom file name", function() {
  it("lets the user specify the filename", function(done) {
    var api = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
    new Pulldown().init(["jquery::foo.js"], function() {
      assert(api.isDone(), "the API was hit with /set/jquery");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js", "foo.js"), "processFileGet was called with the expected arguments");
      done();
    });
  });

  it("supports more complex paths", function(done) {
    restoreGetFile();
    var api = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
    var downloadSpy = sinon.spy();
    var oldDownload = Pulldown.prototype.download;
    Pulldown.prototype.download = function(url, dest, zip, cb) {
      downloadSpy.apply(this, Array.prototype.slice.call(arguments));
      return cb(null);
    };
    new Pulldown().init(["jquery::bar/baz/foo.js"], function() {
      assert(downloadSpy.calledWith(
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js",
        "bar/baz/foo.js"
      ), "download is called with right arguments");
      Pulldown.prototype.download = oldDownload;
      done();
    });
  });
});

describe("Searching for a set", function() {

  it("calls processFileGet for each of the files", function(done) {
    var apiSet = mockAndReturn("backbone", [ "backbone.js", "underscore", "jquery" ]);
    var apiBackbone = mockAndReturn("backbone.js", [ "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js" ]);
    var apiUnderscore = mockAndReturn("underscore", [ "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js" ]);
    var apiJQuery = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);

    new Pulldown().init(["backbone"], function() {
      assert(apiSet.isDone(), "the API was hit");
      assert(spy.calledThrice, "processFileGet was called 3 times");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"), "processFileGet was called for Backbone");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js"), "processFileGet was called for Underscore");
      assert(spy.calledWith("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"), "processFileGet was called for jQuery");
      done();
    });
  });
});

describe("Downloading from local JSON", function() {
  var oldGetJson;
  beforeEach(function() {
    oldGetJson = Pulldown.prototype.getLocalJson;
    Pulldown.prototype.getLocalJson = function() {
      return { "jquery": "http://foo.com/madeup.js" };
    };
  });
  afterEach(function() {
    Pulldown.prototype.getLocalJson = oldGetJson;
  });

  it("searches that before searching the web", function(done) {
    new Pulldown().init(["jquery"], function() {
      assert(spy.calledWith("http://foo.com/madeup.js"), "processFileGet was called with the local URL");
      done();
    });
  });
});

describe("Downloading from URL", function() {
  it("can accept a URL to download", function(done) {
    new Pulldown().init(["http://foo.com/madeup.js"], function() {
      assert(spy.calledWith("http://foo.com/madeup.js"), "processFileGet was called with the URL passed to Pulldown");
      done();
    });
  });

  it("can accept a URL to download and a custom name", function(done) {
    new Pulldown().init(["http://foo.com/madeup.js::test.js"], function() {
      assert(spy.calledWith("http://foo.com/madeup.js", "test.js"), "processFileGet was called with the URL passed to Pulldown");
      done();
    });
  });
});

describe("Depreciation warning", function() {
  beforeEach(restoreGetFile);
  afterEach(after);
  it("tells the user if they only used one : instead of the new 2 and does not throw", function(done) {
    assert.doesNotThrow(function() {
      new Pulldown().init(['jquery:foo.js'], function() {
        assert(log.indexOf("Error: you have to use two colons (::) to specify file name, not just one.") > -1, "An error message is logged");
        done();
      });
    });
  });
});

describe("Listing sets", function() {

  it("lists all the sets but not the single mappings", function(done) {
    var api = nock("http://pulldown-api.herokuapp.com")
         .get("/")
         .reply(200, {
           "backbone": [
             "backbone.js",
             "underscore",
             "jquery"
           ],
           "marionette": [
             "backbone",
             "backbone.marionette"
           ],
           "bootstrap": "foo"
         });
    new Pulldown().init(["ls"], function() {
      var logged = "backbone: backbone.js, underscore, jquery";
      var notLogged = "bootstrap: foo";
      assert(log.indexOf(logged) > -1, "it logs out the sets");
      assert(log.indexOf(notLogged) == -1, "it does not log out the non set");
      assert(api.isDone(), "The API index is hit");
      done();
    });
  });
});

describe("dry run", function() {
  beforeEach(function() {
    restoreGetFile();
    stubLogs();
  });
  afterEach(after);

  it("does not download the files", function(done) {
    var url = "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js";
    var api = mockAndReturn("jquery", [ url ]);
    new Pulldown().init(["-d", "jquery"], function() {
      assert(api.isDone(), "The API is searched");
      var logged = "https:" + url + " would have been downloaded to jquery.min.js";
      assert(log.indexOf("Dry Run - no files will be downloaded") > -1, "it logs that it is a dry run");
      assert(log.indexOf(logged) > -1, "It logs what would have happened");
      done();
    });
  });

  it("shows where the zip would have been extracted to", function(done) {
    var url = "//some/zip/foo.zip";
    var api = mockAndReturn("jquery", [ url ]);
    new Pulldown().init(["--dry-run", "jquery"], function() {
      assert(log.indexOf("foo.zip would have been extracted to foo") > -1, "it logs the zip extraction destination");
      done();
    });
  });
});

describe("the -o flag", function() {
  beforeEach(function() {
    restoreGetFile();
    stubLogs();
  });
  it("lets you specify an output dir", function(done) {
    var url = "//some/jquery.js";
    var api = mockAndReturn("jquery", [ url ]);
    new Pulldown().init(["jquery", "-o", "foo", "-d"], function() {
      var expected = "https://some/jquery.js would have been downloaded to foo/jquery.js";
      assert(log.indexOf(expected) > -1, "it logs out the output dir");
      done();
    });
  });
});
