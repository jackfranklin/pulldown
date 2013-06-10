var Runner = require("mocha-runner");

new Runner ({
    //If the reporter is not specified "dot" is used by default
    reporter: "list",

    //Before running the tests all the files are removed to ensure a consistent state except:
    //- Excluded files
    //- Test files
    //- node_modules directory
    //- This file (the file that uses mocha-runner to run the tests)
    //It's recommended to create a folder named `tests` and put there all the testing stuff including this file
    tests: ["urls.js"]
}).run (function (error){
    //It's not the Mocha stderr
    if (error) console.log (error);
});
