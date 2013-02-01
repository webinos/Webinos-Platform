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

module.exports = DropboxFileSystem

var dbox = require("dbox")
var inherits = require("util").inherits // require("inherits")
var util = require("../util.js")
var vpath = require("../virtual-path.js")

var EventEmitter = require("events").EventEmitter

var statusMap =
  { "/files.get" :
    { // The file wasn't found at the specified path, or wasn't found at the
      // specified rev.
      404 : "UnknownError"
    }
  , "/files_put" :
    { // Missing Content-Length header (this endpoint doesn't support HTTP
      // chunked transfer encoding).
      411 : "UnknownError"
    }
  , "/files.post" :
    { // The file extension is on Dropbox's ignore list (e.g. thumbs.db or
      // .ds_store).
      400 : "UnknownError"
      // The parent_rev of the file wasn't found.
    , 404 : "UnknownError"
      // Chunked encoding was attempted for this upload, but is not supported
      // for this method. (For chunked encoding, use /chunked_upload instead.)
    , 411 : "UnknownError"
    }
  , "/metadata" :
    { // The folder contents have not changed (relies on hash parameter).
      304 : "UnknownError"
      // There are too many file entries to return.
    , 406 : "UnknownError"
    }
  , "/revisions" :
    { // Too many file entries to return.
      406 : "UnknownError"
    }
  , "/restore" :
    { // Unable to find the revision at that path.
      406 : "UnknownError"
    }
  , "/thumbnails" :
    { // The file path wasn't found or the file extension doesn't allow
      // conversion to a thumbnail.
      404 : "UnknownError"
      // The image is invalid and cannot be converted to a thumbnail.
    , 415 : "UnknownError"
    }
  , "/chunked_upload" :
    { // The upload_id does not exist or has expired.
      404 : "UnknownError"
      // The offset parameter does not match up with what the server expects.
      // The body of the error response will be JSON similar to the above,
      // indicating the correct offset to upload.
    , 400 : "UnknownError"
    }
  , "/commit_chunked_upload" :
    { // Returned if the request does not contain an upload_id or if there is no
      // chunked upload matching the given upload_id.
      400 : "UnknownError"
    }
  , "/fileops/copy" :
    { // An invalid copy operation was attempted (e.g. there is already a file
      // at the given destination, or trying to copy a shared folder).
      403 : "UnknownError"
      // The source file wasn't found at the specified path.
    , 404 : "UnknownError"
      // Too many files would be involved in the operation for it to complete
      // successfully. The limit is currently 10,000 files and folders.
    , 406 : "UnknownError"
    }
  , "/fileops/create_folder" :
    { // There is already a folder at the given destination.
      403 : "UnknownError"
    }
  , "/fileops/delete" :
    { // No file wasn't found at the specified path.
      404 : "UnknownError"
      // Too many files would be involved in the operation for it to complete
      // successfully. The limit is currently 10,000 files and folders.
    , 406 : "UnknownError"
    }
  , "/fileops/move" :
    { // An invalid move operation was attempted (e.g. there is already a file
      // at the given destination, or moving a shared folder into a shared
      // folder).
      403 : "UnknownError"
      // The source file wasn't found at the specified path.
    , 404 : "UnknownError"
      // Too many files would be involved in the operation for it to complete
      // successfully. The limit is currently 10,000 files and folders.
    , 406 : "UnknownError"
    }
  , "default" :
    { // Bad input parameter. Error message should indicate which one and why.
      400 : "InvalidModificationError"
      // Bad or expired token. This can happen if the user or Dropbox revoked or
      // expired an access token. To fix, you should re-authenticate the user.
    , 401 : "SecurityError"
      // Bad OAuth request (wrong consumer key, bad nonce, expired
      // timestamp...). Unfortunately, re-authenticating the user won't help
      // here.
    , 403 : "SecurityError"
      // File or folder not found at the specified path.
    , 404 : "NotFoundError"
      // Request method not expected (generally should be GET or POST).
    , 405 : "InvalidModificationError"
      // Your app is making too many requests and is being rate limited. 503s
      // can trigger on a per-app or per-user basis.
    , 503 : "SecurityError"
      // User is over Dropbox storage quota.
    , 507 : "QuotaExceededError"
    // 5xx -- Server error.
    }
  }

function map(request, status, reply) {
  var name
  if (statusMap[request] && statusMap[request][status]) {
    name = statusMap[request][status]
  } else if (statusMap["default"][status]) {
    name = statusMap["default"][status]
  } else {
    name = "UnknownError"
  }
  return new util.CustomError(name, reply.error)
}

var app = dbox.app(
  { app_key : "38j04m9q86j2zva"
  , app_secret : "pzl7f411nu6dy4p"
  , root : "sandbox"
  })

function DropboxFileSystem(name, path) {
  this.name = name
  this.path = path

  // Singleton?
  this.client = app.client(DropboxFileSystem.accessToken)
}

DropboxFileSystem.accessToken = null

DropboxFileSystem.init = function (accessToken) {
  DropboxFileSystem.accessToken = accessToken
}

DropboxFileSystem.prototype.type = "dropbox"

DropboxFileSystem.prototype.realize = function(path) {
  return vpath.join(this.path, path)
}

DropboxFileSystem.prototype.readMetadata = function (path, callback) {
  this.client.metadata(this.realize(path), { list : false }, function (status, reply) {
    if (status === 200) {
      if (reply.is_deleted) {
        callback(new util.CustomError("NotFoundError"))
      } else {
        var metadata =
          { path             : path
          , isFile           : !reply.is_dir
          , isDirectory      : reply.is_dir
          , size             : reply.bytes
          , modificationTime : reply.modified
          }
        callback(null, metadata)
      }
    } else {
      callback(map("/metadata", status, reply))
    }
  })
}

DropboxFileSystem.prototype.move = function (source, destination, callback) {
  this.client.mv(this.realize(source), this.realize(destination), null, function (status, reply) {
    callback(status === 200 ? null : map("/fileops/move", status, reply))
  })
}

// Always recursive.
DropboxFileSystem.prototype.copy = function (source, destination, recursive, callback) {
  this.client.cp(this.realize(source), this.realize(destination), null, function (status, reply) {
    callback(status === 200 ? null : map("/fileops/copy", status, reply))
  })
}

DropboxFileSystem.prototype.remove = function (path, recursive, callback) {
  var self = this
  self.client.metadata(self.realize(path), { list : true }, function (status1, reply1) {
    if (reply1.is_dir && reply1.contents.length > 0 && !recursive) {
      callback(new util.CustomError("InvalidModificationError"))
    } else if (!reply1.is_deleted) {
      self.client.rm(self.realize(path), null, function (status2, reply2) {
        callback(status2 === 200 ? null : map("/fileops/delete", status2, reply2))
      })
    } else {
      callback(null)
    }
  })
}

DropboxFileSystem.prototype.createFile = function (path, exclusive, callback, isRetry) {
  var self = this
  self.client.metadata(self.realize(path), { list : false }, function (status1, reply1) {
    switch (status1) {
      case 200:
        if (!reply1.is_deleted) {
          if (exclusive) {
            callback(new util.CustomError("PathExistsError"))
          } else if (reply1.is_dir) {
            callback(new util.CustomError("TypeMismatchError"))
          } else {
            callback(null)
          }
          break
        } // else: fall-through
      case 404:
        if (!isRetry) {
          self.client.put(self.realize(path), "", null, function (status2, reply2) {
            if (status2 === 200) {
              if (reply2.path === self.realize(path)) {
                callback(null)
              } else {
                self.client.rm(reply2.path, null, function (status3, reply3) {
                  if (status3 === 200) {
                    self.createFile(path, exclusive, callback, true)
                  } else {
                    callback(map("/fileops/delete", status3, reply3))
                  }
                })
              }
            } else {
              callback(map("/files_put", status2, reply2))
            }
          })
          break
        } // else: fall-through
      default:
        callback(map("/metadata", status1, reply1))
    }
  })
}

DropboxFileSystem.prototype.fileExists = function (path, callback) {
  this.client.metadata(this.realize(path), { list : false }, function (status, reply) {
    if (status === 200) {
      if (reply.is_deleted) {
        callback(new util.CustomError("NotFoundError"))
      } else if (reply.is_dir) {
        callback(new util.CustomError("TypeMismatchError"))
      } else {
        callback(null)
      }
    } else {
      callback(map("/metadata", status, reply))
    }
  })
}

DropboxFileSystem.prototype.createFileLink = function (path, callback) {
  this.client.media(this.realize(path), null, function (status, reply) {
    if (status === 200) {
      callback(null, reply.url)
    } else {
      callback(map("/media", status, reply))
    }
  })
}

inherits(ReadStreamWrapper, EventEmitter)
function ReadStreamWrapper(stream) {
  ReadStreamWrapper.super_.call(this)

  var self = this
  stream.addListener("response", function (response) {
    var status = response.statusCode
      , metadata
    if (response.headers["x-dropbox-metadata"] !== undefined) {
      metadata = parseJSON(response.headers["x-dropbox-metadata"])
    } else {
      metadata = {}
    }

    if (status === 200) {
      self.emit("open")
    } else {
      self.stream.removeAllListeners()
      self.stream.destroy(function () {
        self.emit("error", map("/files.get", status, metadata))
      })
    }
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
    self.emit("error", new util.CustomError("UnknownError"))
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
    callback(error ? new util.CustomError("UnknownError") : null)
  })
}

DropboxFileSystem.prototype.createReadStream = function (path, options, callback) {
  var stream
  try {
    stream = this.client.stream(this.realize(path))
  } catch (error) {
    util.async(callback)(new util.CustomError("UnknownError"))
  }

  var wrapper = new ReadStreamWrapper(stream)
  util.async(callback)(null, wrapper)
}

inherits(WriteStream, EventEmitter)
function WriteStream(client, data, metadata, options) {
  WriteStream.super_.call(this)

  this.client = client
  this.data = data || new Buffer(0)
  this.metadata = metadata

  this.position = options.start || 0

  util.async(this.emit.bind(this))("open")
}

WriteStream.prototype.write = function (data, callback) {
  this.data = Buffer.concat(
    [ this.data.slice(0, Math.max(0, this.position))
    , data
    , this.data.slice(Math.min(this.data.length, this.position += data.length))
    ])
  util.async(callback)(null, data.length)
  util.async(this.emit.bind(this))("drain")
}

WriteStream.prototype.end = function (callback) {
  var self = this
  self.client.put(self.metadata.path, self.data, { parent_rev : self.metadata.rev }, function (status1, reply1) {
    if (status1 === 200) {
      if (reply1.path === self.metadata.path) {
        callback(null)
        self.emit("end")
      } else {
        self.client.rm(reply1.path, null, function (status2, reply2) {
          var error = new util.CustomError("UnknownError")
          callback(error)
          self.emit("error", error)
        })
      }
    } else {
      var error = map("/files.put", status1, reply1)
      callback(error)
      self.emit("error", error)
    }
  })
}

WriteStream.prototype.destroy = function (callback) {
  util.async(callback)(null)
  util.async(this.emit.bind(this))("close")
}

DropboxFileSystem.prototype.createWriteStream = function (path, options, callback) {
  var self = this
  self.client.get(self.realize(path), function (status, data, metadata) {
    if (status === 200) {
      callback(null, new WriteStream(self.client, data, metadata, options))
    } else {
      callback(map("/files.get", status, metadata))
    }
  })
}

DropboxFileSystem.prototype.truncate = function (path, size, callback) {
  var self = this
  self.client.get(self.realize(path), function (status1, data1, metadata1) {
    if (status1 === 200) {
      self.client.put(metadata1.path, data1 ? data1.slice(0, Math.min(data1.length, size)) : null, { parent_rev : metadata1.rev }, function (status2, reply2) {
        if (status2 === 200) {
          if (reply2.path === metadata1.path) {
            callback(null)
          } else {
            self.client.rm(reply2.path, null, function (status3, reply3) {
              callback(new util.CustomError("UnknownError"))
            })
          }
        } else {
          callback(map("/files.put", status2, reply2))
        }
      })
    } else {
      callback(map("/files.get", status1, metadata1))
    }
  })
}

DropboxFileSystem.prototype.createDirectory = function (path, exclusive, recursive, callback) {
  var self = this
  self.client.mkdir(self.realize(path), null, function (status, reply) {
    switch (status) {
      case 200:
        callback(null)
        break
      case 403:
        if (exclusive) {
          callback(new util.CustomError("PathExistsError"))
        } /* else if (!reply.is_dir) {
          callback(new util.CustomError("TypeMismatchError"))
        } */ else {
          callback(null)
        }
        break
      case 404:
        if (recursive) {
          var fullPath = vpath.dirname(path)
          self.createDirectory(fullPath, false, true, function (error) {
            if (error) return callback(error)
            self.createDirectory(path, exclusive, false, callback)
          })
          break
        } // else: fall-through
      default:
        callback(map("/fileops/create_folder", status, reply))
    }
  })
}

DropboxFileSystem.prototype.directoryExists = function (path, callback) {
  this.client.metadata(this.realize(path), { list : false }, function (status, reply) {
    if (status === 200) {
      if (reply.is_deleted) {
        callback(new util.CustomError("NotFoundError"))
      } else if (!reply.is_dir) {
        callback(new util.CustomError("TypeMismatchError"))
      } else {
        callback(null)
      }
    } else {
      callback(map("/metadata", status, reply))
    }
  })
}

DropboxFileSystem.prototype.readDirectory = function (path, callback) {
  this.client.metadata(this.realize(path), { list : true }, function (status, reply) {
    if (status === 200) {
      if (reply.is_deleted) {
        callback(new util.CustomError("NotFoundError"))
      } else if (!reply.is_dir) {
        callback(new util.CustomError("TypeMismatchError"))
      } else {
        callback(null, reply.contents.map(function (content) {
          var metadata =
            { path             : content.path
            , isFile           : !content.is_dir
            , isDirectory      : content.is_dir
            , size             : content.bytes
            , modificationTime : content.modified
            }
          return metadata
        }))
      }
    } else {
      callback(map("/metadata", status, reply))
    }
  })
}
