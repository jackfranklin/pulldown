#!/usr/bin/env node
var optimist       = require("optimist");
var chalk          = require("chalk");
var shell          = require("shelljs");
var fs             = require("fs");
var updateNotifier = require('update-notifier');
var _              = require("underscore");
var Pulldown       = require("../pulldown");
var argv           = require("optimist").argv;

var pulldown = new Pulldown();

var cli = {
  log: function(message, colour) {
    var prefix = "->";
    message = (colour ? chalk[colour](message) : message);
    console.log(prefix, message);
  },
  parseArgs: function(args) {
    if(args.h || args.help) return pulldown.help();
    var libraryArgs = argv._;
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
  destinations: {},
  // to pass to pulldown
  searchTerms: [],
  ensureEndsInJs: function(str) {
    var isJs = !!str.match(/\.js$/i);
    return ( isJs ? str : str + ".js" );
  }
};

var notifier = updateNotifier({
  packagePath: "../package.json"
});
if(notifier.update) {
  notifier.notify();
};

cli.parseArgs(argv);

pulldown.init(cli.searchTerms, function(err, results) {
  if(err) console.log(err);
  if(cli.output && !cli.dryRun) shell.mkdir("-p", cli.output);

  results.forEach(function(res) {
    var outputDir = cli.output || ".";
    var destination = cli.destinations[res.searchTerm];
    if(!cli.dryRun) {
      var destinationParts = destination.split("/");
      if(destinationParts.length > 1) {
        var folders = _.initial(destinationParts).join("/");
        shell.mkdir("-p", outputDir + "/" + folders);
      };
    };

    var output = outputDir + "/" + destination;

    if(cli.dryRun) {
      cli.log(res.searchTerm + " would be downloaded to " + output);
    } else {
      fs.writeFile(output, res.contents, function(err) {
        if(err) return console.log(err);
        cli.log(res.searchTerm + " downloaded to " + output, "green");
      });
    }
  });
});
