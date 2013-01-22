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
 * AUTHOR: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/

var PzpWSS = function (_parent) {
    "use strict";
    var dependency = require ("find-dependencies") (__dirname);
    var util = dependency.global.require (dependency.global.util.location);
    var logger = util.webinosLogging (__filename) || console;
    var url = require ("url");

    var connectedWebApp = {}; // List of connected apps i.e session with browser
    var sessionWebApp   = 0;
    var wsServer        = "";
    var self            = this;
    var parent          = _parent;
    var expectedPzhAddress;
    var wrtServer, pzhProviderAddress;

    if (process.platform == "android") {
        try {
            wrtServer = require ("bridge").load ("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
        } catch (e) {
            logger.error ("exception attempting to open wrt server " + e);
        }
    }

    function prepMsg (from, to, status, message) {
        "use strict";
        return {
            "type"   :"prop",
            "from"   :from,
            "to"     :to,
            "payload":{
                "status" :status,
                "message":message
            }
        };
    }

    function getConnectedPzp () {
        return Object.keys (parent.pzp_state.connectedPzp);
    }

    function getConnectedPzh () {
        return Object.keys (parent.pzp_state.connectedPzh);
    }

    function getVersion (from) {
        function sendVersion (data) {
            var msg = prepMsg (parent.pzp_state.sessionId, from, "webinosVersion", data);
            self.sendConnectedApp (from, msg);
        }
        var os = require ("os");
        var child_process = require ("child_process").exec;
        if (os.platform ().toLowerCase () !== "android") {
            child_process ("git describe", function (error, stderr, stdout) {
                if (!error) {
                    sendVersion (stderr);
                } else {
                    sendVersion ("v0.7"); // Change this or find another way of reading git describe for android
                }
            })
        } else {
            sendVersion ("v0.7");
        }
    }

    function getWebinosLog (type, from) {
        "use strict";
        logger.fetchLog (type, "Pzp", parent.config.metaData.friendlyName, function (data) {
            var msg = prepMsg (parent.pzp_state.sessionId, from, type + "Log", data);
            self.sendConnectedApp (from, msg);
        });
    }

    function setPzhProviderAddress (address) {
        expectedPzhAddress = address;
    }

    function wsMessage (connection, origin, utf8Data) {
        //schema validation
        var msg = JSON.parse (utf8Data);
        var invalidSchemaCheck = true;
        try {
            invalidSchemaCheck = util.webinosSchema.checkSchema (msg);
        } catch (err) {
            logger.error (err);
        }
        if (invalidSchemaCheck) {
            // For debug purposes, we only print a message about unrecognized packet,
            // in the final version we should throw an error.
            // Currently there is no a formal list of allowed packages and throw errors
            // would prevent the PZP from working
            logger.error ("msg schema is not valid " + JSON.stringify (msg));
        }
        if (msg.type === "prop") {
            switch (msg.payload.status) {
                case "registerBrowser":
                    connectedApp (connection);
                    break;
                case "setFriendlyName":
                    parent.changeFriendlyName (msg.payload.value);
                    break;
                case "getFriendlyName":
                    var msg1 = prepMsg (parent.pzp_state.sessionId, msg.from, "friendlyName", parent.config.metaData.friendlyName);
                    self.sendConnectedApp (msg.from, msg1);
                    break;
                case "infoLog":
                    getWebinosLog ("info", msg.from);
                    break;
                case "errorLog":
                    getWebinosLog ("error", msg.from);
                    break;
                case "webinosVersion":
                    getVersion (msg.from);
                    break;
                case "authCodeByPzh":
                    if (expectedPzhAddress === msg.payload.providerDetails) {
                        connection.sendUTF (JSON.stringify ({"from":parent.config.metaData.webinosName,
                            "payload":{"status":"csrAuthCodeByPzp", "csr":parent.config.cert.internal.conn.csr, "authCode":msg.payload.authCode}}));
                    }
                    break;
                case "signedCertByPzh":
                    parent.enrollPzp.register (msg.from, msg.payload.message.clientCert, msg.payload.message.masterCert, msg.payload.message.masterCrl);
                    break;
                case "setPzhProviderAddress":
                    setPzhProviderAddress (msg.payload.message);
                    break;
            }
        } else {
            parent.webinos_manager.messageHandler.onMessageReceived (msg, msg.to);
        }
    }

    function wsClose (connection, reason) {
        if (connectedWebApp[connection.id]) {
            delete connectedWebApp[connection.id];
            logger.log ("web client disconnected: " + connection.id + " due to " + reason);
        }
    }

    function handleRequest (uri, req, res) {
        /**
         * Expose the current communication channel websocket port using this virtual file.
         * This code must have the same result with the widgetServer.js used by wrt
         * webinos\common\manager\widget_manager\lib\ui\widgetServer.js
         */
        if (uri == "/webinosConfig.json") {
            var jsonReply = {
                websocketPort:parent.config.userPref.ports.pzp_webSocket
            };
            res.writeHead (200, {"Content-Type":"application/json"});
            res.write (JSON.stringify (jsonReply));
            res.end ();
            return;
        }
        var path = require ("path");
        var documentRoot = path.join (__dirname, "../../../web_root/");
        var filename = path.join (documentRoot, uri);
        util.webinosContent.sendFile (res, documentRoot, filename, "testbed/client.html");

    }

    function startHttpServer (callback) {
        var self = this;
        var http = require ("http");
        var httpserver = http.createServer (function (request, response) {
            var parsed = url.parse (request.url, true);
            handleRequest (parsed.pathname, request, response);
        });

        httpserver.on ("error", function (err) {
            if (err.code === "EADDRINUSE") {
                parent.config.userPref.ports.pzp_webSocket = parseInt (parent.config.userPref.ports.pzp_webSocket, 10) + 1;
                logger.error ("address in use, now trying port " + parent.config.userPref.ports.pzp_webSocket);
                httpserver.listen (parent.config.userPref.ports.pzp_webSocket, "localhost");
            } else {
                return callback (false, err);
            }
        });

        httpserver.on ("listening", function () {
            logger.log ("httpServer listening at port " + parent.config.userPref.ports.pzp_webSocket + " and hostname localhost");
            return callback (true, httpserver);
        });
        httpserver.listen (parent.config.userPref.ports.pzp_webSocket, "localhost");
    }

    function startAndroidWRT () {
        if (wrtServer) {
            wrtServer.listener = function (connection) {
                logger.log ("connection accepted and adding proxy connection methods.");
                connection.socket = {
                    pause :function () {},
                    resume:function () {}
                };
                connection.sendUTF = connection.send;

                connectedApp (connection);

                connection.listener = {
                    onMessage:function (ev) {
                        wsMessage (connection, "android", ev.data);
                    },
                    onClose  :function () {
                        wsClose (connection);
                    },
                    onError  :function (reason) {
                        logger.error (reason);
                    }
                };
            };
        }
    }

    function connectedApp (connection) {
        var appId, tmp, payload, key, msg, msg2;
        if (connection) {
            appId = parent.pzp_state.sessionId + "/" + sessionWebApp;
            sessionWebApp += 1;
            connectedWebApp[appId] = connection;
            connection.id = appId; // this appId helps in while deleting socket connection has ended

            payload = { "pzhId":parent.config.metaData.pzhId,
                "connectedPzp" :getConnectedPzp (),
                "connectedPzh" :getConnectedPzh (),
                "state"        :parent.pzp_state.state,
                "enrolled"     :parent.pzp_state.enrolled};
            msg = prepMsg(parent.pzp_state.sessionId, appId, "registeredBrowser", payload);
            self.sendConnectedApp(appId, msg);

            if(Object.keys(connectedWebApp).length == 1 ) {
                getVersion(appId);
            }
        } else {
            for (key in connectedWebApp) {
                if (connectedWebApp.hasOwnProperty (key)) {
                    tmp = connectedWebApp[key];
                    payload = { "pzhId":parent.config.metaData.pzhId,
                        "connectedPzp" :getConnectedPzp (),
                        "connectedPzh" :getConnectedPzh (),
                        "state"        :parent.pzp_state.state,
                        "enrolled"     :parent.pzp_state.enrolled};
                    msg = prepMsg(parent.pzp_state.sessionId, key, "update", payload);
                    self.sendConnectedApp(key, msg);
                }
            }
        }
    }

    function handleData (cmd, data) {
        var msg = {type:"prop", from:parent.pzp_state.sessionId, to:"", payload:{ status:cmd, message:data}};
        for (var id in connectedWebApp) {
            msg.to = id;
            connectedWebApp[id].sendUTF (JSON.stringify (msg));
        }
    }


    function approveRequest (request) {
        var requestor = request.host.split (":")[0]; // don't care about port.
        return (requestor === "localhost" || requestor === "127.0.0.1");
    }

    this.startWebSocketServer = function (_callback) {
        startHttpServer (function (status, value) {
            if (status) {
                if (wrtServer) {
                    startAndroidWRT ();
                }
                var WebSocketServer = require ("websocket").server;
                wsServer = new WebSocketServer ({
                    httpServer           :value,
                    autoAcceptConnections:false
                });
                logger.addId (parent.config.metaData.webinosName);
                wsServer.on ("request", function (request) {
                    logger.log ("Request for a websocket, origin: " + request.origin + ", host: " + request.host);
                    if (approveRequest (request)) {
                        var connection = request.accept ();
                        logger.log ("Request accepted");
                        connectedApp (connection);
                        connection.on ("message", function (message) { wsMessage (connection, request.origin, message.utf8Data); });
                        connection.on ("close", function (reason, description) { wsClose (connection, description) });
                    } else {
                        logger.error ("Failed to accept websocket connection: " + "wrong host or origin");
                    }
                });
                return _callback (true);
            } else {
                return _callback (false, err);
            }
        });
    };

    this.sendConnectedApp = function (address, message) {
        if (address && message) {
            if (connectedWebApp.hasOwnProperty (address)) {
                var jsonString = JSON.stringify (message);
                logger.log ('send to ' + address + ' message ' + jsonString);
                connectedWebApp[address].socket.pause ();
                connectedWebApp[address].sendUTF (jsonString);
                connectedWebApp[address].socket.resume ();
            } else {
                logger.error ("unknown destination " + address);
            }
        } else {
            logger.error ("message or address is missing");
        }
    };
    this.updateApp = function () {
        connectedApp ();
    };
    this.pzhDisconnected = function () {
        var key;
        for (key in connectedWebApp) {
            if (connectedWebApp.hasOwnProperty (key)) {
                var msg = prepMsg (parent.pzp_state.sessionId, key, "pzhDisconnected", "pzh disconnected");
                self.sendConnectedApp (key, msg);
            }
        }
    }
};

module.exports = PzpWSS;
