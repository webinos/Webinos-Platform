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
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/

//The code to inject webinos dependencies into the code:

console.log("DBG dirname",__dirname);
var path = require('path');

var deps = require('../dependencies.json');
console.log("DBG deps.resolve",path.resolve(__dirname, '../dependencies.json'))//path.resolve(__dirname, deps.root.location))
//var moduleRoot = require(path.resolve(__dirname, deps.root.location));

var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
console.log("DBG moduleRoot",moduleRoot);

var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
console.log("DBG dependencies",dependencies);
var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);
//Requiring files can then be done by using e.g.
console.log("DBG webinosRoot",webinosRoot);



//var rpc = require(path.join(webinosRoot, dependencies.rpc.location, "lib/rpc.js"));
////or if the package.json file is defined correctly (untested)

//var rpc2 = require(path.join(webinosRoot, dependencies.rpc.location));
//console.log("DBG rpc",rpc);
//console.log("DBG rpc2",rpc2);
