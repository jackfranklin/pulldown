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
  this.userArgs = userArgs;
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
    callback(set);
  });
};

Pulldown.prototype.downloadFiles = function(urls) {
  urls.forEach(function(file) {
    this.getFile(file);
  }.bind(this));
};

Pulldown.prototype.getFile = function(url) {
  var fileDestination = URL.parse(url).pathname.split('/').pop();
  request(url).pipe(fs.createWriteStream(fileDestination).on("close", function() {
    log("Success: " + url + " has been downloaded to " + fileDestination, green);
  }));
};

// let's kick this thing off
var pulldown = new Pulldown();
pulldown.init(process.argv.slice(2));
