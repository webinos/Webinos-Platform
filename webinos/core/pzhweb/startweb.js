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
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Copyright 2012 - 2013 University of Oxford
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/

var dependency = require("find-dependencies")(__dirname),
    util = dependency.global.require(dependency.global.util.location),
    logger  = util.webinosLogging(__filename) || console,
    pzhproviderweb = require('./app.js');
var fs = require("fs");

var starter = exports;

starter.startWS = function (hostname, config, callback) {
    "use strict";
    loadWebServerCertificates(config, function (status) {
        if (!status) {
            logger.log("Failed to create web server certificates");
            callback(false);
            return;
        }
        logger.log("starting the web server on " + config.userPref.ports.provider_webServer);
        util.webinosHostname.getHostName(hostname, function (address) {
            pzhproviderweb.startWebServer(hostname, address, config.userPref.ports.provider_webServer,
                config, function (status, value) {
                if (status) {
                    logger.log("Personal zone provider web server started");
                    return callback(true);
                } else {
                    logger.log("Personal zone provider web server failed to start on port " +
                        config.userPref.ports.provider_webServer + ", " + value);
                    return callback(false, value);
                }
            });
        });
    });
};
/* load the web server's client and SSL certificates.
 */
function loadWebServerCertificates(config, callback) {
    "use strict";
    loadWSCertificate(config, "webssl", "PzhSSL", function(success) {
        if (success) {
            loadWSCertificate(config, "webclient", "PzhWS", function(success) {
                callback(success);
            });
        } else {
            callback(success);
        }
    });
}

/* Generic "make me a certificate" function.
 * certName should be either "webssl" or "webclient"
 * certLabel should be either "PzhSSL" or "PzhWS"
 */
function loadWSCertificate(config, certName, certLabel, callback) {
    if (!config.cert.internal[certName] || !config.cert.internal[certName].cert) {
        var cn = certLabel + ":" + config.metaData.serverName;
        config.generateSelfSignedCertificate(certLabel, cn, function (status, value) {
            if (status) {
                config.generateSignedCertificate(value, function (status, value) {
                    if (status) {
                        config.cert.internal[certName].cert = value;
                        config.storeDetails(require("path").join("certificates", "internal"), "certificates", config.cert.internal);
                        return callback(status);
                    } else {
                        return callback(false);
                    }
                });
            } else {
                return callback(false);
            }
        });
    } else {
        return callback(true);
    }
}

starter.start = function(hostname, friendlyName, callback) {
    var config = new util.webinosConfiguration();
    util.webinosHostname.getHostName(hostname, function (address_) {
        var inputConfig = {
        "friendlyName": friendlyName,
        "sessionIdentity": address_
        };
        config.setConfiguration("PzhP", inputConfig, function (status, value) {
            if (!status) {
                logger.error(value);
                logger.error("setting configuration for the zone provider failed, the .webinos directory needs to be deleted.")
            } else {
                starter.startWS(hostname, config, callback);
            }
        });
    });
}

//starter.start(argv.host, argv.name);
