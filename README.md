# pulldown

The minimal JavaScript package manager on the web, by @jackfranklin and @phuu.

## Installation

```
npm install -g pulldown
```

You will then have the `pulldown` executable ready for use.

## Upgrading

```
npm update pulldown -g
```

## Downloading Libraries

Once that's done, downloading jQuery is as simple as:

```
pulldown jquery
```

Pulldown works by searching on the [cdnjs](http://cdnjs.com/) site for what you asked it for.

## Custom Downloads

Of course, not everything you might want to download exists on cdnjs. You can add your own custom downloads to `~/.pulldown.json`. This file might look something like this:

```json
{
  "mycustommodule": "http://www.madeup.com/custom/module.js"
}
```

Then you can run `pulldown mycustommodule` and it will know where to look. Pulldown will always look in your local `~/.pulldown.json` file before cdnjs.com. This means if you want a particular version of a library, you can put it into your local file, and Pulldown will always use that ahead of the version on cdnjs.

## Sets on the Server

Pulldown comes with the notion of _sets_. Sets are a collection of libraries. For example, a Backbone application typically requires 3 libraries:

- Backbone
- jQuery
- Underscore

Rather than download all three yourself, Pulldown has you covered:

`pulldown backbone`.

We [define sets on our server](https://github.com/phuu/pulldown-api/blob/master/pulldown.json). When you hit our server asking for `backbone`, we give you back jQuery, Underscore and Backbone. If you think there's more sets we should support, let us know.

## Custom Sets

You can define custom sets in `~/.pulldown.json`. They look like this:

```json
{
  "backboneapp": ["jquery", "underscore", "backbone.js"]
}
```

Here I define a custom set, `backboneapp`, that will download jQuery, Underscore and Backbone. This is an example we have on the server, so you don't need to, but it's useful for setting up common sets of libraries you use together. Downloading them all becomes as simple as:

```
pulldown backboneapp
```

## Contributing

The Pulldown source is maintained jointly by @jackfranklin and @phuu. As such, the repositories are spread out:

- [pulldown-api](http://github.com/phuu/pulldown-api). This powers our server.
- [pulldown-resolve](http://github.com/phuu/pulldown-resolve). This resolves search terms to URLs. It takes search terms and finds a URL.
- [pulldown-middle-man](http://github.com/jackfranklin/pulldown-middle-man). This is a very small API wrapper to query the Pulldown API. It will expand as our API does.
- pulldown (you're here!). This is the CLI application, and the one you should install if you want to use pulldown.

## Changelog

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

