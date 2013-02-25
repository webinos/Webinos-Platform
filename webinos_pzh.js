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
var pzh_web       = require("./webinos/core/pzhweb/startweb.js");

var host = null, name = null;

var argv = require('optimist')
    .usage('Usage: $0 --host = [host] --name = [name] (host is the domain of the server, name is the friendly name)')
    .default ('host', "")
    .default ('name', "")
    .argv;

var _pzh_provider = new pzh_provider(argv.host, argv.name);
_pzh_provider.startProvider(function(result, details) {
  if (result) {
    pzh_web.start(argv.host, argv.name);
  } else {
    console.error("ZONE PROVIDER FAILED TO START "+ details, 'color:red');
  }
});




