var nock = require("nock");

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
