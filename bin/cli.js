#!/usr/bin/env node
var chalk          = require("chalk");
var shell          = require("shelljs");
var fs             = require("fs");
var updateNotifier = require('update-notifier');
var _              = require("underscore");
var async          = require("async");
var Pulldown       = require("../pulldown");
var pkg            = require("../package.json");
var argv           = require("optimist").boolean(["d", "dry-run"]).argv;

var pulldown = new Pulldown();

var CLI = function() {
  this.output, this.dryRun;
  this.searchTerms = [];
  this.destinations = {};
  this.checkForUpdate();
};


CLI.prototype = {
  log: function(message, colour) {
    var prefix = "->";
    message = (colour ? chalk[colour](message) : message);
    console.log(prefix, message);
  },
  parseArgs: function(args) {
    if(args.h || args.help) return pulldown.help();
    var libraryArgs = args._;
    if (args.v || args.version) {
      return console.log(pkg.version);
    }
    if(libraryArgs[0] == "ls") {
      return pulldown.ls(function(data) {
        data.forEach(log);
      });
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
  parseLibraryArgs: function(libraryArgs) {
    libraryArgs.forEach(function(arg) {
      var split = arg.split("::");
      var searchTerm = split[0];
      this.searchTerms.push(searchTerm);
      this.destinations[searchTerm] = split[1] || this.ensureEndsInJs(searchTerm);
    }.bind(this));
  },
  ensureEndsInJs: function(str) {
    var isJs = !!str.match(/\.js$/i);
    return ( isJs ? str : str + ".js" );
  },
  run: function(optimistArgs, cliComplete) {
    cliComplete = cliComplete || function() {};
    this.parseArgs(optimistArgs);
    this.startTicker();
    pulldown.init(this.searchTerms, function(err, results) {
      if(err) console.log(err);
      this.stopTicker();
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
    var outputDir = this.output || ".";
    var destination = this.destinations[res.searchTerm];
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
        this.log(res.url + " downloaded to " + output, "green");
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

module.exports = CLI;

if(require.main == module) {
  var cli = new CLI().run(argv);
}

