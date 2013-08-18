module.exports = function() {
  console.log();
  console.log('  Usage: pulldown <identifier>[::<file>] [<identifier>[::<file>], ...] [options]');
  console.log();
  console.log('  An <identifier> can be a URL, a library name or a set.');
  console.log();
  console.log('  Options:');
  console.log();
  console.log('    -o, --output  output directory');
  console.log();
  console.log('  Example usage:');
  console.log();
  console.log('    pulldown jquery             # Downloads jQuery');
  console.log('    pulldown jquery::jq.js      # Downloads jQuery to jq.js');
  console.log('    pulldown jquery angular.js  # Downloads jQuery and Angular.js');
  console.log('    pulldown backbone           # Downloads jQuery, Underscore.js and Backbone.js');
  console.log('    pulldown backbone -o js     # Downloads same as above, but into js/');
  console.log();
};
