# Contributing to pulldown

Thanks for your interest in contributing to Pulldown! If you're ever unsure and would like some help, feel free to bug @Jack_Franklin or @phuunet on Twitter. We'd be happy to help.

### Pulldown Layout
The Pulldown source is maintained jointly by @jackfranklin and @phuu. As such, the repositories are spread out:

- [pulldown-api](http://github.com/phuu/pulldown-api). This powers our server, and is where you can add sets.
- [pulldown-resolve](http://github.com/phuu/pulldown-resolve). This resolves search terms to URLs. It takes search a search term and does its best to find a URL.
- [pulldown-middleman](http://github.com/jackfranklin/pulldown-middle-man). This is a very small API wrapper to query the Pulldown API. It will expand as our API does.
- pulldown (you're here!). This is the CLI application, and the one you should install if you want to use pulldown.

### Finding something to work on
Most of the things in our [issue list](https://github.com/jackfranklin/pulldown/issues?state=open) are fair game. Do comment and let us know you're working on something though, so we don't get multiple people working on the same thing.

### Setting up
You should fork the repository, and then run:

```
$ npm install -g grunt-cli
$ npm install --dev
$ npm link
```

The second command will ensure the version of `pulldown` used if you run it is linked to the repository, so you can try any new changes out as you go.

### Running the Tests

First make sure you've got all the dev dependencies:

```
$ npm install --dev
```

Then running the tests should be as simple as:

```
mocha
```

Please make sure you write tests for your new feature.

### Grunt

We use Grunt to run JSHint and the Mocha tests automatically. Please ensure before you make a pull request that:

```
$ grunt
```

Runs successfully with no warnings or errors.

### Style Guide

In lieu of an official style guide, please follow the conventions of the existing code.
