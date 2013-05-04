#!/usr/bin/env node

//some dependencies
var URL = require('url'),
    fs = require('fs'),
    request = require('request'),
    shell = require('shelljs'),
    pkg = require('./package.json'),
    resolve = require("pulldown-resolve");

//terminal output colours!
//via http://roguejs.com/2011-11-30/console-colors-in-node-js/
var red   = '\033[31m',
    green = '\033[32m',
    reset = '\033[0m';

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
  var res = this.processUserArgs();
  this.downloadFiles();
};

Pulldown.prototype.getLocalJson = function() {
  var file;
  try {
    file = JSON.parse(fs.readFileSync(process.env["HOME"] + "/.pulldown.json").toString());
  } catch(e) { file = {} };
  return file;
};

Pulldown.prototype.processUserArgs = function() {
  var self = this;
  var args = process.argv.slice(2);
  args.forEach(function(item) {
    var parsedUrls = self.parsePackageArgument(item);
    var outputDestination = item.split(":")[1];
    if(parsedUrls) {
      parsedUrls.forEach(function(url) {
        self.files.push({ url: url, out: outputDestination });
      });
    }
  });
  return this.files;
};

Pulldown.prototype.parsePackageArgument = function(searchTerm) {
  // look within ~/.pulldown.json first
  searchTerm = searchTerm.split(":")[0];
  var resultUrls = [];
  // pulldown-resolve goes here
  var urls = resolve(searchTerm, this.localJson);
  if(urls.length) {
    resultUrls = resultUrls.concat(urls);
  } else {
    // else hit the CDN
    resultUrls.push(this.cdnUrl(searchTerm));
  }
  return resultUrls;
};

Pulldown.prototype.cdnUrl = function(term) {
  // hit CDN
  return "http://code.jquery.com/jquery-1.9.1.js";
};

Pulldown.prototype.findUrlForString = function(arg) {
  // string could either be URL, in which case return it
  // or a search term, in which case try to find the URL
  // first from local pulldown.json or CDN
  if(isUrl(arg)) return arg;

  var localRes = this.localJson[arg];
  if(localRes && isUrl(localRes)) return localRes;

  return this.cdnUrl(arg);
};

Pulldown.prototype.downloadFiles = function() {
  this.files.forEach(function(file) {
    this.getFile(file);
  }.bind(this));
};

Pulldown.prototype.getFile = function(fileObj) {
  var fileDestination = fileObj.out || URL.parse(fileObj.url).pathname.split('/').pop();
  request(fileObj.url).pipe(fs.createWriteStream(fileDestination).on("close", function() {
    log("Success: " + fileObj.url + " has been downloaded to " + fileDestination, green);
  }));
};

// let's kick this thing off
var pulldown = new Pulldown();
pulldown.init();
