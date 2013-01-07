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

module.exports = Entry

var vpath = require("../vpath.js")

function Entry(filesystem, fullPath) {
  this.name = vpath.basename(fullPath)
  this.fullPath = fullPath
  this.filesystem = filesystem
}

Entry.prototype.isFile = false
Entry.prototype.isDirectory = false

Entry.prototype.getMetadata = function (callback) {
  // Not yet implemented.
}

Entry.prototype.moveTo = function (parent, newName, callback) {
  // Not yet implemented.
}

Entry.prototype.copyTo = function (parent, newName, callback) {
  // Not yet implemented.
}

Entry.prototype.toURL = function () {
  // Not yet implemented.
}

Entry.prototype.remove = function (callback) {
  // Not yet implemented.
}

Entry.prototype.getParent = function (callback) {
  // Not yet implemented.
}

Entry.prototype.toJSON = function () {
  var json = { name        : this.name
             , fullPath    : this.fullPath
             , filesystem  : this.filesystem
             , isFile      : this.isFile
             , isDirectory : this.isDirectory
             }
  return json
}
