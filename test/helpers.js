var nock   = require("nock");
var fs     = require("fs");
var assert = require("assert");

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};

var mockCdn = function(url) {
  return nock("https://cdnjs.cloudflare.com/")
        .get(url)
        .reply(200, "Hello World");
};

exports.mockCdn = mockCdn;
exports.mockAndReturn = mockAndReturn;

exports.assertFileExists = function(name) {
  assert(fs.existsSync(name), "File " + name + " does not exist");
};

exports.refuteFileExists = function(name) {
  assert(!fs.existsSync(name), "File " + name + " exists");
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
