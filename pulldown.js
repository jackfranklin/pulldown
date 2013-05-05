#!/usr/bin/env node

//some dependencies
var URL = require('url');
var fs = require('fs');
var request = require('request');
var shell = require('shelljs');
var pkg = require('./package.json');
var resolve = require("pulldown-resolve");
var middleMan = require("pulldown-middle-man");
var path = require("path");
var optimist = require("optimist");

//terminal output colours!
//via http://roguejs.com/2011-11-30/console-colors-in-node-js/
var red   = '\033[31m';
var green = '\033[32m';
var reset = '\033[0m';

var log = function(message, colour) {
  colour ? console.log("->", colour, message, reset) : console.log("->", message);
};

var isUrl = function(str) {
  return !!URL.parse(str).hostname;
};

var Pulldown = function() {
  this.files = [];
};

Pulldown.prototype.init = function(userArgs) {
  var inputArgs = optimist.parse(userArgs);
  this.userArgs = inputArgs._;
  this.outputDir = inputArgs.o || inputArgs.output;
  if(this.outputDir) {
    // we're going to be writing here, so we should make sure it exists
    shell.mkdir('-p', this.outputDir);
  }

  this.localJson = this.getLocalJson();
  this.processUserArgs(function(urls) {
    this.downloadFiles(urls);
  }.bind(this));
};

Pulldown.prototype.getLocalJson = function() {
  var file;
  var homeDir = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  try {
    file = JSON.parse(fs.readFileSync(path.join(homeDir, ".pulldown.json")).toString());
  } catch(e) { file = {}; };
  return file;
};

Pulldown.prototype.processUserArgs = function(callback) {
  this.userArgs.forEach(function(item) {
    this.parsePackageArgument(item, function(data) {
      callback(data);
    }.bind(this));
  }.bind(this));

};

Pulldown.prototype.parsePackageArgument = function(searchTerm, callback) {
  var split = searchTerm.split(":");
  var outputName = split[1];
  searchTerm = split[0];
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
    if(!set.length) {
      log("Nothing found for " + searchTerm, red);
    }
    set = set.map(function(item) {
      return item[0] === "/" ? "https:" + item : item;
    });
    var resp = [];
    set.forEach(function(item) {
      resp.push({ url: item, outputName: outputName });
    });
    callback(resp);
  });
};

Pulldown.prototype.downloadFiles = function(urls) {
  urls.forEach(function(file) {
    this.getFile(file.url, file.outputName);
  }.bind(this));
};

Pulldown.prototype.getFile = function(url, out) {
  out = out || URL.parse(url).pathname.split("/").pop();
  var fileDestination = path.join(this.outputDir || ".", out);
  request(url).pipe(fs.createWriteStream(fileDestination).on("close", function() {
    log("Success: " + url + " has been downloaded to " + fileDestination, green);
  }));
};

// let's kick this thing off
var pulldown = new Pulldown();
pulldown.init(process.argv.slice(2));

// export for testing
module.exports = Pulldown;
