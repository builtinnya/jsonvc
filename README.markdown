# jsonvc

[![Build Status](https://travis-ci.org/builtinnya/jsonvc.svg?branch=master)](https://travis-ci.org/builtinnya/jsonvc)
[![Coverage Status](https://coveralls.io/repos/builtinnya/jsonvc/badge.svg?branch=master)](https://coveralls.io/r/builtinnya/jsonvc?branch=master)
[![Code Climate](https://codeclimate.com/github/builtinnya/jsonvc/badges/gpa.svg)](https://codeclimate.com/github/builtinnya/jsonvc)
[![Dependency Status](https://david-dm.org/builtinnya/jsonvc.svg)](https://david-dm.org/builtinnya/jsonvc)
[![devDependency Status](https://david-dm.org/builtinnya/jsonvc/dev-status.svg)](https://david-dm.org/builtinnya/jsonvc#info=devDependencies)


jsonvc is a simple library for versioning JSON documents.

> jsonvc is still an experimental library and unstable.

jsonvc is intended to be used in developing web applications which need simple document versioning, where

- NoSQL backend is used
- Many small updates are made on large documents

## Examples

To create and initialize a versioned document:

```javascript
var jsonvc = require('jsonvc');

// Create a new versioned document from a normal document
var vdoc = jsonvc.init({ a: 1 });

// Or from an existing versioned document
var doc = vdoc.dumpDoc();
var repository = vdoc.dump();
var vdoc2 = jsonvc.load(doc, repository);
```

To update the document:

```javascript
// Create a new commit and update the document to { a: 1, b: 2 }
vdoc.update({ a: 1, b: 1 });
```

To restore the document by a commit ID:

```javascript
var vdoc = jsonvc.init({ a: 1 });

// Remember the first commit ID
var firstCommitId = vdoc.head;

vdoc.update({ a: 1, b: 1 });

// Now, vdoc has two commits and the current document is { a: 1, b: 1 }

// Create a new commit from the latest commit to restore the first document
vdoc.restore(firstCommitId);

// Now, vdoc has three commits and the current document is { a: 1 }
```

Use `.dump()` and `.dumpDoc()` to output the repository and the document, respectively:

```javascript
var vdoc = jsonvc.init({ a: 1 });

vdoc.dump();    // => internal object which represents the repository
vdoc.dumpDoc(); // => { a: 1 }
```

## Installation

### Node

Using [npm](https://www.npmjs.com/):

```shell
npm install --save jsonvc
```

### Browser

You can use [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/) or whatever you want.

## Contributing to jsonvc

Any ideas, feature requests, pull requests are welcomed.
Please add the relevant tests and ensure that it passes all the tests by executing
`npm test` before submitting a pull request.

## License

Copyright © 2015 Naoto Yokoyama

Distributed under the MIT license. See the [LICENSE](./LICENSE) file for full details.
