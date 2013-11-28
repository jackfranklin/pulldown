#!/usr/bin/env node
var fs           = require('fs');
var EventEmitter = require('events').EventEmitter;
var request      = require('request');
var pkg          = require('./package.json');
var resolve      = require("pulldown-resolve");
var middleMan    = require("pulldown-middle-man");
var path         = require("path");
var async        = require("async");
var _            = require("underscore");


var pulldown = Object.create(new EventEmitter());
pulldown.files = [];

pulldown.init = function(userArgs, done) {
  done = done || function () {};
  this.processDownload(userArgs, done);
};

pulldown.ls = function(done) {
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

pulldown.processDownload = function(userArgs, done) {
  this.localJson = this.getLocalJson();
  this.processUserArgs(userArgs, function(urls) {
    this.downloadFiles(urls, done);
  }.bind(this));
};

pulldown.help = function() {
  console.log();
  console.log('  Usage: pulldown <identifier>[::<file>] [<identifier>[::<file>], ...] [options]');
  console.log();
  console.log('  An <identifier> can be a URL, a library name or a set.');
  console.log();
  console.log('  Options:');
  console.log();
  console.log('    -o, --output  output directory');
  console.log();
  console.log('    -d, --dry-run  don\'t actually download the files');
  console.log();
  console.log('    -v, --version  get the current pulldown version');
  console.log();
  console.log('    -n, --noisy  verbose mode, basically');
  console.log();
  console.log('  Example usage:');
  console.log();
  console.log('    pulldown jquery             # Downloads jQuery');
  console.log('    pulldown jquery::jq.js      # Downloads jQuery to jq.js');
  console.log('    pulldown jquery angular.js  # Downloads jQuery and Angular.js');
  console.log('    pulldown backbone           # Downloads jQuery, Underscore.js and Backbone.js');
  console.log('    pulldown backbone -o js     # Downloads same as above, but into js/');
  console.log();
};

pulldown.getLocalJson = function() {
  var file;
  var homeDir = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  try {
    file = JSON.parse(fs.readFileSync(path.join(homeDir, ".pulldown.json")).toString());
  } catch(e) { file = {}; }

  return file;
};

pulldown.processUserArgs = function(userArgs, callback) {
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

pulldown.resolved = pulldown.emit.bind(pulldown, 'resolved');
resolve.on('resolved', pulldown.resolved);

pulldown.parsePackageArgument = function(searchTerm, callback) {
  var self = this;
  resolve.identifier(searchTerm, {
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

pulldown.downloadFiles = function(urls, downloadDone) {
  async.map(urls, function(library, done) {
    this.download(library, done);
  }.bind(this), downloadDone);
};

pulldown.download = function(library, doneGetFile) {
  if(!library.found) {
    return doneGetFile(null, library);
  }

  var url = library.url;
  request(url, function(err, resp, body) {
    if(err) return doneGetFile(err);
    return doneGetFile(null, { searchTerm: library.searchTerm, url: url, contents: body, found: true });
  });
};

module.exports = pulldown;
