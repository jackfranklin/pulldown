module.exports = function(userArgs) {
  // optimist doesn't seem to handle booleans well
  // so we can detect them here and strip them out
  var expectedBools = ["-d", "--dry-run", "-o", "--output", "-h", "--help"];
  var foundBools = {};

  expectedBools.forEach(function(item) {
    var index;
    if((index = userArgs.indexOf(item)) > -1) {
      item = item.replace(/^-{1,2}/, "");
      foundBools[item] = true;
      userArgs.splice(index, 1);
    }
  });

  return {
    parsedArgs: userArgs,
    bools: foundBools
  };
};
