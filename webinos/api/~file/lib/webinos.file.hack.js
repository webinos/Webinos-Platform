var nConnect = require("connect")
  , nHttp = require("http")
  , nPath = require("path")

var webinos = require("webinos")(__dirname)
  , commonPaths = webinos.global.require(webinos.global.manager.context_manager.location, "lib/commonPaths.js")

var storage = commonPaths.getUserFolder()

if (storage === null) {
  console.log("webinos.file.hack.js: Error getting user folder (falling back to CWD).")

  storage = process.cwd()
}

var realPath = nPath.join(storage, "file", "default")

nPath.mkdirSyncRecursive(realPath)

var app = nConnect().use(nConnect.static(realPath))
  , port = 6789

nHttp
  .createServer(app)
  .on("error", function (error) {
    if (error.code === "EADDRINUSE") {
      port++
    }

    this.listen(port)
  }).listen(port)

module.exports = function (service, params) {
  service.getAddress = function (paramz, successCallback, errorCallback) {
    successCallback(params.pzpHost + ":" + port)
  }
}
