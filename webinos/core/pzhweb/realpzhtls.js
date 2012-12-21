var dependency = require("find-dependencies")(__dirname);
var util = dependency.global.require(dependency.global.util.location);
var logger = util.webinosLogging(__filename) || console;

var PzhWebTLSCommunicator = exports;
var connection = "";
var callbackStorage = [];

PzhWebTLSCommunicator.init = function(config, webOptions, handler, cb) {
    "use strict";
    var tls = require('tls');

    var tlsServerOptions = {
        host  : config.metaData.serverName,
        port  : config.userPref.ports.provider,
        key   : webOptions.key,   //TODO: wont be this key
        cert  : webOptions.cert,  //TODO: wont be this cert
        ca    : webOptions.ca,             //TODO: Get the TLS server's certificate
        rejectUnauthorised: false //TODO: set to true
    };

    connection = tls.connect(config.userPref.ports.provider,
        config.metaData.serverName,
        webOptions, function() {
            if (connection.authorized) {
                logger.log("Connected to the PZH TLS server");
                cb(true, connection);
            } else {
                logger.error("connection failed " + connection.authorizationError)
            }
        });

    //connection.setEncoding("utf8");

    connection.on("data", function(_buffer) {
        util.webinosMsgProcessing.readJson(this, _buffer, function(obj) {
            if(callbackStorage.hasOwnProperty(obj.user.identifier)) {
                callbackStorage[obj.user.identifier].success(obj.payload);
            }
        });
    });

    connection.on("error", function(err) {
        logger.error(err.message);
        cb(false, err);
    });

    connection.on("end", function() {
        cb(false, "Connection ended");
    });
};

PzhWebTLSCommunicator.send = function(user, message, callback) {
    "use strict";
    try {
        var jsonString, buf, realMsg = {
            user : user,
            message : message
        };
        jsonString = JSON.stringify(realMsg);
        buf = util.webinosMsgProcessing.jsonStr2Buffer(jsonString);
        connection.write(buf);
        connection.resume();
        callbackStorage[user.identifier] = callback;
    } catch (err) {
        logger.error("Failed to send a message to the PZH TLS Server: " + err);
        callback.err("Failed to send a message to the PZH TLS Server");
    }
};


