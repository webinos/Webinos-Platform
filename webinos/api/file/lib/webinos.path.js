/******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 *****************************************************************************/

if (typeof module === "undefined") {
	if (typeof webinos === "undefined")
		webinos = {};

	if (typeof webinos.path === "undefined")
		webinos.path = {};
}

/**
 * Node.js -- Path {@link https://github.com/joyent/node/blob/master/lib/path.js} module extract.
 * 
 * @author Felix-Johannes Jendrusch <felix-johannes.jendrusch@fokus.fraunhofer.de>
 */
(function (exports) {
	"use strict";

	var mUtils = {};

	/**
	 * Splits a Unix-style path into root, directory, basename and extension.
	 * 
	 * @param {String} path The path.
	 * @returns {String[]} [root, directory, basename, extension]
	 */
	mUtils.split = function (path) {
		var result = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:[\s\S]+?)?(\.[^.]*)?)$/.exec(path);

		return [result[1] || "", result[2] || "", result[3] || "", result[4] || ""];
	};

	/**
	 * Normalizes a path array, i.e., an array without slashes, or empty elements, by resolving . and .. elements.
	 * Relative and absolute paths are not distinguished.
	 * 
	 * @param {String[]} parts The path array.
	 * @param {Boolean} [allowAboveRoot=false] Whether the path is allowed to go above the root.
	 * @returns {String[]} A normalized path array.
	 */
	mUtils.normalizeArray = function (parts, allowAboveRoot) {
		var up = 0;

		for ( var i = parts.length - 1; i >= 0; i--) {
			var last = parts[i];

			if (last == ".")
				parts.splice(i, 1);
			else if (last == "..") {
				parts.splice(i, 1);

				up++;
			} else if (up) {
				parts.splice(i, 1);

				up--;
			}
		}

		if (allowAboveRoot)
			for (; up--;)
				parts.unshift("..");

		return parts;
	};

	/**
	 * Returns the directory components of the given path.
	 * 
	 * @param {String} path The path.
	 * @returns {String} The directory components.
	 */
	exports.dirname = function (path) {
		var result = mUtils.split(path),
			root = result[0],
			dir = result[1];

		if (!root && !dir)
			return ".";

		if (dir)
			dir = dir.substring(0, dir.length - 1);

		return root + dir;
	};

	/**
	 * Returns the basename component of the given path.
	 * 
	 * @param {String} path The path.
	 * @returns {String} The basename component.
	 */
	exports.basename = function (path, ext) {
		var base = mUtils.split(path)[2];

		if (ext && base.substr(-1 * ext.length) === ext)
			base = base.substr(0, base.length - ext.length);

		return base;
	};

	/**
	 * Returns the basename component's extension of the given path.
	 * 
	 * @param {String} path The path.
	 * @returns {String} The basename component's extension.
	 */
	exports.extname = function (path) {
		return mUtils.split(path)[3];
	};

	/**
	 * Normalizes a path by resolving . and .. parts, and removes any trailing slashes (default behaviour).
	 * 
	 * @param {String} path The path.
	 * @param {Boolean} [preserveTrailingSlash=false] Whether a single trailing slash should be preserved.
	 * @returns {String} A normalized path.
	 * 
	 * @see mUtils.normalizeArray
	 */
	exports.normalize = function (path, preserveTrailingSlash) {
		var isAbsolute = path.charAt(0) == "/", 
			trailingSlash = path.charAt(path.length - 1) == "/";

		path = mUtils.normalizeArray(path.split("/").filter(function (p) {
			return !!p;
		}), !isAbsolute).join("/");

		if (!path && !isAbsolute)
			path = ".";

		if (path && trailingSlash && preserveTrailingSlash)
			path += "/";

		return (isAbsolute ? "/" : "") + path;
	};

	/**
	 * Checks if the given paths refer to the same entry. Both paths are normalized prior to comparison.
	 * 
	 * @param {String} path1 First path.
	 * @param {String} path2 Second path.
	 * @returns {Boolean} True if path1 and path2 refer to the same entry, false otherwise.
	 */
	exports.equals = function (path1, path2) {
		return exports.normalize(path1, false) == exports.normalize(path2, false);
	};

	/**
	 * Joins all arguments together and normalizes the resulting path.
	 * 
	 * @returns {String} The joined and normalized path.
	 */
	exports.join = function () {
		var paths = Array.prototype.slice.call(arguments, 0);

		return exports.normalize(paths.filter(function (p) {
			return typeof p === "string" && p;
		}, false).join("/"));
	};

	/**
	 * Checks if path is absolute.
	 * 
	 * @param {String} path The path.
	 * @returns {Boolean} True if path is absolute, false otherwise.
	 */
	exports.isAbsolute = function (path) {
		return path.charAt(0) == "/";
	};

	/**
	 * Given two absolute paths, checks if path2 contains a path prefix of path1 (e.g., in case of directories, checks
	 * if path2 is a subdirectory of path1). Both paths are normalized prior to comparison.
	 * 
	 * @param {String} path1 First path.
	 * @param {String} path2 Second path.
	 * @returns {Boolean} True if path2 contains a path prefix of path1, false otherwise.
	 * 
	 * TODO Check if paths are absolute.
	 */
	exports.isPrefixOf = function (path1, path2) {
		var path1Parts = exports.normalize(path1).split("/"),
			path2Parts = exports.normalize(path2).split("/");

		if (path2Parts.length < path1Parts.length)
			return false;

		for ( var i = 0; i < path1Parts.length; i++)
			if (path1Parts[i] != path2Parts[i])
				return false;

		return true;
	};

	/**
	 * Resolves the last argument to an absolute path by prepending preceding arguments in right to left order, until
	 * an absolute path is found.
	 * 
	 * @returns {String} The resolved path (normalized, and without any trailing slashes unless the path gets resolved
	 * 		to the root directory).
	 */
	exports.resolve = function () {
		var resolvedPath = "",
			resolvedAbsolute = false;

		for ( var i = arguments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
			var path = arguments[i];

			if (typeof path !== "string" || !path)
				continue;

			resolvedPath = path + "/" + resolvedPath;
			resolvedAbsolute = path.charAt(0) == "/";
		}

		resolvedPath = mUtils.normalizeArray(resolvedPath.split("/").filter(function (p) {
			return !!p;
		}), !resolvedAbsolute).join("/");

		return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
	};

	/**
	 * Given two absolute paths, solves the relative path from from to to. Both paths are normalized prior to solving.
	 * 
	 * @param {String} from Origin path.
	 * @param {String} to Target path.
	 * @returns {String} The relative path.
	 * 
	 * TODO Check if paths are absolute (resolve if not? fallback prefix?).
	 */
	exports.relative = function (from, to) {
		var fromParts = exports.normalize(from).split("/"),
			toParts = exports.normalize(to).split("/");

		var length = Math.min(fromParts.length, toParts.length),
			samePartsLength = length;

		for ( var i = 0; i < length; i++)
			if (fromParts[i] != toParts[i]) {
				samePartsLength = i;

				break;
			}

		var outputParts = [];

		for ( var i = samePartsLength; i < fromParts.length; i++)
			outputParts.push("..");

		outputParts = outputParts.concat(toParts.slice(samePartsLength));

		return outputParts.join("/");
	};
})(typeof module === "undefined" ? webinos.path : module.exports);
