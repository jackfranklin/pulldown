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
var argv           = require("yargs").boolean(["d", "dry-run"]).argv;

pulldown.on('resolved', function (identifier, result) {
  if (!cli.noisy) return;
  result = (Array.isArray(result) ? result : [result]);
  cli.log('Resolved ' + identifier + ' to [ ' + result.join(', ') + ' ]');
});

var cli = {
  searchTerms: [],
  destinations: {},
  log: function(message, colour) {
    var prefix = "->";
    message = (colour ? chalk[colour](message) : message);
    console.log(prefix, message);
  },
  help: function() {
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
  },
  parseArgs: function(args) {
    var libraryArgs = args._;
    if(args.v || args.version) return console.log(pkg.version);
    if(args.h || args.help || !libraryArgs.length) return this.help();
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
    }
    if(args.d || args["dry-run"]) {
      this.log("Dry run - no files will be downloaded.", "green");
      this.dryRun = args.d || args["dry-run"];
    }
    if(args.n || args.noisy) {
      this.log("Noisy!", "red");
      this.noisy = true;
    }
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
    if (!cli.noisy) {
      this.startTicker();
    }
    pulldown.init(this.searchTerms, function(err, results) {
      this.stopTicker();
      if(err) {
        this.log("Error: " + err.message, "red");
        if(!err.statusCode) {
          this.log("Did you only use one colon instead of two to separate the search term and file name?");
        }
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
    if (!this.tickerTimer) return;
    process.stdout.write('\r');
    clearInterval(this.tickerTimer);
  },
  parseSingleResult: function(res, done) {
    if(res.found == false) {
      this.log("Failure: nothing found for '" + res.searchTerm + "'.", "red");
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

