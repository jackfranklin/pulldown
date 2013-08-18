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
var async          = require("async");
var unzip          = require("unzip");
var _              = require("underscore");
var chalk          = require("chalk");
var updateNotifier = require('update-notifier');
var parseArgs      = require('./lib/parseargs');
var optimist       = require('optimist');


var isUrl = function(str) {
  return !!URL.parse(str).hostname;
};

var Pulldown = function() {
  this.files = [];
};

Pulldown.prototype.init = function(userArgs, done) {
  done = done || function () {};
  var stripBools = parseArgs(userArgs);
  var optimistParsed = optimist.parse(stripBools.parsedArgs);
  userArgs = optimistParsed._;
  this.outputDir = optimistParsed.o || optimistParsed.output;
  var bools = stripBools.bools;
  if (!userArgs.length || bools.h || bools.help) return this.help();

  if(userArgs[0] == "ls") {
    this.ls(done);
  } else {
    this.processDownload(userArgs, bools, done);
  }
};

Pulldown.prototype.log = function(message, colour) {
  var prefix = "->";
  message = (colour ? chalk[colour](message) : message);
  console.log(prefix, message);
};

Pulldown.prototype.ls = function(done) {
  middleMan.index(function(data) {
    for(var key in data) {
      if(Array.isArray(data[key])) {
        var items = data[key].join(", ");
        this.log(key + ": " + items);
      }
    }
    done();
  }.bind(this));
};

Pulldown.prototype.processDownload = function(userArgs, bools, done) {
  this.isDryRun = bools.d || bools["dry-run"];

  if(this.isDryRun) {
    this.log("Dry Run - no files will be downloaded", "underline");
  }

  if(this.outputDir) {
    // we're going to be writing here, so we should make sure it exists
    shell.mkdir('-p', this.outputDir);
  }

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
      self.log("Nothing found for " + searchTerm, "red");
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
    this.processFileGet(file.url, file.outputName, done);
  }.bind(this), downloadDone);
};

Pulldown.prototype.download = function(url, fileDestination, zipOutPath, doneGetFile) {
  var stream = request(url);
  stream.pipe(fs.createWriteStream(fileDestination));

  var total = 0;
  stream.on("data", function(chunk) {
    total += chunk.length;
    process.stdout.write("\r" + "Downloaded " + total + " bytes.");
  });
  stream.on("end", function() {
    process.stdout.write("\n");
    self.log("Success: " + url + " was downloaded to " + fileDestination, "green");
    // If it's a zip, extract to a folder with the same name, minus the zip
    if (!isAZip) {
      return doneGetFile(null, {
        url: url,
        fileDestination: fileDestination
      });
    } else {
      self.extractZip(url, fileDestination, zipOutPath, doneGetFile);
    }
  });
};

// TODO error handle this
Pulldown.prototype.processFileGet = function(url, out, doneGetFile) {
  var self = this;

  try {
    out = out || URL.parse(url).pathname.split("/").pop();
  } catch(e) {
    self.log("Error: you have to use two colons (::) to specify file name, not just one.", "red");
    return doneGetFile(e);
  }
  var isAZip = !!url.match(/\.zip$/i),
      needsZip = !out.match(/\.zip$/i);
  // Build a desitination
  // Include the .zip if needed
  var fileDestination = path.join(this.outputDir || ".", out + (isAZip && needsZip ? '.zip' : ''));

  // calculate outpath for zip
  var outPath = self.zipOutPath(out);

  if(this.isDryRun) {
    this.log(url + " would have been downloaded to " + fileDestination, "green");
    if(isAZip) {
      this.log(fileDestination + " would have been extracted to " + outPath, "green");
    }
    return doneGetFile(null);
  } else {
    self.download(url, fileDestination, outPath, doneGetFile);
  }
};

Pulldown.prototype.zipOutPath = function(out) {
  return path.join(this.outputDir || ".", out.replace(/\.zip$/i, ''));
};

Pulldown.prototype.extractZip = function(url, file, out, doneGetFile) {
  var self = this;
  fs.createReadStream(file)
  .pipe(unzip.Extract({ path: out }))
  .on('close', function () {
    self.log("Success: " + file + " was extracted to " + out, "green");
    doneGetFile(null, {
      url: url,
      fileDestination: out,
      unzipped: true
    });
  });
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
