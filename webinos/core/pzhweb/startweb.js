
var dependency = require("find-dependencies")(__dirname),
    util = dependency.global.require(dependency.global.util.location),
    logger  = util.webinosLogging(__filename) || console,
    pzhproviderweb = require('./app.js');
var fs = require("fs");

var starter = exports;

starter.startWS = function (hostname, config, callback) {
    "use strict";
    loadWebServerCertificates(config, function (status, connParam) {
        logger.log("starting the web server on " + config.userPref.ports.provider_webServer);
        util.webinosHostname.getHostName(hostname, function (address) {
            pzhproviderweb.startWebServer(hostname, address, config.userPref.ports.provider_webServer,
                connParam, config, function (status, value) {
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

function loadWebServerCertificates(config, callback) {
    if (!config.cert.internal.web.cert) {
        var cn = "PzhWS" + ":" + config.metaData.serverName;
        config.generateSelfSignedCertificate("PzhWS", cn, function (status, value) {
            if (status) {
                config.generateSignedCertificate(value, 2, function (status, value) {
                    if (status) {
                        config.cert.internal.web.cert = value;
                        config.storeCertificate(config.cert.internal, "internal");
                        setParam(config, function (status, wss) {
                            if (status) {
                                return callback(true, wss);
                            } else {
                                return callback(false);
                            }
                        });
                    } else {
                        return callback(false, value);
                    }
                });
            } else {
                return callback(false, value);
            }
        });
    } else {
        setParam(config, function (status, wss) {
            if (status) {
                return callback(true, wss);
            } else {
                return callback(false);
            }
        });
    }
}

function setParam(config, callback) {
    var key_id = config.cert.internal.web.key_id;
    config.fetchKey(key_id, function (status, value) {
        if (status) {
            callback(true, {
                key: value,
                cert: config.cert.internal.web.cert,
                ca: config.cert.internal.master.cert,
                requestCert: true,
                rejectUnauthorized: false //TODO
            });
        } else {
            callback(false)
        }
    });
}



starter.start = function(hostname, friendlyName) {
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
                starter.startWS(hostname, config, function (err, val) {
                    //meh.
                });
            }
        });
    });
}

//starter.start(argv.host, argv.name);
