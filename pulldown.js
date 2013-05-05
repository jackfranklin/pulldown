#!/usr/bin/env node

//some dependencies
var URL = require('url');
var fs = require('fs');
var request = require('request');
var shell = require('shelljs');
var pkg = require('./package.json');
var resolve = require("pulldown-resolve");
var middleMan = require("pulldown-middle-man");

//terminal output colours!
//via http://roguejs.com/2011-11-30/console-colors-in-node-js/
var red   = '\033[31m';
var green = '\033[32m';
var reset = '\033[0m';

var log = function(message, colour) {
  colour ? console.log("->", colour, message, reset) : console.log("->", message);
};

var isUrl = function(str) {
  return str.match(/\/\//);
};

var Pulldown = function() {
  this.files = [];
};

Pulldown.prototype.init = function() {
  this.localJson = this.getLocalJson();
  var self = this;
  var res = this.processUserArgs(function(urls) {
    self.downloadFiles(urls);
  });
};

Pulldown.prototype.getLocalJson = function() {
  var file;
  try {
    file = JSON.parse(fs.readFileSync(process.env["HOME"] + "/.pulldown.json").toString());
  } catch(e) { file = {} };
  return file;
};

Pulldown.prototype.processUserArgs = function(callback) {
  var self = this;
  var args = process.argv.slice(2);
  args.forEach(function(item) {
    self.parsePackageArgument(item, function(data) {
      callback(data);
    });
  });
  return this.files;
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
pulldown.init();
