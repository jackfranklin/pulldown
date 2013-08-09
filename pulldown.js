#!/usr/bin/env node

//some dependencies
var URL            = require('url');
var fs             = require('fs');
var request        = require('request');
var shell          = require('shelljs');
var pkg            = require('./package.json');
var resolve        = require("pulldown-resolve");
var middleMan      = require("pulldown-middle-man");
var path           = require("path");
var optimist       = require("optimist");
var async          = require("async");
var unzip          = require("unzip");
var _              = require("underscore");
var chalk          = require("chalk");
var updateNotifier = require('update-notifier');

var log = function(message, colour) {
  var prefix = "->";
  var message = (colour ? chalk[colour](message) : message);
  console.log(prefix, message);
};

var isUrl = function(str) {
  return !!URL.parse(str).hostname;
};

var Pulldown = function() {
  this.files = [];
};

Pulldown.prototype.init = function(userArgs, done) {
  done = done || function () {};
  var inputArgs = optimist.parse(userArgs);
  if (!userArgs.length || inputArgs.h || inputArgs.help) return this.help();
  this.userArgs = inputArgs._;
  this.outputDir = inputArgs.o || inputArgs.output;
  if(this.outputDir) {
    // we're going to be writing here, so we should make sure it exists
    shell.mkdir('-p', this.outputDir);
  }

  this.localJson = this.getLocalJson();
  this.processUserArgs(function(urls) {
    this.downloadFiles(urls, done);
  }.bind(this));
};

Pulldown.prototype.help = function () {
  console.log();
  console.log('  Usage: pulldown <identifier>[::<file>] [<identifier>[::<file>], ...] [options]');
  console.log();
  console.log('  An <identifier> can be a URL, a library name or a set.');
  console.log();
  console.log('  Options:');
  console.log();
  console.log('    -o, --output  output directory');
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

Pulldown.prototype.getLocalJson = function() {
  var file;
  var homeDir = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  try {
    file = JSON.parse(fs.readFileSync(path.join(homeDir, ".pulldown.json")).toString());
  } catch(e) { file = {}; };
  return file;
};

Pulldown.prototype.processUserArgs = function(callback) {
  async.map(this.userArgs, function(item, done) {
    this.parsePackageArgument(item, function(data) {
      done(null, data);
    }.bind(this));
  }.bind(this), function(err, results) {
    results = _.flatten(results);

    // need to make sure each obj in results is uniq
    // easiest way to do this is to stringify them and compare strings
    // filter out dups, and then JSON.parse back to objects
    var jsonResults = results.map(function(item) { return JSON.stringify(item); });
    results = _.uniq(jsonResults).map(function(item) { return JSON.parse(item) });

    callback(results);
  });
};

Pulldown.prototype.parsePackageArgument = function(searchTerm, callback) {
  var split = searchTerm.split("::"), outputName;
  if (split.length > 1) {
    searchTerm = _.initial(split).join('::');
    outputName = _.last(split);
  }
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
      log("Nothing found for " + searchTerm, "red");
    }
    set = set.map(function(item) {
      return item[0] === "/" ? "https:" + item : item;
    });
    var resp = [];
    if(set.length === 1) {
      resp.push({ url: set[0], outputName: outputName });
    } else {
      set.forEach(function(item) {
        resp.push({ url: item });
      });
    }
    callback(resp);
  });
};

Pulldown.prototype.downloadFiles = function(urls, downloadDone) {
  async.map(urls, function(file, done) {
    this.getFile(file.url, file.outputName, done);
  }.bind(this), downloadDone);
};

// TODO error handle this
Pulldown.prototype.getFile = function(url, out, doneGetFile) {
  out = out || URL.parse(url).pathname.split("/").pop();
  var isAZip = !!url.match(/\.zip$/i),
      needsZip = !out.match(/\.zip$/i);
  // Build a desitination
  // Include the .zip if needed
  var fileDestination = path.join(this.outputDir || ".", out + (isAZip && needsZip ? '.zip' : ''));
  request(url).pipe(fs.createWriteStream(fileDestination).on("close", function() {
    log("Success: " + url + " was downloaded to " + fileDestination, "green");
    // If it's a zip, extract to a folder with the same name, minus the zip
    if (!isAZip) return doneGetFile(null, {
      url: url,
      fileDestination: fileDestination
    });
    // It's a ZIIIIP!!! http://s.phuu.net/1bjjyox
    var outPath = out.replace(/\.zip$/i, '');
    // Unzip all up in this
    fs.createReadStream(fileDestination)
      .pipe(unzip.Extract({ path: outPath }))
      .on('close', function () {
        log("Success: " + fileDestination + " was extracted to " + outPath, "green");
        doneGetFile(null, {
          url: url,
          fileDestination: outPath,
          unzipped: true
        });
      });
  }));
};

// let's kick this thing off
if(require.main === module) {
  var notifier = updateNotifier();
  if(notifier.update) {
    // Notify using the built-in convenience method
    notifier.notify();
  }

  var pulldown = new Pulldown();
  pulldown.init(process.argv.slice(2));
}

// export for testing
module.exports = Pulldown;
