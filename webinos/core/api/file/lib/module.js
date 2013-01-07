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

var Service = require("./service.js")
var VirtualFileSystem = require("./fs/virtual.js")

function Module(rpc, params) {
  this.rpc = rpc
  this.params = params
}

var list = []

Module.addFileSystem = function (fs) {
  list.push(fs)
}

Module.prototype.init = function (register, unregister) {
  var self = this

  list.forEach(function (fs) {
    var params = Object.create(self.params)
    params.vfs = new VirtualFileSystem(fs)

    register(new Service(self.rpc, params))
  })
}
