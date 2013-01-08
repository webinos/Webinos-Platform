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
    var logger = require('./Logger').getLogger('GeolocationFeature', 'info');

    var webinos = require("find-dependencies")(__dirname);
    var geolocation = webinos.global.require(webinos.global.api.geolocation.location);

    /**
     * The namespace of this feature
     * @constant
     * @name GeolocationFeature#NS
     */
    var NS = "http://webinos.org/api/w3c/geolocation";

    /**
     * Geolocation feature, defined as subclass of GenericFeature
     * @constructor
     * @name GeolocationFeature
     * @param rpcHandler The rpc handler instance.
     * @param connector The geolocation connector scheme that is used.
     */
    function GeolocationFeature(rpcHandler, connector) {
    	GenericFeature.GenericFeature.call(this);

        if (connector === undefined) {
            this.embedService(new geolocation.Service(rpcHandler, { 'connector': 'geoip'}));
        } else {
    	    this.embedService(new geolocation.Service(rpcHandler, { 'connector': connector}));
        }
    }

    sys.inherits(GeolocationFeature, GenericFeature.GenericFeature);
    exports.Service = GeolocationFeature;
    exports.NS = NS;
})();

