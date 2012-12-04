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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/
var pzh_provider  = require("./webinos/core/pzh/lib/pzh_provider.js");

var host = null, name = null;

function help() {
  console.log("Usage: node webinos_provider.js [options]");
  console.log("Options:");
  console.log("--host = [host] host of the pzh provider (default \"\")");
  console.log("--name = [name] friendly provider name (default \"\")");
  process.exit();
}

process.argv.forEach(function (arg) {
  var parts;
  if (arg.indexOf("--") > -1) {
    parts = arg.split("=");
    if (parts.length > 1) {
      switch (parts[0]) {
      case "--host":
        host = parts[1];
        break;
      case "--name":
        name = parts[1];
        break;
      }
    }
    else if (parts[0] === "--help") {
      help();
    }
  }
});

if ( host === null) {
  host = "";
}

if ( name === null) {
  name = "";
}

var _pzh_provider = new pzh_provider(host, name);
_pzh_provider.startProvider(function(result, details) {
  if (result) {
    console.log("ZONE PROVIDER STARTED");
  } else {
    console.error("ZONE PROVIDER FAILED TO START "+ details);
  }
});


