/*******************************************************************************
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
 ******************************************************************************/

if (typeof module === "undefined") {
  if (typeof webinos === "undefined") webinos = {};
  if (typeof webinos.path === "undefined") webinos.path = {};
}

// webinos <3 node.js
(function (exports) {
  var splitPathRe =
        /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;

  function splitPath(path) {
    var result = splitPathRe.exec(path);
    return [result[1] || "", result[2] || "", result[3] || "", result[4] || ""];
  }

  function normalizeArray(parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var part = parts[i];
      if (part === ".") {
        parts.splice(i, 1);
      } else if (part === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    if (allowAboveRoot) {
      for (; up--;) {
        parts.unshift("..");
      }
    }

    return parts;
  }

  exports.normalize = function (path) {
    var isAbsolute = path.charAt(0) === "/"
      , trailingSlash = path.substr(-1) === "/";

    path = normalizeArray(path.split("/").filter(function (part) {
      return !!part;
    }), !isAbsolute).join("/");

    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }

    return (isAbsolute ? "/" : "") + path;
  };

  exports.join = function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(paths.filter(function (path) {
      return path && typeof path === "string";
    }).join("/"));
  };

  exports.resolve = function () {
    var resolvedPath = ""
      , resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
      // TODO Use some fallback (e.g., the current working directory ..not)?
      var path = arguments[i];

      if (!path || typeof path !== "string") {
        continue;
      }

      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path.charAt(0) === "/";
    }

    resolvedPath = normalizeArray(
      resolvedPath.split("/").filter(function (part) {
        return !!part;
      }
    ), !resolvedAbsolute).join("/");

    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
  };

  exports.relative = function (from, to) {
    from = exports.resolve(from).substr(1);
    to = exports.resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join("/");
  };

  // webinos <3 webkit
  exports.isParentOf = function (parent, mayBeChild) {
    if (parent === "/" && mayBeChild !== "/") {
      return true;
    }

    if (parent.length > mayBeChild.length || mayBeChild.indexOf(parent) !== 0) {
      return false;
    }

    if (mayBeChild.charAt(parent.length) !== "/") {
      return false;
    }

    return true;
  };

  exports.dirname = function (path) {
    var result = splitPath(path)
      , root = result[0]
      , dir = result[1];

    if (!root && !dir) {
      return ".";
    }

    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
  };

  exports.basename = function (path, ext) {
    var file = splitPath(path)[2];

    if (ext && file.substr(-1 * ext.length) === ext) {
      file = file.substr(0, file.length - ext.length);
    }

    return file;
  };

  exports.extname = function (path) {
    return splitPath(path)[3];
  };
})(typeof module !== "undefined" ? module.exports : webinos.path);
