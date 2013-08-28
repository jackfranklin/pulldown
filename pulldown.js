#!/usr/bin/env node
var fs        = require('fs');
var request   = require('request');
var pkg       = require('./package.json');
var resolve   = require("pulldown-resolve");
var middleMan = require("pulldown-middle-man");
var path      = require("path");
var async     = require("async");
var _         = require("underscore");

var Pulldown = function() {
  this.files = [];
};

Pulldown.prototype.init = function(userArgs, done) {
  done = done || function () {};
  this.processDownload(userArgs, done);
};

Pulldown.prototype.ls = function(done) {
  done = done || function() {};
  middleMan.index(function(data) {
    var resp = [];
    for(var key in data) {
      if(Array.isArray(data[key])) {
        var items = data[key].join(", ");
        resp.push(key + ": " + items);
      }
    }
    done(resp);
  }.bind(this));
};

Pulldown.prototype.processDownload = function(userArgs, done) {
  this.localJson = this.getLocalJson();
  this.processUserArgs(userArgs, function(urls) {
    this.downloadFiles(urls, done);
  }.bind(this));
};

Pulldown.prototype.help = require("./lib/help");

Pulldown.prototype.getLocalJson = require("./lib/parsejson");

Pulldown.prototype.processUserArgs = function(userArgs, callback) {
  async.map(userArgs, function(item, done) {
    this.parsePackageArgument(item, function(data) {
      done(null, data);
    }.bind(this));
  }.bind(this), function(err, results) {
    results = _.flatten(results);

    // need to make sure each obj in results is uniq
    // easiest way to do this is to stringify them and compare strings
    // filter out dups, and then JSON.parse back to objects
    var jsonResults = results.map(function(item) { return JSON.stringify(item); });
    results = _.uniq(jsonResults).map(function(item) { return JSON.parse(item); });

    callback(results);
  });
};

Pulldown.prototype.parsePackageArgument = function(searchTerm, callback) {
  var self = this;
  resolve(searchTerm, {
    registry: this.localJson,
    helper: function(identifier, callback) {
      middleMan.set(identifier, function(data) {
        data = data.map(function(item) {
          return item[0] === "/" ? "https:" + item : item;
        });
        callback(null, data);
      });
    }
  }, function(err, set) {
    set = set.map(function(item) {
      return item[0] === "/" ? "https:" + item : item;
    });
    var resp = [];
    set.forEach(function(url) {
      resp.push({ searchTerm: searchTerm, found: true, url: url });
    });
    if(!set.length) {
      resp.push({ searchTerm: searchTerm, found: false });
    }
    callback(resp);
  });
};

Pulldown.prototype.downloadFiles = function(urls, downloadDone) {
  async.map(urls, function(library, done) {
    this.download(library, done);
  }.bind(this), downloadDone);
};

Pulldown.prototype.download = function(library, doneGetFile) {
  if(!library.found) {
    return doneGetFile(null, library);
  }

  var url = library.url;
  request(url, function(err, resp, body) {
    if(err) return doneGetFile(err);
    return doneGetFile(null, { searchTerm: library.searchTerm, url: url, contents: body, found: true });
  });
};

module.exports = Pulldown;
