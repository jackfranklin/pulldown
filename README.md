# pulldown

The minimal JavaScript package manager on the web.

## Requirements

You need to have Node JS and NPM installed.

At this time pulldown has only been tested on Mac OS X Lion. If you run any other OS, please let me know if pulldown works or not.

## Installation

```
npm install -g pulldown
```

You will then have the `pulldown` executable ready for use.

## Upgrading

```
npm update pulldown -g
```

## The ~/.pulldown.json

The first time you run pulldown it will pull down a sample JSON file, `pulldown.json` into your home directory as `.pulldown.json`. This file contains libraries and acts also as an example of how to add your own to pulldown. It looks like so:

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

You should edit this to add in libraries you use regularly.

Here you can see how it works, it's a simple JSON file of key-value pairs, with the key being how you reference the library through pulldown, and the value being the URL to download.

## Downloading Libraries

Once that's done, downloading jQuery is as simple as:

```
pulldown jquery
```

## Downloading Sets

You can also define and download sets, which are defined in the JSON file ( see above ). Then you can run:

```
pulldown set:backboneapp
```

And it will download jQuery, Backbone and Underscore. You can also define filenames you'd like within a set. For example:

```json
"backboneapp": ["backbone:b.js", "jquery:j.js", "underscore:u.js"]
```

Running `pulldown set:backboneapp` would download Backbone to b.js, jQuery to j.js, and Underscore to u.js.

You can also pass in multiple libraries to download at once:

```
pulldown jquery underscore backbone
```

## Advanced Usage

If you want to specify the file name for the library, pass it in like so:

```
pulldown jquery:jquery.js backbone underscore:u.js
```

That will download jQuery into `jquery.js`, download Backbone to a file named the same as the file on the server, and Underscore to `u.js`.

You can also add directories to the custom file path:

```
pulldown jquery:lib/jquery.js
```

You can also download zip files. Twitter's bootstrap library is included in the initial `.pulldown.json` file.

```
pulldown bootstrap
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


### Project dependencies with the .pulldownrc file

You can store dependencies within a local `.pulldownrc` file within your project. It looks something like this:

```
{
    "destination": "vendors",
    "dependencies": [
        {
          "source": "jquery",
          "output": "jquery.js"
        },
        {
          "source": "https://raw.github.com/wycats/handlebars.js/1.0.rc.2/dist/handlebars.js"
        }
    ]
}
```

If you want the files to be downloaded to the same directory as the `.pulldownrc` file, just leave the `destination` key out.

The dependencies array can contain either names or URLs. If it contains a name (such as "jquery"), it will look in your `~/.pulldown.json` to find the URL. If the string is a URL, it will download it.

Then when you run `pulldown` (without any arguments) within a directory that contains a `.pulldownrc`, it will download the dependencies for you. If you don't define the `output` property for a dependency, pulldown will use the one in the source. For example, with the above handlebars dependency, it will be saved as `handlebars.js`.

## FAQs

##### Why write another package manager?
pulldown does one thing and one thing well. You give it  list of URLs (or names that it knows about), and it downloads the raw JS files. Nothing more.

##### Does it do versions?
It does, in that you can link to a specific version of a library. However it does nothing more. This is because it was designed purely to download JS files.


## Changelog

__V0.1.2__
- updated structure of `.pulldownrc` to allow for specifying the file name
- fix `mkdir` showing error if no directory given

__V0.1.1__
- if you try to install something to a folder that doesn't exist, pulldown will now create it

__V0.1.0__
- initial release!
- this is a rewrite and rework of the old `nodefetch` module, with a better name.

