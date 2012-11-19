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

module.exports = FileEntry

var inherits = require("inherits")

var Entry = require("./entry.js")

inherits(FileEntry, Entry)
function FileEntry(filesystem, fullPath) {
  FileEntry.super.call(this, filesystem, fullPath)
}

FileEntry.prototype.isFile = true

FileEntry.prototype.createWriter = function (callback) {
  // Not yet implemented.
}

FileEntry.prototype.file = function (callback) {
  // Not yet implemented.
}
