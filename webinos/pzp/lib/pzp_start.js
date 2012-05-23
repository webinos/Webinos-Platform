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


var pzp = require("./pzp").session,//require("../webinos/pzp/lib/pzp_sessionHandling.js"),
  websocket = require("./pzp").websocket,//require("../webinos/pzp/lib/pzp_websocket.js"),
  debug = require("./session_common").debug,
  fs = require("fs"),
  path = require("path");
  
var log = new debug("pzp_start");

var options = {};
var pzpInstance;
function help() {
  console.log("Usage: webinos_pzp [options]");
  console.log("Options:");
  console.log("--pzh-host=[host]        host of the pzh (default localhost/OpenID)");
  console.log("--pzp-name=[name]        name of the pzp (default WebinosPzp)");
  console.log("--pzp-host=[name]        host of the pzp (default localhost)");
  console.log("--auth-code=[code]       context debug flag (default DEBUG)");
  console.log("--preference=[option]    preference option (default hub, other option peer)");
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
      case "--pzp-name":
        options.pzpName = parts[1];
        break;
      case "--pzp-host":
        options.pzpHost = parts[1];
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
    else if (parts[0] === "--help") {
      help();
    }
  }
});

var pzpModules = [
  {name: "get42", params: {num: "21"}},
  {name: "file", params: {}},
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

if (options.pzhHost === "" || options.pzhPort <= 0) {
  help();
} else {
  fs.readFile(path.join(__dirname, "config-pzp.json"), function(err, data) {
      var config;

      if (err) {
        config = {};
      }
      else {
        config = JSON.parse(data);
      }

      if (!config.pzhHost) {
        config.pzhHost = "localhost/OpenIDUserName";
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
      initializePzp(config, pzpModules);
  });
};

function initializePzp(config, pzpModules) {
  pzpInstance = new pzp();
  pzpInstance.initializePzp(config, pzpModules, function(result) {
    if (result === "startedPZP"){
      log.info("sucessfully started");
    }
  });
}

//Added in order to be able to get the rpc handler from the current pzp
function getPzp() {
  if (typeof instance !== "undefined") {
    return instance;
  } else {
    return null;
  }
}

function getPzpId() {
  if (typeof instance !== "undefined") {
    return instance.sessionId;
  }
}

function getPzhId() {
  if (typeof instance !== "undefined") {
    return instance.pzhId;
  }
}
