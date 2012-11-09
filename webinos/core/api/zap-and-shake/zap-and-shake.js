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

var connect = require("connect")
var http = require("http")
var inherits = require("inherits")
var pathModule = require("path")

var dependencies = require("find-dependencies")(__dirname)
var file = dependencies.global.require(dependencies.global.api.file.location,
    "file.js")

file._Service = file.Service
file.Service = Service

inherits(Service, file._Service)
function Service(rpc, params) {
  Service.super.call(this, rpc, params)

  this.params = params
}

Service.prototype.getAddress = function (params, successCallback,
    errorCallback) {
  successCallback(this.params.pzpHost + ":" + port)
}

var pzp = dependencies.global.require(dependencies.global.pzp.location,
    "lib/pzp.js")
var basePath = pathModule.join(pzp.session.getWebinosPath(), "file", "default")

var port = 6789
var server = http.createServer(connect().use(connect.static(basePath)))
server.on("error", function (error) {
  if (error.code === "EADDRINUSE") {
    port++
  }

  this.listen(port)
})
server.listen(port)

//Expose an empty service
exports.Service = null;
