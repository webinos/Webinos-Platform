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

    var GenericFeature = require('./GenericFeature.js');
    var sys = require('util');
    var logger = require('./Logger').getLogger('FileFeature', 'info');

    var webinos = require("find-dependencies")(__dirname);
    var file = webinos.global.require(webinos.global.api.file.location);

    /**
     * The namespace of this feature
     * @constant
     * @name FileFeature#NS
     */
    var NS = "http://webinos.org/api/file";

    /**
     * File feature, defined as subclass of GenericFeature
     * @constructor
     * @name FileFeature
     * @param rpcHandler The rpc handler instance.
     * @param connector The geolocation connector scheme that is used.
     */
    function FileFeature(rpcHandler, params) {
    	GenericFeature.GenericFeature.call(this);
        this.embedService(new file.Service(rpcHandler, params));
    }

    sys.inherits(FileFeature, GenericFeature.GenericFeature);
    exports.Service = FileFeature;
    exports.NS = NS;
})();

