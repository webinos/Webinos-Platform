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

// [WP-607] Check non-absolute virtual path vulnerability

module.exports = VirtualFileSystem

var util = require("../util.js")
var vpath = require("../virtual-path.js")

var DirectoryEntry = require("../common/directory-entry.js")
var FileEntry = require("../common/file-entry.js")
var FileSystem = require("../common/file-system.js")
var Metadata = require("../common/metadata.js")

function VirtualFileSystem(fs) {
  this.fs = fs
}

VirtualFileSystem.prototype.requestFileSystem = function (callback) {
  util.async(callback)(null, new FileSystem(this.fs.name))
}

VirtualFileSystem.prototype.resolveLocalFileSystemURL = function (url, callback) {
  util.async(callback)(new util.CustomError("NotSupportedError"))
}

VirtualFileSystem.prototype.getMetadata = function (entry, callback) {
  this.fs.readMetadata(entry.fullPath, function (error, metadata) {
    if (error) return callback(error)
    callback(null, new Metadata(metadata))
  })
}

// webinos <3 webkit
function verifyDestinationPathForCopyOrMove(source, parent, newName) {
  if (!parent.isDirectory) {
    return false
  }

  if (source.isDirectory && vpath.isParentOf(source.fullPath, parent.fullPath)) {
    return false
  }

  if ((!newName || source.name === newName) && vpath.dirname(source.fullPath) === parent.fullPath) {
    return false
  }

  return true
}

// webinos <3 webkit
function getDestinationPathForCopyOrMove(source, parent, newName) {
  return vpath.join(parent.fullPath, newName || source.name)
}

VirtualFileSystem.prototype.moveTo = function (source, parent, newName, callback) {
  if (!verifyDestinationPathForCopyOrMove(source, parent, newName)) {
    return callback(new util.CustomError("InvalidModificationError"))
  }

  var destinationPath = getDestinationPathForCopyOrMove(source, parent, newName)
  this.fs.move(source.fullPath, destinationPath, function (error) {
    if (error) return callback(error)

    if (source.isDirectory) {
      callback(null, new DirectoryEntry(source.filesystem, destinationPath))
    } else {
      callback(null, new FileEntry(source.filesystem, destinationPath))
    }
  })
}

VirtualFileSystem.prototype.copyTo = function (source, parent, newName, callback) {
  if (!verifyDestinationPathForCopyOrMove(source, parent, newName)) {
    return callback(new util.CustomError("InvalidModificationError"))
  }

  var destinationPath = getDestinationPathForCopyOrMove(source, parent, newName)
  // chromium-style: Check entry type on the fly => extra system call (stat).
  this.fs.copy(source.fullPath, destinationPath, true, function (error) {
    if (error) return callback(error)

    if (source.isDirectory) {
      callback(null, new DirectoryEntry(source.filesystem, destinationPath))
    } else {
      callback(null, new FileEntry(source.filesystem, destinationPath))
    }
  })
}

VirtualFileSystem.prototype.remove = function (entry, callback) {
  if (entry.fullPath === "/") {
    return util.async(callback)(new util.CustomError("InvalidModificationError"))
  }

  // chromium-style: Check entry type on the fly => extra system call (stat).
  this.fs.remove(entry.fullPath, false, callback)
}

VirtualFileSystem.prototype.getParent = function (entry, callback) {
  var fullPath = vpath.dirname(entry.fullPath)
  this.fs.directoryExists(fullPath, function (error) {
    if (error) return callback(error)
    callback(null, new DirectoryEntry(entry.filesystem, fullPath))
  })
}

VirtualFileSystem.prototype.getFile = function (entry, path, options, callback) {
  var fullPath = vpath.resolve(entry.fullPath, path)
  if (options && options.create) {
    this.fs.createFile(fullPath, options.exclusive, function (error) {
      if (error) return callback(error)
      callback(null, new FileEntry(entry.filesystem, fullPath))
    })
  } else {
    this.fs.fileExists(fullPath, function (error) {
      if (error) return callback(error)
      callback(null, new FileEntry(entry.filesystem, fullPath))
    })
  }
}

VirtualFileSystem.prototype.getLink = function (entry, callback) {
  this.fs.createFileLink(entry.fullPath, callback)
}

// VirtualFileSystem.prototype.createWriter = function (entry, callback) {}
// VirtualFileSystem.prototype.file = function (entry, callback) {}

VirtualFileSystem.prototype.createReadStream = function (entry, options, callback) {
  this.fs.createReadStream(entry.fullPath, options, callback)
}

// Frontend-only: readAsText, readAsDataURL -- readAsBuffer => read.
VirtualFileSystem.prototype.read = function (entry, options) {
  // Not yet implemented.
}

VirtualFileSystem.prototype.createWriteStream = function (entry, options, callback) {
  this.fs.createWriteStream(entry.fullPath, options, callback)
}

VirtualFileSystem.prototype.write = function (entry, data, options) {
  // Not yet implemented.
}

VirtualFileSystem.prototype.truncate = function (entry, size, callback) {
  this.fs.truncate(entry.fullPath, size, callback)
}

VirtualFileSystem.prototype.getDirectory = function (entry, path, options, callback) {
  var fullPath = vpath.resolve(entry.fullPath, path)
  if (options && options.create) {
    this.fs.createDirectory(fullPath, options.exclusive, false, function (error) {
      if (error) return callback(error)
      callback(null, new DirectoryEntry(entry.filesystem, fullPath))
    })
  } else {
    this.fs.directoryExists(fullPath, function (error) {
      if (error) return callback(error)
      callback(null, new DirectoryEntry(entry.filesystem, fullPath))
    })
  }
}

VirtualFileSystem.prototype.removeRecursively = function (entry, callback) {
  if (entry.fullPath === "/") {
    return util.async(callback)(new util.CustomError("InvalidModificationError"))
  }

  // chromium-style: Check entry type on the fly => extra system call (stat).
  this.fs.remove(entry.fullPath, true, callback)
}

VirtualFileSystem.prototype.readEntries = function (entry, callback) {
  var self = this
  self.fs.readDirectory(entry.fullPath, function (error, metadataz) {
    if (error) return callback(error)
    callback(null, metadataz.map(function (metadata) {
      if (metadata.isDirectory) {
        return new DirectoryEntry(entry.filesystem, metadata.path)
      } else {
        return new FileEntry(entry.filesystem, metadata.path)
      }
    }))
  })
}
