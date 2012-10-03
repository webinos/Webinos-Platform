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

/**
 * Remote alert feature.
 * 
 * Reused and updated the orginal XmppDemo code of Victor Klos
 * Author: Eelco Cramer, TNO
 */
var sys = require('util');
var GenericFeature = require('./GenericFeature.js');
var logger = require('./Logger').getLogger('Get42Feature', 'verbose');

var NS = "http://webinos.org/api/test";

var moduleRoot = require('../dependencies.json');
var dependencies = require('../' + moduleRoot.root.location + '/dependencies.json');
var webinosRoot = '../' + moduleRoot.root.location;

var get42 = require(webinosRoot + dependencies.api.get42.location);

/*
 * Remote-alert Feature, defines as subclass of GenericFeature
 */
function Get42Feature(rpcHandler) {
	GenericFeature.GenericFeature.call(this);
	this.embedService(new get42.Service(rpcHandler));
}

//sys.inherits(Get42Feature, get42.testModule);
sys.inherits(Get42Feature, GenericFeature.GenericFeature);
exports.Service = Get42Feature;
exports.NS = NS;

///////////////////////// END Remote Alering Service /////////////////////////

