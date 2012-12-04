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
 * Author: Eelco Cramer, TNO
 */

(function() {
  	"use strict";

    var sys = require('util');
    var GenericFeature = require('./GenericFeature.js');
    var logger = require('./Logger').getLogger('Get42Feature', 'verbose');

    /**
     * The namespace of this feature
     * @constant
     * @name Get42Feature#NS
     */
    var NS = "http://webinos.org/api/test";

    var webinos = require("find-dependencies")(__dirname);
    var get42 = webinos.global.require(webinos.global.api.get42.location);

    /**
     * Testing feature with life answer.
     * @constructor
     * @name Get42Feature
     * @param rpcHandler The rpc handler instance.
     */
    function Get42Feature(rpcHandler) {
    	GenericFeature.GenericFeature.call(this);
    	this.module = new get42.Module(rpcHandler);
    	var self = this;
    	this.module.init(function(service) {
    	    self.embedService(service)
    	});
    }

    sys.inherits(Get42Feature, GenericFeature.GenericFeature);
    exports.Module = Get42Feature;
    exports.NS = NS;
})();
