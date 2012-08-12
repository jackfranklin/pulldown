#! /usr/bin/env node

//some dependencies
var exec = require('child_process').exec;
var url = require('url');


if(process.argv[2] == "--help") {
  console.log("Please refer to the Github README for detailed help");
  console.log("Inline terminal help is coming soon");
  process.exit(1);
}


//where we will store the packages we read in from the .nodefetch file
var packages = {};

//function to pull in the dependencies from the .nodefetch file
var fromSettings = function() {
  var fs = require('fs');
  var packagesArray = fs.readFileSync(getUserHome() + '/.nodefetch').toString().split("\n");
  for(var i = 0; i < packagesArray.length; i++) {
    var p = packagesArray[i];
    if(p !== "") {
      var spl = p.split("|")
      packages[spl[0]] = spl[1];
    }
  }
};

//utility function to get the home directory that should be platform agnostic
//TODO: test on Windows
var getUserHome = function() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};


//function that executes wget to pull down the file
var wget = function(fileUrl, output) {
  //default to the filename on the server if one is not passed in
  output = output || url.parse(fileUrl).pathname.split('/').pop();
  var wgetCommand = "wget -O " + output + " " + fileUrl;
  var child = exec(wgetCommand, function(err, stdout, stderr) {
    if(err) {
      throw err;
    } else {
      console.log(fileUrl + " downloaded to " + output);
    }
  });
};

//process the command line arguments and perform the wget
var getTarget = function() {
  var fileUrl = packages[process.argv[2]];
  if(!fileUrl) {
    throw Error("Package " + fileUrl + " not found");
  } else {
    wget(fileUrl, process.argv[3]);
  }
};

fromSettings();
getTarget();

//wget -O blah.js http://backbonejs.org/backbone-min.js

/*
 * // Function to download file using wget
var download_file_wget = function(file_url) {

    // extract the file name
    var file_name = url.parse(file_url).pathname.split('/').pop();
    // compose the wget command
    var wget = 'wget -P ' + DOWNLOAD_DIR + ' ' + file_url;
    // excute wget using child_process' exec function

    var child = exec(wget, function(err, stdout, stderr) {
        if (err) throw err;
        else console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
    });
}; */
