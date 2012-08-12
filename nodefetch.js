#! /usr/bin/env node

//some dependencies
var exec = require('child_process').exec;
var url = require('url');
var fs = require('fs');

var gotPackages = false;


var checkForSettings = function() {
  try {
    // Query the entry
    var settings = fs.lstatSync(getUserHome() + '/nodefetch.json');
    console.log("-> Found settings file");
    fromSettings();
  }
  catch (e) {
    var url = "http://jackfranklin.org/nodefetch.json"
    console.log("-> No settings file detected. Downloading default from " + url);
    wget(url, getUserHome() + "/nodefetch.json", fromSettings);
  }
};


if(process.argv[2] == "--help") {
  console.log("-> Please refer to the Github README for detailed help");
  console.log("-> Inline terminal help is coming soon");
  process.exit(1);
}




//where we will store the packages we read in from the .nodefetch file
var packages = {};

//function to pull in the dependencies from the .nodefetch file
var fromSettings = function() {
  if(!gotPackages) {
    var fs = require('fs');
    var packagesJson = fs.readFileSync(getUserHome() + '/nodefetch.json').toString();
    packages = JSON.parse(packagesJson);
    gotPackages = true;
  }

  //now we have them, lets get the file
  getTarget();

};

//utility function to get the home directory that should be platform agnostic
//TODO: test on Windows
var getUserHome = function() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};


//function that executes wget to pull down the file
var wget = function(fileUrl, output, cb) {
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
};

//process the command line arguments and perform the wget
var getTarget = function() {
  var fileUrl = packages[process.argv[2]];
  if(process.argv[3]) {
    console.log("-> Attempting to download package", process.argv[2], "to", process.argv[3]);
  } else {
    console.log("-> Attempting to download package", process.argv[2]);
  }
  if(!fileUrl) {
    throw Error("-> Package " + fileUrl + " not found");
  } else {
    wget(fileUrl, process.argv[3]);
  }
};


//lets do this!

checkForSettings();
