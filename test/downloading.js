var assert   = require("assert");
var Pulldown = require("../pulldown");
var nock     = require("nock");
var helpers = require("./helpers");

before(function() {
  nock("https://cdnjs.cloudflare.com/")
    .persist()
    .get("/ajax/libs/jquery/2.0.3/jquery.min.js")
    .reply(200, "Hello World");

  nock("http://pulldown-api.herokuapp.com/")
    .persist()
    .get("/set/jquery")
    .reply(200, [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
});

after(function() {
  nock.cleanAll();
});


describe("downloading", function() {
  it("searches the api for it", function(done) {
    new Pulldown().init(["jquery"], function(err, results) {
      assert.equal(results[0].url, "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js");
      assert.equal(results[0].contents, "Hello World");
      done();
    });
  });

  it("returns false if it can't find a library", function(done) {
    helpers.mockAndReturn("foobar", []);
    new Pulldown().init(["foobar"], function(err, results) {
      assert.equal(results[0].found, false);
      done();
    });
  });

  it("can download a URL", function(done) {
    var url = "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js";
    helpers.mockCdn("/ajax/libs/underscore.js/1.5.1/underscore-min.js");
    new Pulldown().init([url], function(err, results) {
      assert.equal(results[0].url, url);
      done();
    });
  });

  describe("downloading a set", function() {
    before(function() {
      helpers.mockAndReturn("backbone", ["backbone.js", "underscore", "jquery"]);
      helpers.mockAndReturn("backbone.js", [ "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js" ]);
      helpers.mockAndReturn("underscore", [ "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js" ]);
      helpers.mockCdn("/ajax/libs/underscore.js/1.5.1/underscore-min.js");
      helpers.mockCdn("/ajax/libs/backbone.js/1.0.0/backbone-min.js");
    });
    it("returns all the files in the set", function(done) {
      new Pulldown().init(["backbone"], function(err, results) {
        assert.equal(results.length, 3);
        assert.equal(results[0].url, "https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js");
        assert.equal(results[1].url, "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js" );
        assert.equal(results[2].url, "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js");
        done();
      });
    });
  });
});
