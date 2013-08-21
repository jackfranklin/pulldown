var assert   = require("assert");
var Pulldown = require("../pulldown");
var nock     = require("nock");

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};

before(function() {
  nock("https://cdnjs.cloudflare.com/")
    .persist()
    .get("/ajax/libs/jquery/2.0.3/jquery.min.js")
    .reply(200, "Hello World");
});

describe("downloading", function() {
  describe("Searching for a library", function() {
    it("searches the api for it", function(done) {
      var api = mockAndReturn("jquery", [ "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" ]);
      new Pulldown().init(["jquery"], function(err, results) {
        assert.equal(results[0].url, "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js");
        assert(api.isDone());
        done();
      });
    });
  });
});
