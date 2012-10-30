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

// Short-term issues:
// [WP-?] Check non-absolute virtual path vulnerability.

// Long-term issues:
// [WP-?] Add file system origin-specificity.
// [WP-?] Support inter file system entry moving and copying?
// [WP-?] Support inter PZP entry moving and copying?

var inherits = require("inherits")
var util = require("./util.js")
var virtualPathModule = require("./virtual-path.js")

var LocalFileSystem = require("./engine/local-file-system.js")

var DirectoryEntry = require("./common/directory-entry.js")
var FileEntry = require("./common/file-entry.js")
var FileSystem = require("./common/file-system.js")
var Metadata = require("./common/metadata.js")

function readFileSystem(mayBeFileSystem, callback) {
  LocalFileSystem.readFileSystem("default", callback)
}

exports.requestFileSystem = function (type, size, callback) {
  LocalFileSystem.requestFileSystem("default", type, size,
      function (error, fileSystem) {
        if (error) return callback(error)
        callback(null, new FileSystem(fileSystem.name))
      })
}

exports.resolveLocalFileSystemURL = function (url, callback) {
  var colon = url.indexOf(":")
    , slash = url.indexOf("/")
  var protocol = url.substr(0, colon)
    , filesystem = url.substr(colon + 1, slash)
    , fullPath = url.substr(slash)

  if (protocol !== "webinos") {
    return util.async(callback)(new util.CustomError("EncodingError"))
  }

  LocalFileSystem.readFileSystem("default", function (error, fileSystem) {
    if (error) return callback(error)
    fileSystem.readMetadata(fullPath, function (error, metadata) {
      if (error) return callback(error)

      var filesystem = new FileSystem(fileSystem.name)
      if (metadata.isDirectory) {
        callback(null, new DirectoryEntry(filesystem, fullPath))
      } else {
        callback(null, new FileEntry(filesystem, fullPath))
      }
    })
  })
}

exports.getMetadata = function (entry, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)
    fileSystem.readMetadata(entry.fullPath, function (error, metadata) {
      if (error) return callback(error)
      callback(null, new Metadata(metadata))
    })
  })
}

// webinos <3 webkit
function verifyDestinationPathForCopyOrMove(source, parent, newName) {
  if (!parent.isDirectory) {
    return false
  }

  if (source.filesystem.name !== parent.filesystem.name) {
    return false
  }

  if (source.isDirectory &&
      virtualPathModule.isParentOf(source.fullPath, parent.fullPath)) {
    return false
  }

  if ((!newName || source.name === newName) &&
      virtualPathModule.dirname(source.fullPath) === parent.fullPath) {
    return false
  }

  return true
}

// webinos <3 webkit
function getDestinationPathForCopyOrMove(source, parent, newName) {
  return virtualPathModule.join(parent.fullPath, newName || source.name)
}

exports.moveTo = function (source, parent, newName, callback) {
  readFileSystem(source.filesystem, function (error, fileSystem) {
    if (error) return callback(error)

    if (!verifyDestinationPathForCopyOrMove(source, parent, newName)) {
      return callback(new util.CustomError("InvalidModificationError"))
    }

    var destinationPath = getDestinationPathForCopyOrMove(source, parent,
        newName)
    fileSystem.move(source.fullPath, destinationPath, function (error) {
      if (error) return callback(error)

      if (source.isDirectory) {
        callback(null, new DirectoryEntry(source.filesystem, destinationPath))
      } else {
        callback(null, new FileEntry(source.filesystem, destinationPath))
      }
    })
  })
}

exports.copyTo = function (source, parent, newName, callback) {
  readFileSystem(source.filesystem, function (error, fileSystem) {
    if (error) return callback(error)

    if (!verifyDestinationPathForCopyOrMove(source, parent, newName)) {
      return callback(new util.CustomError("InvalidModificationError"))
    }

    var destinationPath = getDestinationPathForCopyOrMove(source, parent,
        newName)
    // chromium-style: Check entry type on the fly => extra system call (stat).
    fileSystem.copy(source.fullPath, destinationPath, true, function (error) {
      if (error) return callback(error)

      if (source.isDirectory) {
        callback(null, new DirectoryEntry(source.filesystem, destinationPath))
      } else {
        callback(null, new FileEntry(source.filesystem, destinationPath))
      }
    })
  })
}

exports.remove = function (entry, callback) {
  if (entry.fullPath === "/") {
    return util.async(callback)(
        new util.CustomError("InvalidModificationError"))
  }

  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)
    // chromium-style: Check entry type on the fly => extra system call (stat).
    fileSystem.remove(entry.fullPath, false, callback)
  })
}

exports.getParent = function (entry, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)

    var fullPath = virtualPathModule.dirname(entry.fullPath)
    fileSystem.directoryExists(fullPath, function (error) {
      if (error) return callback(error)
      callback(null, new DirectoryEntry(entry.filesystem, fullPath))
    })
  })
}

exports.getFile = function (entry, path, options, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)

    var fullPath = virtualPathModule.resolve(entry.fullPath, path)
    if (options && options.create) {
      fileSystem.createFile(fullPath, options.exclusive, function (error) {
        if (error) return callback(error)
        callback(null, new FileEntry(entry.filesystem, fullPath))
      })
    } else {
      fileSystem.fileExists(fullPath, function (error) {
        if (error) return callback(error)
        callback(null, new FileEntry(entry.filesystem, fullPath))
      })
    }
  })
}

// exports.createWriter = function (entry, callback) {}
// exports.file = function (entry, callback) {}

exports.createReadStream = function (entry, options, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)
    fileSystem.createReadStream(entry.fullPath, options, callback)
  })
}

// Frontend-only: readAsText, readAsDataURL -- readAsBuffer => read.
exports.read = function (entry, options) {
  // Not yet implemented.
}

exports.createWriteStream = function (entry, options, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)
    fileSystem.createWriteStream(entry.fullPath, options, callback)
  })
}

exports.write = function (entry, data, options) {
  // Not yet implemented.
}

exports.truncate = function (entry, size, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)
    fileSystem.truncate(entry.fullPath, size, callback)
  })
}

exports.getDirectory = function (entry, path, options, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)

    var fullPath = virtualPathModule.resolve(entry.fullPath, path)
    if (options && options.create) {
      fileSystem.createDirectory(fullPath, options.exclusive, false,
          function (error) {
            if (error) return callback(error)
            callback(null, new DirectoryEntry(entry.filesystem, fullPath))
          })
    } else {
      fileSystem.directoryExists(fullPath, function (error) {
        if (error) return callback(error)
        callback(null, new DirectoryEntry(entry.filesystem, fullPath))
      })
    }
  })
}

exports.removeRecursively = function (entry, callback) {
  if (entry.fullPath === "/") {
    return util.async(callback)(
        new util.CustomError("InvalidModificationError"))
  }

  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)
    // chromium-style: Check entry type on the fly => extra system call (stat).
    fileSystem.remove(entry.fullPath, true, callback)
  })
}

exports.readEntries = function (entry, callback) {
  readFileSystem(entry.filesystem, function (error, fileSystem) {
    if (error) return callback(error)

    fileSystem.readDirectory(entry.fullPath, function (error, files) {
      if (error) return callback(error)

      var entries = []
      ;(function iterate() {
        var file = files.shift()
        if (!file) return callback(null, entries)

        var fullPath = virtualPathModule.join(entry.fullPath, file)
        fileSystem.readMetadata(fullPath, function (error, metadata) {
          if (error) return callback(error)

          if (metadata.isDirectory) {
            entries.push(new DirectoryEntry(entry.filesystem, fullPath))
          } else {
            entries.push(new FileEntry(entry.filesystem, fullPath))
          }

          iterate()
        })
      })()
    })
  })
}
