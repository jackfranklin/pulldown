var assert = require("assert");
var Pulldown = require("../pulldown");
var nock = require("nock");
var sinon = require("sinon");
var spy, log;
var oldGetFile = Pulldown.prototype.getFile;

var setup = function() {
};

var stubLogs = function() {
  log = [];
  Pulldown.prototype.log = function(message, colour) {
    log.push(message);
  };
};

var mockAndReturn = function(searchTerm, result) {
  return nock("http://pulldown-api.herokuapp.com/")
         .get("/set/" + searchTerm)
         .reply(200, result);
};


describe("Downloading and extracting a zip", function() {
  it("extracts it to the CWD", function(done) {
    var api = mockAndReturn("jquery" [ "//cdn//foo.zip" ]);
    new Pulldown().init(["jquery"], function() {
    });
  });

});
