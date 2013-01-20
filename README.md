# nodefetch

The most minimal JS package manager on the web.

One day I got fed up of going online to pull down the latest library I wanted, whether that be Backbone, jQuery, Underscore or a CSS library like Normalize.css. Of course great solutions like [JamJS](http://jamjs.org) exist for full blown package management but often I wanted something a bit easier, so I decided to test my Node skills and create a command line tool to do just that. The result is nodefetch.

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

The first time you run nodefetch it will pull down a sample JSON file, `nodefetch.json` into your home directory as `.nodefetch.json`. This file contains libraries and acts also as an example of how to add your own to nodefetch. It looks like so:

```json
{
  "backbone" : "http://backbonejs.org/backbone-min.js",
    "underscore" : "http://underscorejs.org/underscore-min.js",
    "jquery": "http://code.jquery.com/jquery.min.js",
    "json2": "https://github.com/douglascrockford/JSON-js/raw/master/json2.js",
    "normalize": "https://raw.github.com/necolas/normalize.css/master/normalize.css",
    "raphael": "http://github.com/DmitryBaranovskiy/raphael/raw/master/raphael-min.js",
    "reset": "http://meyerweb.com/eric/tools/css/reset/reset.css",
    "bootstrap": "http://twitter.github.com/bootstrap/assets/bootstrap.zip",
    "sets": {
      "backboneapp": ["backbone", "jquery", "underscore"]
    },
    "requirejs": "http://requirejs.org/docs/release/2.1.2/minified/require.js",
    "handlebars": "https://raw.github.com/wycats/handlebars.js/master/dist/handlebars.js",
    "magnacharta": "https://raw.github.com/alphagov/magna-charta/master/dist/magna-charta.min.js",
    "matchmedia": "https://raw.github.com/paulirish/matchMedia.js/master/matchMedia.js"
}
```

Here you can see how it works, it's a simple JSON file of key->value, with the key being how you reference the library through nodefetch, and the value being the URL to download. You can add to this as you please.

Once that's done, downloading jQuery is as simple as:

```
nodefetch jquery
```

You can also define and download sets (see JSON above). Then you can run:

```
nodefetch set:backboneapp
```

And it will download jQuery, Backbone and Underscore. You can also define filenames you'd like within a set. For example:

```json
"backboneapp": ["backbone:b.js", "jquery:j.js", "underscore:u.js"]
```

Running `nodefetch set:backboneapp` would download Backbone to b.js, jQuery to j.js, and Underscore to u.js.

You can also pass in multiple libraries to download at once:

```
nodefetch jquery underscore backbone
```

If you want to specify the file name for the library, pass it in like so:

```
nodefetch jquery:jquery.js backbone underscore:u.js
```

That will download jQuery into `jquery.js`, download Backbone to a file named the same as the file on the server, and Underscore to `u.js`.

You can also add directories to the custom file path:

```
nodefetch jquery:lib/jquery.js
```

You can also download zip files. Twitter's bootstrap library is included in the initial `.nodefetch.json` file.

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


### nodefetchrc

You can store dependencies within a local `.nodefetchrc` file within your project. It looks something like this:

```
{
  "destination": "lib",
  "dependencies": [
    "jquery",
    "requirejs",
    "handlebars"
  ]
}
```

Then when you run `nodefetch` (without any arguments) within a directory that contains that file, it will download the dependencies for you.

## Changelog

#####V0.4.0
* added functionality to have a local `.nodefetchrc` file to download packages automatically

#####V0.3.0
* added sets functionality
* updated `.nodefetch.json` file, to use the one from [my Dotfiles](https://github.com/jackfranklin/dotfiles/) as the default.

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

