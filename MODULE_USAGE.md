Although Pulldown is primarily a CLI tool, there's nothing to stop it being used as a dependency in one of your projects. In fact, the Pulldown CLI uses it like that, so if you'd like an example, [that's a good place to start](https://github.com/jackfranklin/pulldown/blob/master/bin/cli.js).

The Pulldown module will take a list of search terms, search the CDNJS API for them, and return the _file contents_.

## Quick Start

Install Pulldown and save it to your `package.json`:

```sh
$ npm install pulldown --save
```

Load in the Pulldown module.

```js
var Pulldown = require("pulldown");
```

Create a new instance.

```js
var pulldown = new Pulldown();
```

Search for something.

```js
pulldown.init(["jquery"], function(err, results) {
    if(err) console.log(err);
    console.log(results);
});
```

`results` will be an array of objects. For the above, it will look like so:

```
[{
    searchTerm: 'jquery',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js',
    contents: 'jquery source'
}]
```

The `results` variable will be an array of each result, in the same order that the search terms were passed in. For example:

```js
pulldown.init(["jquery", "underscore"], function(err, results) {
    console.log(results);
});
```

`results`:

```
[
    {
        searchTerm: 'jquery',
        url: 'foo.com',
        contents: '...'
    },
    {
        searchTerm: 'underscore',
        url: 'bar.com',
        contents: '...'
    }
]
```

The order will always match the order the search terms were passed in.

Pulldown can also accept a URL:

```js
pulldown.init(["http://foo.com/some/lib.js"], function(err, results) {});
```


