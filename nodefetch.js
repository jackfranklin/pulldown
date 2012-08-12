#! /usr/bin/env node


//some dependencies
var exec = require('child_process').exec;
var url = require('url');
var fs = require('fs');


if(process.argv[2] == "--help") {
  console.log("-> Please refer to the Github README for detailed help");
  console.log("-> Inline terminal help is coming soon");
  process.exit(1);
}

var nodefetch = {
  packages: {},
  gotPackages: false,
  userHome: function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  },
  checkForSettings: function() {
    try {
      // Query the entry
      var settings = fs.lstatSync(this.userHome() + '/nodefetch.json');
      console.log("-> Found settings file");
      this.fromSettings();
    }
    catch (e) {
      var url = "http://jackfranklin.org/nodefetch.json"
      console.log("-> No settings file detected. Downloading default from " + url);
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
  wget: function(fileUrl, output, cb) {
    //default to the filename on the server if one is not passed in
    output = output || url.parse(fileUrl).pathname.split('/').pop();
    var wgetCommand = "wget -O " + output + " " + fileUrl;
    var child = exec(wgetCommand, function(err, stdout, stderr) {
      if(err) {
        throw err;
      } else {
        console.log("-> " + fileUrl + " downloaded to " + output);
      }
      cb && cb();
    });
  },
  getTarget: function() {
    var fileUrl = this.packages[process.argv[2]];
    if(process.argv[3]) {
      console.log("-> Attempting to download package", process.argv[2], "to", process.argv[3]);
    } else {
      console.log("-> Attempting to download package", process.argv[2]);
    }
    if(!fileUrl) {
      throw Error("-> Package " + fileUrl + " not found");
    } else {
      this.wget(fileUrl, process.argv[3]);
    }
  }
};

//get things going

nodefetch.checkForSettings();

/*
 * TODO: check on Windows
 */
