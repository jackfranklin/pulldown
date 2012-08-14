#! /usr/bin/env node


//some dependencies
var exec = require('child_process').exec;
var url = require('url');
var fs = require('fs');

//terminal output colours!
//via http://roguejs.com/2011-11-30/console-colors-in-node-js/
var red, blue, reset;
red   = '\033[31m';
green = '\033[32m';
reset = '\033[0m';


var nodefetch = {
  VERSION: "0.0.4",
  packages: {},
  gotPackages: false,
  userHome: function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  },
  checkForSettings: function() {
    try {
      fs.lstatSync(this.userHome() + '/nodefetch.json');
      console.log("-> Found settings file");
      this.fromSettings();
    }
    catch (e) {
      var url = "http://jackfranklin.org/nodefetch.json";
      console.log("-> " + red + "No settings file detected.", reset, "Downloading default from " + url);
      var self = this;
      //TODO: this could be nicer, I reckon.
      this.wget(url, this.userHome() + "/nodefetch.json", function() {
        self.fromSettings.call(self);
      });
    }
  },
  fromSettings: function() {
    if(!this.gotPackages) {
      var fs = require('fs');
      var packagesJson = fs.readFileSync(this.userHome() + '/nodefetch.json').toString();
      this.packages = JSON.parse(packagesJson);
      this.gotPackages = true;
    }
    //got the packages, lets get the one the user wants
    this.getTarget();
  },
  updateSettings: function() { this.gotPackages = false; },
  wget: function(fileUrl, output, cb) {
    //default to the filename on the server if one is not passed in
    output = output || url.parse(fileUrl).pathname.split('/').pop();
    var wgetCommand = "wget -O " + output + " " + fileUrl;
    var child = exec(wgetCommand, function(err, stdout, stderr) {
      if(err) {
        //TODO handle this better
        throw err;
      } else {
        console.log("-> " + green + "SUCCESS: " + fileUrl + " downloaded to " + output, reset);
      }
      cb && cb();
    });
  },
  getTarget: function() {
    var userArgs = process.argv.slice(2); //remove first two to get at the user commands
    for(var i = 0; i < userArgs.length; i++) {
      this.processPackageArg(userArgs[i]);
    }
  },
  processPackageArg: function(arg) {
    var spl = arg.split(":");
    var fileUrl = this.packages[spl[0]];
    console.log("-> Attempting to download package", spl[0], "from", fileUrl);
    if(!fileUrl) {
      console.log("-> " + red + "ERROR: Package " + spl[0] + " not found", reset);
      process.exit(1);
    } else {
      this.wget(fileUrl, spl[1]);
    }
  }
};

//help
if(process.argv[2] == "--help") {
  console.log("-> VERSION", nodefetch.VERSION);
  console.log("-> nodefetch help");
  console.log("-> To upgrade to latest version: npm update nodefetch -g");
  console.log("");
  console.log("-> USAGE: 'nodefetch package_name [file_name]'");
  console.log("");
  console.log("-> BASIC USAGE");
  console.log("---> when you first run nodefetch, a package.json file will be downloaded to ~/nodefetch.json.");
  console.log("---> This file contains a list of packages, which you can edit as you please");
  console.log("---> once you have this package.json, to install a library, type 'nodefetch' followed by the library name.");
  console.log("---> for example: 'nodefetch jquery' will install the latest jQuery");
  console.log("---> download multiple libraries at once: 'nodefetch jquery backbone underscore'");
  console.log("");
  console.log("-> FURTHER OPTIONS");
  console.log("---> if you want to store the library to different filename than the one that it's called on the server");
  console.log("---> you can pass in an optional filename with the library name, colon separated");
  console.log("---> for example, 'nodefetch jquery:foo.js' will download jQuery into foo.js");
  console.log("---> 'nodefetch jquery:foo.js backbone underscore:u.js' downloads jQuery to foo.js, Backbone to default and Underscore to u.js");
  console.log("");
  console.log("-> any feedback, help or issues, please report them on Github: https://github.com/jackfranklin/nodefetch/");
  console.log("");
  process.exit(1);
} else if (process.argv[2] == "--update") {
  nodefetch.updateSettings();
  console.log("-> nodefetch will now update from nodefetch.json next time it's run");
  process.exit(1);
}

//get things going

nodefetch.checkForSettings();

/*
 * TODO: check on Windows
 */
