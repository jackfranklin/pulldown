#!/usr/bin/env node
var chalk          = require("chalk");
var shell          = require("shelljs");
var fs             = require("fs");
var updateNotifier = require('update-notifier');
var _              = require("underscore");
var async          = require("async");
var URL            = require("url");
var pulldown       = require("../pulldown");
var pkg            = require("../package.json");
var argv           = require("optimist").boolean(["d", "dry-run"]).argv;

var cli = {
  searchTerms: [],
  destinations: {},
  log: function(message, colour) {
    var prefix = "->";
    message = (colour ? chalk[colour](message) : message);
    console.log(prefix, message);
  },
  parseArgs: function(args) {
    var libraryArgs = args._;
    if(args.v || args.version) return console.log(pkg.version);
    if(args.h || args.help || !libraryArgs.length) return pulldown.help();
    if(libraryArgs[0] == "ls") {
      return pulldown.ls(function(data) {
        data.forEach(function(item) {
          this.log(item);
        }.bind(this));
      }.bind(this));
    };
    this.parseLibraryArgs(libraryArgs);
    this.findFlags(args);
  },
  findFlags: function(args) {
    if(args.o || args.output) {
      this.output = args.o || args.output;
    };
    if(args.d || args["dry-run"]) {
      this.log("Dry Run - no files will be downloaded", "underline");
      this.dryRun = args.d || args["dry-run"];
    };
  },
  isUrl: function(str) {
    return !!URL.parse(str).hostname;
  },
  parseLibraryArgs: function(libraryArgs) {
    libraryArgs.forEach(function(arg) {
      var split = arg.split("::");
      var searchTerm = split[0];
      this.searchTerms.push(searchTerm);
      if(this.isUrl(searchTerm)) {
        this.destinations[searchTerm] = split[1] || _.last(searchTerm.split("/"));
      } else {
        // if there is no specific output defined
        // we will get it from parsing out the URL
        this.destinations[searchTerm] = split[1] || undefined;
      }
    }.bind(this));
  },
  ensureHasFileExtension: function(str) {
    var hasPrefix = !!str.match(/\.([a-z]{1,6})$/i);
    return ( hasPrefix ? str : str + ".js" );
  },
  run: function(optimistArgs, cliComplete) {
    this.searchTerms = [];
    this.destinations = [];
    this.output = undefined;
    this.dryRun = false;
    this.checkForUpdate();
    cliComplete = cliComplete || function() {};
    this.parseArgs(optimistArgs);
    this.startTicker();
    pulldown.init(this.searchTerms, function(err, results) {
      this.stopTicker();
      if(err) {
        this.log("Error: " + err.message, "red");
        this.log("Did you only use one colon instead of two to separate the search term and file name?");
        return;
      }
      if(this.output && !this.dryRun) shell.mkdir("-p", this.output);

      async.map(results, function(res, done) {
        this.parseSingleResult(res, done);
      }.bind(this), cliComplete);
    }.bind(this));
  },
  startTicker: function () {
    var ticks = 0;
    this.tickerTimer = setInterval(function () {
      ticks += 1;
      var color = 'green';
      if (ticks > 3) color = 'yellow';
      if (ticks > 6) color = 'red';
     if (this.tickerTimer) process.stdout.write(chalk[color]('.'));
    }.bind(this), 1000);
  },
  stopTicker: function () {
    process.stdout.write('\r');
    clearInterval(this.tickerTimer);
  },
  parseSingleResult: function(res, done) {
    if(res.found == false) {
      this.log("Failure: nothing found for '" + res.searchTerm + "'", "red");
      return;
    }
    var outputDir = this.output || ".";
    var destination = this.destinations[res.searchTerm] || this.ensureHasFileExtension(_.last(res.url.split("/")));
    if(!this.dryRun) {
      var destinationParts = destination.split("/");
      if(destinationParts.length > 1) {
        var folders = _.initial(destinationParts).join("/");
        shell.mkdir("-p", outputDir + "/" + folders);
      };
    };
    var output = outputDir + "/" + destination;
    if(this.dryRun) {
      this.log(res.url + " would be downloaded to " + output);
      return done();
    } else {
      fs.writeFile(output, res.contents, function(err) {
        if(err) return console.log(err);
        this.log("Success: " + res.url + " was downloaded to " + output, "green");
        return done();
      }.bind(this));
    }
  },
  checkForUpdate: function() {
    var notifier = updateNotifier({
      packagePath: "../package.json"
    });

    if(notifier.update) {
      notifier.notify();
    };
  }
};

module.exports = cli;

if(require.main == module) {
  cli.run(argv);
}

