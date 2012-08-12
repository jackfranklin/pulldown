#nodefetch

One day I got fed up of going online to pull down the latest library I wanted, whether that be Backbone, jQuery, Underscore or a CSS library like Normalize.css. Of course great solutions like [JamJS](http://jamjs.org) exist for full blown package management but often I wanted something a bit easier, so I decided to test my Node skills and create a command line tool to do just that. The result is nodefetch. Essentially it's a wrapper around wget that allows you to save libraries you use often for easy access.

## Requirements

You need to have Node JS and NPM installed.

nodefetch also depends on the command line utility wget. If you're on a Mac and use homebrew, you can install with `brew install wget`.

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

## Usage

The first time you run nodefetch it will pull down a sample JSON file, `nodefetch.json` into your home directory. This file contains libraries and acts also as an example of how to add your own to nodefetch. It looks like so:

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

This will download jQuery into the PWD to `jquery.min.js`, the file it's stored as on the server. If you want to save it to a different name, pass it as a parameter:

```
nodefetch jquery j.js
```

That will download jQuery into `j.js`.

## Todo

This is my first NPM module so I'm still learning, but the most pressing TODOs are:

* Move `nodefetch.json` into the package for nodefetch so I can simply update the default one through Github.
* Unit Tests?
* Improve error handling
* Rewrite to use [ShellJS](https://github.com/arturadib/shelljs/).
* Rewrite to use [CommanderJS](https://github.com/visionmedia/commander.js) for better CLI.


## Changelog

#####V0.0.3
* inline help added through `nodefetch --help`
* colourised terminal output

#####V0.0.2
* Huge rewrite of the code to make everything easier

#####V0.0.1
* Initial Release

