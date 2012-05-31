/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

this.ManagerUtils = (function() {
	var fs = require('fs');
	var path = require('path');
	var nPathV = parseFloat(process.versions.node);
	if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

	function ManagerUtils() {}

	/*
	 * Add a set of properties to a target object
	 * target: the target object
	 * props:  an object whose enumerable properties are
	 *         added, by reference only
	 */
	ManagerUtils.addProperties = function(target, props) {
		for(var prop in props)
			target[prop] = props[prop];
	};

	/*
	 * Ensure a directory and its parents exists
	 * dirPath: path to the directory
	 */
	ManagerUtils.mkdirs = function(dirPath) {
		var pathElements = dirPath.split('/');
		dirPath = (dirPath[0] == '/') ? '/' : '';
		while(pathElements.length) {
			var elt = pathElements.shift();
			if(elt == '') continue;
			dirPath = path.resolve(dirPath, elt);
			if(nPathV.existsSync(dirPath)) {
				var stat = fs.statSync(dirPath);
				if(stat.isFile())
					throw new Error('ManagerUtils.mkdirs: specified path is a file');
				if(stat.isDirectory())
					continue;
			}
			fs.mkdirSync(dirPath);
		}
		return dirPath;
	};

	/*
	 * Delete a directory, recursively deleting its
	 * children as required.
	 * dirPath: the directory to delete.
	 */
	ManagerUtils.deleteDir = function(dirPath) {
		if(!nPathV.existsSync(dirPath))
			return;
		var stat = fs.statSync(dirPath);
		if(!stat.isDirectory())
			throw new Error('ManagerUtils.deleteDir: specified path is not a directory');

		var files = fs.readdirSync(dirPath);
		for(var i in files) {
			var item = path.resolve(dirPath, files[i]);
			stat = fs.statSync(item);
			if(stat.isFile())
				fs.unlinkSync(item);
			else
				ManagerUtils.deleteDir(item);
		}
		fs.rmdirSync(dirPath);
	};

	/*
	 * Copy a file, including cross-mount copy.
	 * Optionally force overwrite if destination already exists.
	 * source:    path to source file.
	 * dest:      path to destination (includes name of copied file)
	 * overwrite: boolean, force overwrite
	 */
	ManagerUtils.copyFile = function(source, dest, overwrite) {
		if(!nPathV.existsSync(source))
			throw new Error('ManagerUtils.copyFile: specified source file does not exist: ' + source);
		if(nPathV.existsSync(dest)) {
			if(!overwrite)
				throw new Error('ManagerUtils.copyFile: specified dest file aleady exists: ' + dest);
			fs.unlink(dest);
		}
		var destDir = path.dirname(dest);
		ManagerUtils.mkdirs(destDir);
		var buf = new Buffer(1024);
		var sourceFd = fs.openSync(source, 'r');
		var destFd = fs.openSync(dest, 'w');
		var read;
		while((read = fs.readSync(sourceFd, buf, 0, 1024)) > 0)
			fs.writeSync(destFd, buf, 0, read);
		fs.closeSync(sourceFd);
		fs.fsyncSync(destFd);
		fs.closeSync(destFd);
	};

	/*
	 * Copy a directory, including cross-mount copy.
	 * Optionally force overwrite if destination already exists.
	 * source:    path to source directory.
	 * dest:      path to destination (includes name of copied directory)
	 * overwrite: boolean, force overwrite
	 */
	ManagerUtils.copyDir = function(source, dest, overwrite) {
		if(!nPathV.existsSync(source))
			throw new Error('ManagerUtils.copyDir: specified source dir does not exist');
		if(nPathV.existsSync(dest)) {
			if(!overwrite)
				throw new Error('ManagerUtils.copyDir: specified dest dir aleady exists');
			ManagerUtils.deleteDir(dest);
		}
		ManagerUtils.mkdirs(dest);
		var files = fs.readdirSync(source);
		for(var i in files) {
			var item = path.resolve(source, files[i]);
			stat = fs.statSync(item);
			if(stat.isFile())
				ManagerUtils.copyFile(item, path.resolve(dest, files[i]), false);
			else
				ManagerUtils.copyDir(item, path.resolve(dest, files[i]), false);
		}
	};

	/*
	 * Determine whether or not an object contains
	 * any enumerable properties.
	 * ob: the object
	 */
	ManagerUtils.isEmpty = function(ob) {
		for(var prop in ob)
			return false;
		return true;
	};

	/*
	 * Perform a simple shallow clone of an object.
	 * Result is an object irrespective of whether
	 * the input is an object or array. All
	 * enumerable properties are copied.
	 * ob: the object
	 */
	ManagerUtils.shallowClone = function(ob) {
		var result = new Object();
		for(var prop in ob)
			result[prop] = ob[prop];
		return result;
	};

	/*
	 * Clone an object by creating a new object with the
	 * given object as its prototype. Optionally
	 * a set of additional own properties can be
	 * supplied to be added to the newly created clone.
	 * ob:            the object to be cloned
	 * ownProperties: optional object with additional
	 *                properties to add
	 */
	ManagerUtils.prototypicalClone = function(ob, ownProperties) {
		function F() {}
		F.prototype = ob;
		var result = new F();
		if(ownProperties)
			ManagerUtils.addProperties(result, ownProperties);
		return result;
	};

	/*
	 * Determine whether or not an object has an enumerable
	 * property whose value equals a given value.
	 * ob:  the object
	 * val: the value to find
	 */
	ManagerUtils.containsValue = function(ob, val) {
		for(var i in ob) {
			if(ob[i] == val)
				return true;
		}
		return false;
	};

	/*
	 * Construct an array of the values of the enumerable
	 * properties of a given object, optionally limited
	 * to only the own properties.
	 * ob:      the object
	 * ownOnly: boolean, get own properties only
	 */
	ManagerUtils.valuesArray = function(ob, ownOnly) {
		var result = [];
		for(var prop in ob) {
			if(ownOnly && !ob.hasOwnProperty(prop)) continue;
			result.push(ob[prop]);
		}
		return result.length ? result : undefined;
	};

	return ManagerUtils;
})();
