/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
	gulp = require('gulp'),
	Forestry = require('forestry'),
	gulpFileTree = require('../src/gulp-file-tree');

describe('gulp-file-tree', function () {

	var defaultOptions;
	beforeEach(function () {
		defaultOptions = {
			emitTree: true,
			transform: null,
			emitFiles: false
		};
	});

	it('handles being passed no files', function (done) {
		var gft = gulpFileTree({
				emitTree: true,
				transform: null
			}),
			files = [];

		gft.on('data', function (file){
			files.push(file);
		});
		gft.on('end', function () {
			assert.equal(files.length, 1);
			assert.deepEqual(JSON.parse(files.pop().contents.toString()),  null);
			done();
		});

		gulp.src('no/such/folder/**/*')
			.pipe(gft);
	});

	it('disregards redundant nodes at the root of the tree', function (done) {
		var files = [],
			gft = gulpFileTree({
				emitTree: true,
				transform: null,
				emitFiles: true,
			}),
			cwd;


		gft.on('data', function (file){
			files.push(file);
			cwd = file.cwd;
		});
		gft.on('end', function () {
			var tree = JSON.parse(files.pop().contents.toString());
			assert.notEqual(tree.path, cwd);
			assert.equal(tree.path, cwd + '/test/fixture/path/to/folder');
			done();
		});

		gulp.src(['test/fixture/**/*'])
			.pipe(gft);
	});

	describe('correctly generates file tree from passed in files', function () {

		var allFiles, gft, files;
		beforeEach(function (done) {
			allFiles = [];
			gulp.src('test/fixture/path/to/folder/**/*')
				.on('data', function (file) {
					if (!file.isNull()) {
						allFiles.push(file);
					}
				})
				.on('end', function () {
					done();
				});

			files = [];
			gft = gulpFileTree({
				emitTree: true,
				transform: null,
				emitFiles: true,
				fileName: 'tree'
			});

			gft.on('data', function (file){
				files.push(file);
			});
		});

		function checkTree(files, tree) {
			tree = Forestry.parse(tree);
			var shouldExist = allFiles.filter(function (file) {
					return files.some(function (f) {
						return f.path === file.path;
					});
				}),
				shouldNotExist = allFiles.filter(function (file) {
					return files.every(function (f) {
						return f.path !== file.path;
					});
				}),
				foundNode;

			shouldExist.forEach(function (file) {
				foundNode = tree.find(function (n) {
					return n.data.path === file.path;
				});
				assert(foundNode instanceof Forestry.Node);
				assert.equal(foundNode.data.path, file.path);
			});

			shouldNotExist.forEach(function (file) {
				assert(tree.find(function (n) {
					return n.data.path === file.path;
				}) === null);
			});
		}

		it('I', function (done) {
			gft.on('end', function () {
				checkTree(files, JSON.parse(files.pop().contents.toString()));
				done();
			});

			gulp.src(['test/fixture/path/to/folder/**/*.json',
					'test/fixture/path/to/folder/**/*.css'])
				.pipe(gft);
		});

		it('II', function (done) {
			gft.on('end', function () {
				checkTree(files, JSON.parse(files.pop().contents.toString()));
				done();
			});

			gulp.src(['test/fixture/path/to/folder/two/**/*.html'])
				.pipe(gft);
		});

		it('III', function (done) {
			gft.on('end', function () {
				checkTree(files, JSON.parse(files.pop().contents.toString()));
				done();
			});

			gulp.src(['test/fixture/**/*.scss'])
				.pipe(gft);
		});
	});

	describe('options', function () {

		describe('default', function () {
			it('emits only a single file as tree.json containing the generated file tree in json friendly format', function (done) {
				var gft = gulpFileTree(),
					files = [];

				gft.on('data', function (file) {
					files.push(file);
				});
				gft.on('end', function () {
					assert.equal(files.length, 1);
					assert.equal(files[0].path, 'tree.json');
					var tree = JSON.parse(files[0].contents.toString());
					assert.equal(tree.path.replace(tree.cwd, ''), '/test/fixture/path/to/folder');
					assert.equal(tree.name, 'folder');
					assert.equal(tree.children.length, 4);
					done();
				});

				gulp.src('test/fixture/**/*')
					.pipe(gft);
			});
		});

		describe('fileName', function () {
			it('emits only a single file with the same name as fileName option', function (done) {
				var gft = gulpFileTree({
					fileName: 'test'
				}),
					files = [];

				gft.on('data', function (file) {
					files.push(file);
				});
				gft.on('end', function () {
					assert.equal(files[0].path, 'test.json');
					done();
				});

				gulp.src('test/fixture/**/*')
					.pipe(gft);
			});

			it('throws an error if fileName passed in is not of type \'string\'', function () {
				assert.throws(function () {
					var gft = gulpFileTree({
							fileName: function(){}
						});
					gulp.src('test/fixture/**/*')
						.pipe(gft);
				}, TypeError, '\'fileName\' option must be of type \'string\'');
				assert.throws(function () {
					var gft = gulpFileTree({
							fileName: 1245
						});
					gulp.src('test/fixture/**/*')
						.pipe(gft);
				}, TypeError, '\'fileName\' option must be of type \'string\'');
				assert.throws(function () {
					var gft = gulpFileTree({
							fileName: {}
						});
					gulp.src('test/fixture/**/*')
						.pipe(gft);
				}, TypeError, '\'fileName\' option must be of type \'string\'');
			});
		});

		describe('emitTree', function () {

			it('emits the generated tree as tree.json file if emitTree is true', function (done) {
				var gft =  gulpFileTree({
						emitTree: true,
						transform: null,
						emitFiles: false
					}),
					files = [];
				gft.on('data', function (file) {
					files.push(file);
				});
				gft.on('end', function () {
					assert.equal(files.length, 1);
					assert.equal(files[0].path, 'tree.json');
					done();
				});

				gulp.src('test/fixture/**/*')
					.pipe(gft);
			});

		});

		describe('transform', function () {
			it('transforms the generated tree using the passed transform function', function (done) {
				function transform(tree) {
					return tree.traverse(function (node) {
						node.data = node.data.relative.replace(/.*\//, '');
					});
				}

				var gft = gulpFileTree({
						emitTree: true,
						transform: transform,
						emitFiles: false
					}),
					files = [];
				gft.on('data', function (file) {
					files.push(file);
				});
				gft.on('end', function () {
					assert.equal(files.length, 1);
					var tree = JSON.parse(files.pop().contents.toString());
					assert.equal(tree.data, 'b.css');
					assert.equal(tree.children.length, 0);
					done();
				});
				gulp.src('test/fixture/**/b.css')
					.pipe(gft);
			});

			it('passes each file into the transform if emitFiles is true', function (done) {

				function transform(tree, file) {
					var node = tree.find(function (node) {
						return node.data.path === file.path;
					}).parent.remove();
					node.data = node.data.path;
					return node;
				}

				var gft = gulpFileTree({
						emitTree: false,
						transform: transform,
						emitFiles: true
					}),
					files = [];
				gft.on('data', function (file) {
					files.push(file);
				});
				gft.on('end', function () {
					files.forEach(function (file) {
						assert.equal(file.tree.data, file.path.replace(/\/?[^\/]*\/?$/, ''));
					});
					done();
				});
				gulp.src('test/fixture/**/*.html')
					.pipe(gft);
			});

			it('throws an error if transform passed in is not of type \'function\'', function () {
				assert.throws(function () {
					var gft = gulpFileTree({
							transform: 'string'
						});
					gulp.src('test/fixture/**/*')
						.pipe(gft);
				}, TypeError, '\'transform\' option must be of type \'function\'');
				assert.throws(function () {
					var gft = gulpFileTree({
							transform: 1245
						});
					gulp.src('test/fixture/**/*')
						.pipe(gft);
				}, TypeError, '\'transform\' option must be of type \'function\'');
				assert.throws(function () {
					var gft = gulpFileTree({
							transform: {}
						});
					gulp.src('test/fixture/**/*')
						.pipe(gft);
				}, TypeError, '\'transform\' option must be of type \'function\'');
			});
		});

		describe('emitFiles', function () {
			it('emits files passed through with tree added to each if emitFiles is true', function (done) {
				var gft = gulpFileTree({
						emitTree: false,
						transform: null,
						emitFiles: true
					}),
					files = [];


				gft.on('data', function (file) {
					files.push(file);
				});
				gft.on('end', function () {
					assert.equal(files.length, 4);
					files.forEach(function (file) {
						assert.equal(file.path.replace(/[^.]*/, ''), '.html');
					});
					done();
				});
				gulp.src('test/fixture/**/*.html')
					.pipe(gft);
			});
		});

	});

});
