#nodefetch

One day I got fed up of going online to pull down the latest library I wanted, whether that be Backbone, jQuery, Underscore or a CSS library like Normalize.css. Of course great solutions like [JamJS](http://jamjs.org) exist for full blown package management but often I wanted something a bit easier, so I decided to test my Node skills and create a command line tool to do just that. The result is nodefetch. Essentially it's a wrapper around wget that allows you to save libraries you use often for easy access.

## Requirements

You need to have Node JS and NPM installed.

At this time nodefetch has only been tested on Mac OS X Lion. If you run any other OS, please let me know if nodefetch works or not.

## Installation


```
npm install -g nodefetch
```

(If you get a permission error, you will need to try again as `sudo`):

```
sudo npm install -g nodefetch
```

You will then have the `nodefetch` executable ready for use.


## Upgrading

```
npm update nodefetch -g
```

## Usage

__NEW__: file is stored in home dir as `.nodefetch.json` (notice the starting period)

The first time you run nodefetch it will pull down a sample JSON file, `nodefetch.json` into your home directory as `.nodefetch.json`. This file contains libraries and acts also as an example of how to add your own to nodefetch. It looks like so:

```json
{
  "backbone" : "http://backbonejs.org/backbone-min.js",
  "underscore" : "http://underscorejs.org/underscore-min.js",
  "jquery": "http://code.jquery.com/jquery.min.js",
  "json2": "https://github.com/douglascrockford/JSON-js/raw/master/json2.js",
  "normalize": "https://raw.github.com/necolas/normalize.css/master/normalize.css",
  "raphael": "http://github.com/DmitryBaranovskiy/raphael/raw/master/raphael-min.js",
  "reset": "http://meyerweb.com/eric/tools/css/reset/reset.css"
}
```

Here you can see how it works, it's a simple JSON file of key->value, with the key being how you reference the library through nodefetch, and the value being the URL to download. You can add to this as you please.

Once that's done, downloading jQuery is as simple as:

```
nodefetch jquery
```

__NEW__ you can pass in multiple libraries to download them all at once:

```
nodefetch jquery underscore backbone
```

If you want to specify the file name for the library, pass it in like so:

```
nodefetch jquery:jquery.js backbone underscore:u.js
```

That will download jQuery into `jquery.js`, download Backbone to a file named the same as the file on the server, and Underscore to `u.js`.

__NEW__ you can also download zip files. Twitter's bootstrap library is included in the initial `.nodefetch.json` file.

```
nodefetch bootstrap
```

Will unzip bootstrap into `/bootstrap` and give you all the files in their proper structure.

```
.
├── css
│   ├── bootstrap-responsive.css
│   ├── bootstrap-responsive.min.css
│   ├── bootstrap.css
│   └── bootstrap.min.css
├── img
│   ├── glyphicons-halflings-white.png
│   └── glyphicons-halflings.png
└── js
    ├── bootstrap.js
    └── bootstrap.min.js
```


## Contributing

The WIP branch is the __develop__ branch, so any contributors should:

* Fork the repository
* work on the __develop__ branch
* when you're ready to make a pull request, merge master INTO your develop branch
* make the pull request to merge your develop branch into master
* make sure you have tests for the added functionality and all tests pass!


## Testing

* The tests are within the `test/` folder. To run them, simply run: `node tests` from within the test folder, or `node test/tests` from the project root.

* All test downloads go into `test/testdls`. This folder is cleaned before each run of the tests. It's also added to the `.gitignore`.

* The test use Node's `assert`, but wrapped with my [minitestwrap](https://github.com/jackfranklin/node-minitestwrap) library. To add a new test, simply do:

```javascript
MTW.addTest("description", function() {
  //assertions here
});
```

## Todo

This is my first NPM module so I'm still learning, but the most pressing TODOs are:

* Improve error handling
* Beef up the initial `.nodefetch.json` file with much more packages in.

Any questions, feel free to ask :)


## Changelog

#####V0.2.0
* nodefetch can now deal with zips!
* Twitter's bootstrap is in the default settings file, running `nodefetch bootstrap` will extract to `/bootstrap`. Either add the bootstrap to your `.nodefetch.json`, or remove it and run any `nodefetch` command to download the new default.
* I also rewrote the file downloading to be a bit tidier with one less callback.

#####V0.1.1
* settings now stored as `.nodefetch.json` (period at the beginning). Fixes #3 (thanks @mheap)

#####V0.1.0
Big enough changes to warrant the step up to 0.1.0

* unit tests! (see above for how to use)
* rewrote to __no longer use wget__ but instead use [Request](https://github.com/mikeal/request/) which is on NPM. No more external dependencies ftw! Thanks @mheap for the recommendation
* large rewrite to support the above and unit tests. Code is a bit tidier now.
* the `nodefetch` object is now exported as a module.

#####V0.0.4
* able to download multiple libraries at once, new syntax for specifying the specific file name to download to (see above documentation)

#####V0.0.3
* inline help added through `nodefetch --help`
* colourised terminal output

#####V0.0.2
* Huge rewrite of the code to make everything easier

#####V0.0.1
* Initial Release

