#!/usr/bin/env node
/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*******************************************************************************/
var pzp   = require("./webinos/pzp/lib/pzp");
var session = require("./webinos/pzp/lib/session");
var debug = session.common.debug;
var log   = new debug("pzp_start");

var fs = require("fs"),
    path = require("path");

var options = {};
var pzpInstance;

function help() {
  console.log("Usage: webinos_pzp [options]");
  console.log("Options:");
  console.log("--pzh-host=[ipaddress]   host of the pzh (default localhost)");
  console.log("--pzh-name=[name]        name of the pzh (default \"\")");
  console.log("--pzp-name=[name]        name of the pzp (default WebinosPzp)");
  console.log("--pzp-host=[name]        host of the pzp (default localhost)");
  console.log("--auth-code=[code]       context debug flag (default DEBUG)");
  console.log("--preference=[option]    preference option (default hub, other option peer)");
  console.log("--widgetServer           start widget server");
  process.exit();
}

process.argv.forEach(function (arg) {
  var parts;
  if (arg.indexOf("--") > -1) {
    parts = arg.split("=");
    if (parts.length > 1) {
      switch (parts[0]) {
      case "--pzh-host":
        options.pzhHost = parts[1];
        break;
      case "--pzh-name":
        options.pzhName = parts[1];
        break;
      case "--pzp-host":
        options.pzpHost = parts[1];
        break;
      case "--pzp-name":
        options.pzpName = parts[1];
        break;
      case "--preference":
        options.preference = parts[1];
        break;
      case "--auth-code":
        options.code = parts[1]+"="; // added as last letter in qrcode is = but above "split" removes this info
        break;
      default:
        console.log("unknown option: " + parts[0]);
        break;
      }
    }
    else {
      switch (parts[0]) {
        case "--help":
          help();
          break;
        case "--widgetServer":
          options.startWidgetServer = true;
          break;
      }
    }
  }
});

var fileParams = {},
  pzpModules = [
  {name: "get42", params: {num: "21"}},
  {name: "zap-and-shake", params: {}},
  {name: "file", params: fileParams},
  {name: "geolocation", params: {connector : "geoip"}},
  {name: "applauncher", params: {}},
  {name: "sensors", params: {}},
  {name: "payment", params: {}},
  {name: "tv", params: {}},
  {name: "oauth", params: {}},
  {name: "deviceorientation", params: {connector : "simulator"}},
  {name: "vehicle", params: {connector : "simulator"}},
  {name: "context", params: {}},
  {name: "authentication", params: {}},
  {name: "contacts", params: {}},
  {name: "devicestatus", params: {}},
  {name: "discovery", params: {}}
];

fs.readFile(path.join(__dirname, "config-pzp.json"), function(err, data) {
    var config;

    if (err) {
      config = {};
    }
    else {
      config = JSON.parse(data);
    }

    if (!config.pzhHost) {
      config.pzhHost = "localhost";
    }
    if (!config.pzhName) {
      config.pzhName = "";
    }
    if (!config.pzpHost) {
      config.pzpHost="localhost";
    }
    if (!config.pzpName) {
      config.pzpName = "";
    }
    if (!config.code) {
      config.code = "DEBUG";
    }
    if (!config.preference) {
      config.prefence = "hub";
    }
    if (options.pzhHost) {
      config.pzhHost = options.pzhHost;
    }
    if (options.pzhName) {
  config.pzhName = options.pzhName;
    }
    if (options.pzpHost) {
      config.pzpHost = options.pzpHost;
    }
    if (options.pzpName) {
      config.pzpName = options.pzpName;
    }
    if (options.code) {
      config.code = options.code;
    }
    if (options.preference) {
      config.preference = options.preference;
    }
    fileParams.pzpHost = config.pzpHost;
    initializePzp(config, pzpModules);
});

function initializeWidgetServer() {
  // Widget manager server
  var wrt = require("./webinos/common/manager/widget_manager/lib/ui/widgetServer");
  if (typeof wrt !== "undefined") {
    // Attempt to start the widget server.
    wrt.start(function (msg, wrtPort) {
      if (msg === "startedWRT") {
        // Write the websocket and widget server ports to file so the renderer can pick them up.
        var wrtConfig = {};
        wrtConfig.runtimeWebServerPort = wrtPort;
        wrtConfig.pzpWebSocketPort = session.configuration.port.pzp_webSocket;
        fs.writeFile((session.common.webinosConfigPath() + '/wrt/webinos_runtime.json'), JSON.stringify(wrtConfig, null, ' '), function (err) {
          if (err) {
            log.error('error saving runtime configuration file: ' + err);
          } else {
            log.info('saved configuration runtime file');
          }
        });
      } else {
            log.error('error starting wrt server: ' + msg);
      }
    });
  }
}

function initializePzp(config, pzpModules) {
  pzpInstance = new pzp.session();
  pzpInstance.initializePzp(config, pzpModules, function(result) {
    log.info("initializePzp result is: " + result);
    if (result === "startedPZP"){
      log.info("sucessfully started");
      if (options.startWidgetServer)
        initializeWidgetServer();
    }
  });
}

//Added in order to be able to get the rpc handler from the current pzp
getPzp = function() {
  if (typeof pzpInstance !== "undefined") {
    return pzpInstance;
  } else {
    return null;
  }
}

getPzpId = function() {
  if (typeof pzpInstance !== "undefined") {
    return pzpInstance.sessionId;
  }
}

getPzhId = function() {
  if (typeof pzpInstance !== "undefined") {
    return pzpInstance.config.pzhId;
  }
}
