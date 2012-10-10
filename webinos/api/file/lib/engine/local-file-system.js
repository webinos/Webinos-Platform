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

// Long-term issues:
// [WP-?] Support multiple file systems (for origin-specificity).
// [WP-?] Enforce file system quota limitations.
// [WP-?] Garbage collect temporary file systems.

var fs = require("fs")
var inherits = require("inherits")
var mkdirp = require("mkdirp")
var pathModule = require("path")
var util = require("../util.js")
var virtualPathModule = require("../virtual-path.js")

var EventEmitter = require("events").EventEmitter

// Map of POSIX error codes to DOM4 error types (and descriptions). Mappings
// are chromium-based and may not comply with the specification.
var errorMap = { "EACCES"    : { type : "NoModificationAllowedError" }
               , "EEXIST"    : { type : "InvalidModificationError" }
               , "EISDIR"    : { type : "NoModificationAllowedError" }
               , "EMFILE"    : { type : "InvalidModificationError" }
               , "ENOENT"    : { type : "NotFoundError" }
               , "ENOMEM"    : { type : "InvalidModificationError" }
               , "ENOSPC"    : { type : "QuotaExceededError" }
               , "ENOTDIR"   : { type : "TypeMismatchError" }
               , "ENOTEMPTY" : { type : "InvalidModificationError" }
               , "EPERM"     : { type : "NoModificationAllowedError" }
               , "EROFS"     : { type : "NoModificationAllowedError" }
               , "ETXTBSY"   : { type : "InvalidModificationError" }
               }

// Maps the given error, or, more precisely, its POSIX error code, to a DOM4
// error type (and description). If provided, the customErrorMap precedes the
// default errorMap.
// chromium-style: Unmapped errors are treated as InvalidStateError.
function map(error, customErrorMap) {
  var mapping
  if (customErrorMap && customErrorMap[error.code]) {
    mapping = customErrorMap[error.code]
  } else if (errorMap[error.code]) {
    mapping = errorMap[error.code]
  } else {
    // e.g., EBADF, EBUSY, EFAULT, EFBIG, EINTR, EINVAL, EIO, ELOOP, EMLINK,
    //       ENAMETOOLONG, ENODEV, ENXIO, EOVERFLOW, EWOULDBLOCK, EXDEV
    mapping = { type : "InvalidStateError" }
  }
  return new util.CustomError(mapping.type, mapping.description)
}

var basePath
exports.init = function (path) {
  basePath = path

  mkdirp.sync(basePath)
}

// webinos <3 webkit
var fileSystem
function openFileSystem(name, create, callback) {
  if (fileSystem) return util.async(callback)(null, fileSystem)

  mkdirp(pathModule.join(basePath, "default"), function (error) {
    if (error) return callback(map(error))

    fileSystem = new LocalFileSystem("default", "permanent", 0)
    callback(null, fileSystem)
  })
}

exports.requestFileSystem = function (name, type, size, callback) {
  // webkit-style: Ignore requested file system type and size.
  openFileSystem(name, true, callback)
}

exports.readFileSystem = function (name, callback) {
  openFileSystem(name, false, callback)
}

function realize(fileSystem, path) {
  return pathModule.join(basePath, fileSystem.name, path)
}

function LocalFileSystem(name, type, size) {
  this.name = name
  this.type = type
  this.size = size
}

LocalFileSystem.prototype.readMetadata = function (path, callback) {
  fs.stat(realize(this, path), function (error, stats) {
    if (error) return callback(map(error))

    var metadata = { isFile           : stats.isFile()
                   , isDirectory      : stats.isDirectory()
                   , size             : stats.size
                   , modificationTime : stats.mtime
                   }
    callback(null, metadata)
  })
}

LocalFileSystem.prototype.move = function (source, destination, callback) {
  fs.rename(realize(this, source), realize(this, destination),
      function (error) {
        callback(error ? map(error) : null)
      })
}

LocalFileSystem.prototype.copy = function (source, destination, recursive,
    callback) {
  var self = this
  fs.stat(realize(self, source), function (error, stats) {
    if (error) return callback(map(error))

    if (stats.isDirectory()) {
      self.copyDirectory(source, destination, recursive, callback)
    } else if (stats.isFile()) {
      self.copyFile(source, destination, callback)
    } else {
      // e.g., devices, symbolic links, FIFOs, sockets
      callback(new util.CustomError("SecurityError"))
    }
  })
}

LocalFileSystem.prototype.remove = function (path, recursive, callback) {
  var self = this
  fs.stat(realize(self, path), function (error, stats) {
    if (error) return callback(map(error))

    if (stats.isDirectory()) {
      self.removeDirectory(path, recursive, callback)
    } else if (stats.isFile()) {
      self.removeFile(path, callback)
    } else {
      // e.g., devices, symbolic links, FIFOs, sockets
      callback(new util.CustomError("SecurityError"))
    }
  })
}

LocalFileSystem.prototype.createFile = function (path, exclusive, callback) {
  var self = this

  var flags = exclusive ? "wx" : "a"
  fs.open(realize(self, path), flags, function (error, fd) {
    if (!error) {
      return fs.close(fd, function (error) {
        callback(error ? map(error) : null)
      })
    }

    fs.stat(realize(self, path), function (error2, stats) {
      if (error2) return callback(map(error))

      if (exclusive) {
        return callback(new util.CustomError("PathExistsError"))
      }

      if (!stats.isFile()) {
        return callback(new util.CustomError("TypeMismatchError"))
      }

      callback(null)
    })
  })
}

LocalFileSystem.prototype.fileExists = function (path, callback) {
  fs.stat(realize(this, path), function (error, stats) {
    if (error) return callback(map(error))

    if (!stats.isFile()) {
      return callback(new util.CustomError("TypeMismatchError"))
    }

    callback(null)
  })
}

inherits(ReadStreamWrapper, EventEmitter)
function ReadStreamWrapper(stream) {
  ReadStreamWrapper.super.call(this)

  var self = this
  stream.addListener("open", function () {
    self.emit("open")
  })
  stream.addListener("data", function (data) {
    self.emit("data", data)
  })
  stream.addListener("end", function () {
    self.emit("end")
  })
  stream.addListener("close", function () {
    self.emit("close")
  })
  stream.addListener("error", function (error) {
    self.emit("error", map(error))
  })

  this.stream = stream
}

ReadStreamWrapper.prototype.pause = function () {
  this.stream.pause()
}

ReadStreamWrapper.prototype.resume = function () {
  this.stream.resume()
}

ReadStreamWrapper.prototype.destroy = function (callback) {
  this.stream.destroy(function (error) {
    callback(error ? map(error) : null)
  })
}

LocalFileSystem.prototype.createReadStream = function (path, options,
    callback) {
  var stream
  try {
    stream = fs.createReadStream(realize(this, path), options)
  } catch (error) {
    util.async(callback)(map(error))
  }

  var wrapper = new ReadStreamWrapper(stream)
  util.async(callback)(null, wrapper)
}

inherits(WriteStreamWrapper, EventEmitter)
function WriteStreamWrapper(stream) {
  WriteStreamWrapper.super.call(this)

  var self = this
  stream.addListener("open", function () {
    self.emit("open")
  })
  stream.addListener("drain", function () {
    self.emit("drain")
  })
  stream.addListener("close", function () {
    self.emit("close")
  })
  stream.addListener("error", function (error) {
    self.emit("error", map(error))
  })

  this.stream = stream
}

WriteStreamWrapper.prototype.write = function (data, callback) {
  this.stream.write(data, function (error, bytesWritten) {
    if (error) return callback(map(error))
    callback(null, bytesWritten)
  })
}

WriteStreamWrapper.prototype.end = function (callback) {
  this.stream.end(function (error) {
    callback(error ? map(error) : null)
  })
}

WriteStreamWrapper.prototype.destroy = function (callback) {
  this.stream.destroy(function (error) {
    callback(error ? map(error) : null)
  })
}

LocalFileSystem.prototype.createWriteStream = function (path, options,
    callback) {
  var stream
  try {
    stream = fs.createWriteStream(realize(this, path), options)
  } catch (error) {
    util.async(callback)(map(error))
  }

  var wrapper = new WriteStreamWrapper(stream)
  util.async(callback)(null, wrapper)
}

LocalFileSystem.prototype.truncate = function (path, size, callback) {
  fs.open(realize(this, path), "r+", function (error, fd) {
    if (error) return callback(map(error))

    fs.truncate(fd, size, function (error) {
      fs.close(fd, function (error2) {
        callback(error || error2 ? map(error || error2) : null)
      })
    })
  })
}

LocalFileSystem.prototype.copyFile = function (source, destination, callback) {
  var sourceStream = fs.createReadStream(realize(this, source))
  var destinationStream = fs.createWriteStream(realize(this, destination))

  function onend() {
    destinationStream.end(function (error) {
      if (!error) callback(null)
    })
  }

  sourceStream.addListener("end", onend)

  function onerror(error) {
    cleanup(); destroy()
    callback(map(error))
  }

  sourceStream.addListener("error", onerror)
  destinationStream.addListener("error", onerror)

  function cleanup() {
    // CHALLENGE Is removing the end event listener necessary?
    sourceStream.removeListener("end", onend)

    sourceStream.removeListener("error", onerror)
    destinationStream.removeListener("error", onerror)
  }

  function destroy() {
    sourceStream.destroy()
    destinationStream.destroy()
  }

  sourceStream.pipe(destinationStream, { end : false })
}

LocalFileSystem.prototype.removeFile = function (path, callback) {
  fs.unlink(realize(this, path), function (error) {
    callback(error ? map(error) : null)
  })
}

// webinos <3 mkdirp
LocalFileSystem.prototype.createDirectory = function (path, exclusive,
    recursive, callback) {
  var self = this
  fs.mkdir(realize(self, path), function (error) {
    if (!error) return callback(null)

    switch (error.code) {
      case "ENOENT":
        if (recursive) {
          var fullPath = virtualPathModule.dirname(path)
          self.createDirectory(fullPath, false, true, function (error) {
            if (error) return callback(error)
            self.createDirectory(path, exclusive, false, callback)
          })
        } else callback(map(error))
        break
      default:
        fs.stat(realize(self, path), function (error2, stats) {
          if (error2) return callback(map(error))

          if (exclusive) {
            return callback(new util.CustomError("PathExistsError"))
          }

          if (!stats.isDirectory()) {
            return callback(new util.CustomError("TypeMismatchError"))
          }

          callback(null)
        })
    }
  })
}

LocalFileSystem.prototype.directoryExists = function (path, callback) {
  fs.stat(realize(this, path), function (error, stats) {
    if (error) return callback(map(error))

    if (!stats.isDirectory()) {
      return callback(new util.CustomError("TypeMismatchError"))
    }

    callback(null)
  })
}

LocalFileSystem.prototype.readDirectory = function (path, callback) {
  fs.readdir(realize(this, path), function (error, files) {
    if (error) return callback(map(error))
    callback(null, files)
  })
}

LocalFileSystem.prototype.copyDirectory = function (source, destination,
    recursive, callback, isRetry) {
  var self = this

  function children() {
    fs.readdir(realize(self, source), function (error, files) {
      if (error) return callback(map(error))

      ;(function iterate() {
        var file = files.shift()
        if (!file) return callback(null)

        var sourcePath = virtualPathModule.join(source, file)
          , destinationPath = virtualPathModule.join(destination, file)
        self.copy(sourcePath, destinationPath, true, function (error) {
          if (error) return callback(error)
          iterate()
        })
      })()
    })
  }

  self.createDirectory(destination, true, false, function (error) {
    if (!error) return recursive ? children() : callback(null)

    if (error.name === "PathExistsError" && !isRetry) {
      self.removeDirectory(destination, false, function (error2) {
        if (error2) return callback(error)
        self.copyDirectory(source, destination, recursive, callback, true)
      })
    } else callback(error)
  })
}

LocalFileSystem.prototype.removeDirectory = function (path, recursive,
    callback) {
  var self = this

  function root() {
    fs.rmdir(realize(self, path), function (error) {
      callback(error ? map(error) : null)
    })
  }

  if (recursive) {
    fs.readdir(realize(self, path), function (error, files) {
      if (error) return callback(map(error))

      ;(function iterate() {
        var file = files.shift()
        if (!file) return root()

        var fullPath = virtualPathModule.join(path, file)
        self.remove(fullPath, true, function (error) {
          if (error) return callback(error)
          iterate()
        })
      })()
    })
  } else root()
}
