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

module.exports = Service

var api = require("../api.js")
var inherits = require("inherits")
var util = require("../util.js")

var pathModule = require("path")
var LocalFileSystem = require("../engine/local-file-system.js")

var dependencies = require("find-dependencies")(__dirname)
var rpcModule = dependencies.global.require(dependencies.global.rpc.location,
    "lib/rpc.js")

inherits(Service, rpcModule.RPCWebinosService)
function Service(rpc, params) {
    console.log("***************************" + params.getPath());
  LocalFileSystem.init(pathModule.join(params.getPath(), "userData", "file"))
    
  Service.super.call(this,
      { api         : "http://webinos.org/api/file"
      , displayName : "File API"
      , description : "File API (incl. Writer, and Directories and System)"
      })

  this.rpc = rpc
}

Service.prototype.requestFileSystem = function (params, successCallback,
    errorCallback) {
  api.requestFileSystem(params.type, params.size,
      util.combine(successCallback, errorCallback))
}

Service.prototype.resolveLocalFileSystemURL = function (params, successCallback,
    errorCallback) {
  api.resolveLocalFileSystemURL(params.url,
      util.combine(successCallback, errorCallback))
}

Service.prototype.getMetadata = function (params, successCallback,
    errorCallback) {
  api.getMetadata(params.entry, util.combine(successCallback, errorCallback))
}

Service.prototype.moveTo = function (params, successCallback, errorCallback) {
  api.moveTo(params.source, params.parent, params.newName,
      util.combine(successCallback, errorCallback))
}

Service.prototype.copyTo = function (params, successCallback, errorCallback) {
  api.copyTo(params.source, params.parent, params.newName,
      util.combine(successCallback, errorCallback))
}

Service.prototype.remove = function (params, successCallback, errorCallback) {
  api.remove(params.entry, util.combine(successCallback, errorCallback))
}

Service.prototype.getParent = function (params, successCallback,
    errorCallback) {
  api.getParent(params.entry, util.combine(successCallback, errorCallback))
}

Service.prototype.getFile = function (params, successCallback, errorCallback) {
  api.getFile(params.entry, params.path, params.options,
      util.combine(successCallback, errorCallback))
}

// Service.prototype.createWriter = function (params, successCallback,
//    errorCallback) {}
// Service.prototype.file = function (params, successCallback, errorCallback) {}

Service.prototype.read = function (params, successCallback, errorCallback,
    remote) {
  var self = this
  api.createReadStream(params.entry, params.options, function (error, stream) {
    if (error) {
      var message = self.rpc.createRPC(remote, "error", { error : error })
      self.rpc.executeRPC(message)
      return
    }

    stream.addListener("open", function () {
      var message = self.rpc.createRPC(remote, "open", null)
      self.rpc.executeRPC(message)
    })
    stream.addListener("data", function (data) {
      if (params.options.autopause) stream.pause()

      var message = self.rpc.createRPC(remote, "data",
          { data : data.toString("hex") })
      self.rpc.executeRPC(message)
    })
    stream.addListener("end", function () {
      var message = self.rpc.createRPC(remote, "end", null)
      self.rpc.executeRPC(message)
    })
    stream.addListener("close", function () {
      try {
        var message = self.rpc.createRPC(remote, "close", null)
        self.rpc.executeRPC(message)
      } finally {
        self.rpc.unregisterCallbackObject(port)
      }
    })
    stream.addListener("error", function (error) {
      try {
        var message = self.rpc.createRPC(remote, "error", { error : error })
        self.rpc.executeRPC(message)
      } finally {
        self.rpc.unregisterCallbackObject(port)
      }
    })

    var port = self.rpc.createRPC(remote, "ref", null)
    port.pause = function () {
      stream.pause()
    }
    port.resume = function () {
      stream.resume()
    }
    port.destroy = function (params, successCallback, errorCallback) {
      stream.destroy(util.combine(successCallback, errorCallback))
    }

    self.rpc.registerCallbackObject(port)
    self.rpc.executeRPC(port)
  })
}

Service.prototype.write = function (params, successCallback, errorCallback,
    remote) {
  var self = this
  api.createWriteStream(params.entry, params.options, function (error, stream) {
    if (error) {
      var message = self.rpc.createRPC(remote, "error", { error : error })
      self.rpc.executeRPC(message)
      return
    }

    stream.addListener("open", function () {
      var message = self.rpc.createRPC(remote, "open", null)
      self.rpc.executeRPC(message)
    })
    stream.addListener("drain", function () {
      var message = self.rpc.createRPC(remote, "drain", null)
      self.rpc.executeRPC(message)
    })
    stream.addListener("close", function () {
      try {
        var message = self.rpc.createRPC(remote, "close", null)
        self.rpc.executeRPC(message)
      } finally {
        self.rpc.unregisterCallbackObject(port)
      }
    })
    stream.addListener("error", function (error) {
      try {
        var message = self.rpc.createRPC(remote, "error", { error : error })
        self.rpc.executeRPC(message)
      } finally {
        self.rpc.unregisterCallbackObject(port)
      }
    })

    var port = self.rpc.createRPC(remote, "ref", null)
    port.write = function (params, successCallback, errorCallback) {
      var data
      try {
        data = new Buffer(params.data, "hex")
      } catch (error) {
        try {
          var error = new util.CustomError("InvalidStateError")
          errorCallback(error)

          var message = self.rpc.createRPC(remote, "error", { error : error })
          self.rpc.executeRPC(message)
        } finally {
          stream.removeAllListeners()
          stream.destroy()

          self.rpc.unregisterCallbackObject(port)
        }
        return
      }

      stream.write(data, util.combine(successCallback, errorCallback))
    }
    port.end = function (params, successCallback, errorCallback) {
      stream.end(util.combine(successCallback, errorCallback))
    }
    port.destroy = function (params, successCallback, errorCallback) {
      stream.destroy(util.combine(successCallback, errorCallback))
    }

    self.rpc.registerCallbackObject(port)
    self.rpc.executeRPC(port)
  })
}

Service.prototype.truncate = function (params, successCallback, errorCallback) {
  api.truncate(params.entry, params.size,
      util.combine(successCallback, errorCallback))
}

Service.prototype.getDirectory = function (params, successCallback,
    errorCallback) {
  api.getDirectory(params.entry, params.path, params.options,
      util.combine(successCallback, errorCallback))
}

Service.prototype.removeRecursively = function (params, successCallback,
    errorCallback) {
  api.removeRecursively(params.entry,
      util.combine(successCallback, errorCallback))
}

Service.prototype.readEntries = function (params, successCallback,
    errorCallback) {
  api.readEntries(params.entry, util.combine(successCallback, errorCallback))
}
