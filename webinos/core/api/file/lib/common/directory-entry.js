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

module.exports = DirectoryEntry

var inherits = require("util").inherits // require("inherits")

var Entry = require("./entry.js")

inherits(DirectoryEntry, Entry)
function DirectoryEntry(filesystem, fullPath) {
  DirectoryEntry.super_.call(this, filesystem, fullPath)
}

DirectoryEntry.prototype.isDirectory = true

DirectoryEntry.prototype.createReader = function () {
  // Not yet implemented.
}

DirectoryEntry.prototype.getFile = function (path, options, callback) {
  // Not yet implemented.
}

DirectoryEntry.prototype.getDirectory = function (path, options, callback) {
  // Not yet implemented.
}

DirectoryEntry.prototype.removeRecursively = function (callback) {
  // Not yet implemented.
}
