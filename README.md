# pulldown

Minimalist package manager – quickly grab a copy of your favourite library.

Built with &hearts; by [@jackfranklin](https://github.com/jackfranklin) and [@phuu](https://github.com/phuu).

## Install

Install pulldown globally using npm:

```
$ npm install -g pulldown
```

This gives you a `pulldown` command to use on your command line:

```bash
$ pulldown

  Usage: pulldown <identifier>[:<file>] [<identifier>[:<file>], ...] [options]

  An <identifier> can be a URL, a library name or a set.

  Options:

    -o, --output  output directory

  Example usage:

    pulldown jquery             # Downloads jQuery
    pulldown jquery:jq.js       # Downloads jQuery to jq.js
    pulldown jquery angular.js  # Downloads jQuery and Angular.js
    pulldown backbone           # Downloads jQuery, Underscore.js and Backbone.js
    pulldown backbone -o js     # Downloads same as above, but into js/
```

## Downloading Libraries

Once that's done, downloading jQuery is as simple as:

```
$ pulldown jquery
->  Success: https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js was downloaded to jquery.min.js
```

Pulldown works by searching on the [cdnjs](http://cdnjs.com/) site for what you asked it for.

## Custom Downloads

Of course, not everything you might want to download exists on cdnjs. You can add your own custom downloads to `~/.pulldown.json`. This file might look something like this:

```json
{
  "mycustommodule": "http://www.madeup.com/custom/module.js"
}
```

Then you can run:

```
$ pulldown mycustommodule
->  Success: http://www.madeup.com/custom/module.js was downloaded to module.js
```

Pulldown will know where to look. Pulldown will always look in your local `~/.pulldown.json` file before searching. This means if you want a particular version of a library you can put it into your local file, and Pulldown will always use that.

## Sets on the Server

Pulldown comes with the notion of _sets_. Sets are a collection of libraries.

For example, a Backbone application typically requires 3 libraries:

- Backbone
- jQuery
- Underscore

Rather than download all three yourself, Pulldown has you covered:

```
$ pulldown backbone
->  Success: https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js was downloaded to underscore-min.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js was downloaded to backbone-min.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js was downloaded to jquery.min.js
```

We [define sets on our server](https://github.com/phuu/pulldown-api/blob/master/pulldown.json). When you hit our server asking for `backbone`, we give you back jQuery, Underscore and Backbone. If you think there's more sets we should support, [let us know](https://github.com/phuu/pulldown-api/issues/new).

## Custom Sets

You can define custom sets in your `~/.pulldown.json`. They look like this:

```json
{
  "backboneapp": ["jquery", "underscore", "backbone.js"]
}
```

Here I define a custom set, `backboneapp`, that will download jQuery, Underscore and Backbone. This is an example we have on the server, so you don't need to, but it's useful for setting up common sets of libraries you use together. Downloading them all becomes as simple as:

```
$ pulldown backboneapp
->  Success: https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js was downloaded to underscore-min.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js was downloaded to backbone-min.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js was downloaded to jquery.min.js
```

## Output Directories

You can tell Pulldown to save what it downloads into a directory, that will be created if it doesn't exist:

```
$ pulldown backbone -o foo/
->  Success: https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js was downloaded to foo/underscore-min.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js was downloaded to foo/backbone-min.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js was downloaded to foo/jquery.min.js
```

## Custom File Names

If you're downloading something that will resolve to a single file, you can choose the name of the file that will be downloaded using a colon:

```
$ pulldown jquery:foo.js
->  Success: https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js was downloaded to foo.js
```

## Versions

Pulldown supports finding a specific version of a library, and will do its best to find it. Use `identifier@version`:

```
$ pulldown jquery@1.7.1
->  Success: https://cdnjs.cloudflare.com/ajax/libs/jquery/1.7.1/jquery.min.js was downloaded to jquery.min.js
```

Pulldown searches [cdnjs](http://cdnjs.com/) for it. If it can't find the right version, it'll give you the latest.

## Upgrading

```
$ npm update pulldown -g
```

## Contributing

The Pulldown source is maintained jointly by @jackfranklin and @phuu. As such, the repositories are spread out:

- [pulldown-api](http://github.com/phuu/pulldown-api). This powers our server, and is where you can add sets.
- [pulldown-resolve](http://github.com/phuu/pulldown-resolve). This resolves search terms to URLs. It takes search a search term and does its best to find a URL.
- [pulldown-middleman](http://github.com/jackfranklin/pulldown-middle-man). This is a very small API wrapper to query the Pulldown API. It will expand as our API does.
- pulldown (you're here!). This is the CLI application, and the one you should install if you want to use pulldown.

## Changelog

__V0.3.1__
- added a help command (`pulldown`)
- don't add `zip` extension to output path if it is already there

__V0.3.0__
- support downloading and unzipping of ZIP files.

__V0.2.6__
- only let the file name be dictated by the user if there's only one file to download

__V0.2.5__
- avoid downloading the same file more than once if we can avoid it

__V0.2.4__
- show an error if the search term could not be resolved

__V0.2.3__
- pass in an output directory to save all files to (`pulldown backbone -o foo/`)
- support saving a file to a particular name (`pulldown jquery:foo.js`)

__V0.2.2__
- improve Windows support (thanks @sindresorhus)

__V0.2.1__
- make sure URLs in local JSON file are valid

__V0.2.0__
- _complete_ rewrite. Too much to document here (see this README for a full briefing on the new pulldown).

__V0.1.2__
- updated structure of `.pulldownrc` to allow for specifying the file name
- fix `mkdir` showing error if no directory given

__V0.1.1__
- if you try to install something to a folder that doesn't exist, pulldown will now create it

__V0.1.0__
- initial release!
- this is a rewrite and rework of the old `nodefetch` module, with a better name.

