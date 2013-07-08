var URL = require('url');
var path = require('path');

module.exports = function(url, out, doneGetFile) {
  out = out || URL.parse(url).pathname.split("/").pop();
  var isAZip = !!url.match(/\.zip$/i),
      needsZip = !out.match(/\.zip$/i);
  // Build a desitination
  // Include the .zip if needed
  var fileDestination = path.join('/tmp' || ".", out + (isAZip && needsZip ? '.zip' : ''));

  // If it's a zip, extract to a folder with the same name, minus the zip
  if (!isAZip) return doneGetFile(null, {
    url: url,
    fileDestination: fileDestination
  });

  // It's a ZIIIIP!!! http://s.phuu.net/1bjjyox
  var outPath = out.replace(/\.zip$/i, '');
  doneGetFile(null, {
    url: url,
    fileDestination: outPath,
    unzipped: true
  });
};