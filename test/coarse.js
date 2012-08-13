var assert = require("assert");
var shell  = require('shelljs');
var path   = require('path');

// JANKY.  Assumes the nodefetch is globally installed on the machine
// that a test is running
describe('nodefetch', function(){

  var home     = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  var settings = path.join(home, "nodefetch.json");
  var temp     = path.join(home, "_nodefetch.json.tmp");

  describe("settings file", function(){
    before(function(){
      // if a global settings file exists we need to stash
      if(shell.test('-f', settings)){
        shell.mv(settings, temp);
      }
    });

    it("should fetch a default file when no settings are present", function(){
      shell.exec('nodefetch')
      assert(shell.test('-f', settings));
    });

    after(function(){
      // remove the newly created settings file
      shell.rm(settings);

      // if the originall stashed we need to move that file back
      if(shell.test('-f', temp)){
        shell.mv(temp, settings);
      }
    });

  });
});
