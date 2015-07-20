[gulp](https://github.com/wearefractal/gulp)-file-tree [![Build Status](https://travis-ci.org/iamcdonald/gulp-file-tree.svg?branch=master)](https://travis-ci.org/iamcdonald/gulp-file-tree) [![Coverage Status](https://coveralls.io/repos/iamcdonald/gulp-file-tree/badge.svg?branch=master&service=github)](https://coveralls.io/github/iamcdonald/gulp-file-tree?branch=master)
==============

A [gulp](https://github.com/wearefractal/gulp) plugin for amalgamating a stream of files into a file tree.

## Install

```sh
$ npm install --save-dev gulp-file-tree
```

## Usage

```js
var gulp = require('gulp'),
    gft = require('gulp-file-tree');

gulp.task('default', function () {
	return gulp.src('src/pages/*.html')
		.pipe(gft())
		.pipe(gulp.dest('./'));
});
```
The default created tree (saved as 'tree.json') would look like this:
```
{
	"cwd": "/Users/you/project",
	"base": "/Users/you/project/src/",
	"path": "/Users/you/project/src/pages",
	"relative": "pages",
	"name": "pages",
	"isFile": false,
	"isDirectory": true,
	"children": [
		{
			"cwd": "/Users/you/project",
			"base": "/Users/you/project/src/",
			"path": "/Users/you/project/src/pages/one.html",
			"relative": "pages/one.html",
			"name": "one.html",
			"isFile": true,
			"isDirectory": false,
			"children": []
		},
		{
			"cwd": "/Users/you/project",
			"base": "/Users/you/project/src/",
			"path": "/Users/you/project/src/pages/three",
			"relative": "pages/three",
			"name": "three",
			"isFile": false,
			"isDirectory": true,
			"children": [
				{
					"cwd": "/Users/you/project",
					"base": "/Users/you/project/src/",
					"path": "/Users/you/project/src/pages/three/five.html",
					"relative": "pages/three/five.html",
					"name": "five.html",
					"isFile": true,
					"isDirectory": false,
					"children": []
				},
				{
					"cwd": "/Users/you/project",
					"base": "/Users/you/project/src/",
					"path": "/Users/you/project/src/pages/three/four.html",
					"relative": "pages/three/four.html",
					"name": "four.html",
					"isFile": true,
					"isDirectory": false,
					"children": []
				}
			]
		},
		{
			"cwd": "/Users/you/project",
			"base": "/Users/you/project/src/",
			"path": "/Users/you/project/src/pages/two.html",
			"relative": "pages/two.html",
			"name": "two.html",
			"isFile": true,
			"isDirectory": false,
			"children": []
		}
	]
}
```

for the following file structure at `/Users/you/project`:
```
* src/
  * pages/
    * one.html
    * two.html
    * three/
      * four.html
      * five.html
```

## API

### gulp-file-tree(options)

#### options.emitTree (default: `true`)
Type: `Boolean`

Determines whether a json file containing the tree structure should be emitted.

#### options.fileName (default: `tree`)
Type: `String`

The base filename that the json tree structure should be emitted as.

#### options.emitFiles (default: `false`)
Type: `Boolean`

Determines whether files passed in are also emitted with an added property `tree` containing the generated file tree.

#### options.transform (default: `null`)
Type: `Function`

A function that can be passed in to perform a custom transform on a clone of the generated file tree which is provided as the first argument.  

If emitFiles is `true` the function will recieve a second argument, the file itself, which can be used within the transform process. This allows for per-file tree-transforms which are could be used, for instance, to create page-based static-site navigation.

## Forestry

The plugin uses the [forestry](https://github.com/iamcdonald/forestry) lib for modelling and building up the tree and it is a structure of forestry nodes that you have access to
- on each emitted file, in the instance you set emitFiles to `true` and do not pass a `transform` function
- or via the first argument of a passed in `transform` function.  

For more information on the functionality provided please see the forestry documentation.

## License

[MIT](http://opensource.org/licenses/MIT) © Iain McDonald
