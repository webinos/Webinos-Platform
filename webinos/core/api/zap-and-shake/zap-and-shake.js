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
var Service = dependencies.global.require(dependencies.global.api.file.location, "lib/service.js")

Service.prototype.getAddress = function (params, successCallback, errorCallback) {
  successCallback(this.params.pzpHost + ":" + port)
}

var root = dependencies.global.require(dependencies.global.util.location, "lib/webinosPath.js").webinosPath()

var port = 6789
var server = http.createServer(connect().use(connect.static(pathModule.join(root, "file"))))
server.on("error", function (error) {
  if (error.code === "EADDRINUSE") {
    port++
  }

  this.listen(port)
})
server.listen(port)

exports.Service = null
