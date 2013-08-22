var assert   = require("assert");
var Pulldown = require("../pulldown");
var nock     = require("nock");

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};

var mockCdn = function(url) {
  nock("https://cdnjs.cloudflare.com/")
    .get(url)
    .reply(200, "Hello World");
};

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
    mockAndReturn("foobar", []);
    new Pulldown().init(["foobar"], function(err, results) {
      assert.equal(results[0].found, false);
      done();
    });
  });

  describe("downloading a set", function() {
    before(function() {
      mockAndReturn("backbone", ["backbone.js", "underscore", "jquery"]);
      mockAndReturn("backbone.js", [ "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js" ]);
      mockAndReturn("underscore", [ "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js" ]);
      mockCdn("/ajax/libs/underscore.js/1.5.1/underscore-min.js");
      mockCdn("/ajax/libs/backbone.js/1.0.0/backbone-min.js");
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
