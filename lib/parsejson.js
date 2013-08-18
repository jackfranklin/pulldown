module.exports = function() {
  var file;
  var homeDir = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  try {
    file = JSON.parse(fs.readFileSync(path.join(homeDir, ".pulldown.json")).toString());
  } catch(e) { file = {}; }

  return file;
};
