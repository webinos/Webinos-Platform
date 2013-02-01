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

module.exports = Module

var path = require("path")

var DropboxFileSystem = require("./fs/dropbox.js")
var LocalFileSystem = require("./fs/local.js")
var Service = require("./service.js")
var VirtualFileSystem = require("./fs/virtual.js")

var dependencies = require("find-dependencies")(__dirname)
var internal = dependencies.global.require(dependencies.global.util.location, "lib/webinosPath.js").webinosPath()

function Module(rpc, params) {
  this.rpc = rpc
  this.params = params
}

Module.prototype.init = function (register, unregister) {
  var self = this

  if (self.params.local) {
    LocalFileSystem.init(self.params.local.server.port, self.params.local.server.hostname)
    self.params.local.shares.forEach(function (share) {
      register(new Service(self.rpc, new VirtualFileSystem(new LocalFileSystem(share.name, share.path))))
    })
  }

  if (self.params.dropbox) {
    DropboxFileSystem.init(self.params.dropbox.access_token)
    self.params.dropbox.shares.forEach(function (share) {
      register(new Service(self.rpc, new VirtualFileSystem(new DropboxFileSystem(share.name, share.path))))
    })
  }
}
