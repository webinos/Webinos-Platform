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
 *         Ziran Sun (ziran.sun@samsung.com)
 *******************************************************************************/

var PzpWSS = function (parent) {
    "use strict";
    var dependency = require ("find-dependencies") (__dirname);
    var util = dependency.global.require (dependency.global.util.location);
    var logger = util.webinosLogging (__filename) || console;
    var url = require ("url");

    var connectedWebApp = {}; // List of connected apps i.e session with browser
    var sessionWebApp   = 0;
    var self            = this;
    var expectedPzhAddress;
    var wrtServer, pzhProviderAddress;

    if (process.platform == "android") {
        try {
            wrtServer = require ("bridge").load ("org.webinos.app.wrt.channel.WebinosSocketServerImpl", exports);
        } catch (e) {
            logger.error ("exception attempting to open wrt server " + e);
        }
    }

    function prepMsg(to, status, message) {
        return {
            "type": "prop",
            "from": parent.pzp_state.sessionId,
            "to": to,
            "payload": {
                "status": status,
                "message": message
            }
        };
    }

    function getConnectedPzp() {
        var list = [], key;
        for (key in parent.pzp_state.connectedPzp) {
            if(parent.pzp_state.connectedPzp.hasOwnProperty(key)) {
                list.push(parent.pzp_state.connectedPzp[key].friendlyName || key);
            }
        }
        for (key in parent.pzp_state.connectedDevicesToPzh.pzp) {
            if(parent.pzp_state.connectedDevicesToPzh.pzp.hasOwnProperty(key)) {
                list.push(parent.pzp_state.connectedDevicesToPzh.pzp[key] || key);
            }
        }
        list.push(parent.config.metaData.friendlyName);
        return list;
    }

    function getConnectedPzh(){
        var list = [], key;
        for (key in parent.pzp_state.connectedPzh) {
            if(parent.pzp_state.connectedPzh.hasOwnProperty(key)) {
                list.push(parent.pzp_state.connectedPzh[key].friendlyName || key);
            }
        }
        for (key in parent.pzp_state.connectedDevicesToPzh.pzh) {
            if(parent.pzp_state.connectedDevicesToPzh.pzh.hasOwnProperty(key)) {
                list.push(parent.pzp_state.connectedDevicesToPzh.pzh[key] || key);
            }
        }
        return list;
    }

    function getVersion (from) {
        var msg;
        if (parent.config.metaData.webinos_version) {
            msg = prepMsg (from, "webinosVersion", parent.config.metaData.webinos_version);
        } else {
            var packageValue = require("../../../../package.json")
            msg = prepMsg (from, "webinosVersion", packageValue.version);
        }
        self.sendConnectedApp (from, msg);
    }

    function getWebinosLog (type, from) {
        "use strict";
        logger.fetchLog (type, "Pzp", parent.config.metaData.friendlyName, function (data) {
            var msg = prepMsg (from, type + "Log", data);
            self.sendConnectedApp (from, msg);
        });
    }

    function setPzhProviderAddress (address) {
        expectedPzhAddress = address;
    }

    function setInternalParams(id) {
        var to;
        if(id === parent.pzp_state.sessionId) {
            id = parent.config.metaData.friendlyName; // Special case of findServices
        } else if (parent.pzp_state.connectedPzp.hasOwnProperty(id) && parent.pzp_state.connectedPzp[id].friendlyName) {
            id = parent.pzp_state.connectedPzp[id].friendlyName;
        } else if (parent.pzp_state.connectedPzh.hasOwnProperty(id) && parent.pzp_state.connectedPzh[id].friendlyName) {
            id = parent.pzp_state.connectedPzh[id].friendlyName;
        } else if (connectedWebApp[id]) {
            to = (id.split("/") && id.split("/").length === 2) ? id.split("/")[1] : id.split("/")[2];
            id = parent.config.metaData.friendlyName + "/"+ to;
        } else if(parent.pzp_state.connectedDevicesToPzh.pzp[id]) {
            id = parent.pzp_state.connectedDevicesToPzh.pzp[id];
        } else if(parent.pzp_state.connectedDevicesToPzh.pzh[id]) {
            id = parent.pzp_state.connectedDevicesToPzh.pzh[id];
        }
        return id;
    }

    function setOriginalId(id) {
        if (id) {
            var matchId= id.split("/") && id.split("/")[0], key, i;
            if(matchId === parent.config.metaData.friendlyName) {
                id = (id.split('/').length > 1) ? (parent.pzp_state.sessionId +"/"+ id.split('/')[1]) : parent.pzp_state.sessionId;
            } else {
                for (key in parent.pzp_state.connectedPzp) {
                    if (parent.pzp_state.connectedPzp.hasOwnProperty(key) &&
                        parent.pzp_state.connectedPzp[key].friendlyName === matchId) {
                        id = key;
                        break;
                    }
                }
                for (key in parent.pzp_state.connectedPzh) {
                    if (parent.pzp_state.connectedPzh.hasOwnProperty(key) &&
                        parent.pzp_state.connectedPzh[key].friendlyName === matchId) {
                        id = key;
                        break;
                    }
                }
                for (key in parent.pzp_state.connectedDevicesToPzh.pzp) {
                    if (parent.pzp_state.connectedDevicesToPzh.pzp.hasOwnProperty(key) &&
                        parent.pzp_state.connectedDevicesToPzh.pzp[key] === matchId) {
                        id = key;
                        break;
                    }
                }
                for (key in parent.pzp_state.connectedDevicesToPzh.pzh) {
                    if (parent.pzp_state.connectedDevicesToPzh.pzh.hasOwnProperty(key) &&
                        parent.pzp_state.connectedDevicesToPzh.pzh[key] === matchId) {
                        id = key;
                        break;
                    }
                }
            }
        }
        return id;
    }
    function wsMessage (connection, origin, utf8Data) {
        //schema validation
        var key, msg = JSON.parse (utf8Data), invalidSchemaCheck = true;
        if (msg && msg.payload && msg.payload.status === "registerBrowser") {
            // skip schema check as this is first message
        } else {
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
        }
        msg.to = setOriginalId(msg.to);
        msg.from = setOriginalId(msg.from);
        msg.resp_to = setOriginalId(msg.resp_to);

        if (msg.type === "prop") {
            switch (msg.payload.status) {
                case "registerBrowser":
                    parent.pzpWebSocket.connectedApp(connection, msg.payload.value);
                    break;
                case "setFriendlyName":
                    parent.changeFriendlyName(msg.payload.value);
                    // THis functionality will be added via webinos core api.
                    break;
                case "getFriendlyName":
                    var msg1 = prepMsg(msg.from, "friendlyName", parent.config.metaData.friendlyName);
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
                            "payload":{"status":"csrAuthCodeByPzp", "csr":parent.config.cert.internal.master.csr, "authCode":msg.payload.authCode}}));
                    }
                    break;
                case "signedCertByPzh":
                    if (expectedPzhAddress === (msg.from && msg.from.split("_") && msg.from.split("_")[0])) {
                        parent.enrollPzp.register (msg.from, msg.to, msg.payload.message.clientCert, msg.payload.message.masterCert, msg.payload.message.masterCrl);
                    }
                    break;
                case "setPzhProviderAddress":
                    setPzhProviderAddress (msg.payload.message);
                    break;
                case "pzpFindPeers":
                    sendPzpPeersToApp();
                    break;
                case "showHashQR":
                    getHashQR(function(value){
                        var msg5 = prepMsg(msg.from, "showHashQR", value);
                        sendtoClient(msg5);
                    });
                    break;
                case "checkHashQR":
                    //get payload message.hash 
                    var hash = msg.payload.message.hash;
                    logger.log("hash passed from client page is: " + hash);
                    checkHashQR(hash, function(value){
                        var msg6 = prepMsg(msg.from, "checkHashQR", value);
                        sendtoClient(msg6);
                    });
                    break;
                case "requestRemoteScanner":
                    requestRemoteScanner(parent.pzp_state.connectingPeerAddr);
                    break;
                case "pubCert":
                    exchangeCert(msg, function(value){
                        logger.log("pubCert exchanged: " + value);
                    });
                    break;
                case "pzhCert":
                    exchangeCert(msg, function(value){
                        logger.log("pzhCert Value:" + value);
                    });
                    break;
                case "intraPeer":
                    connectintra(msg, function(value){
                        logger.log("connect intra-zone peer: " + value);
                    });
                    break;
                case "resetDevice":
                    parent.resetDevice();
                    break;
            }
        } else {
            parent.webinos_manager.messageHandler.onMessageReceived (msg, msg.to);
        }
    }

    function wsClose (connection, reason) {
        if (connectedWebApp[connection.id]) {
            delete connectedWebApp[connection.id];
            parent.webinos_manager.messageHandler.removeRoute (connection.id, parent.pzp_state.sessionId);
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

    function startHttpServer(callback) {
        var self = this;
        var http = require ("http");
        var httpserver = http.createServer(function (request, response) {
            var parsed = url.parse(request.url, true);
            var tmp = "";

            request.on('data', function(data){
                tmp = tmp + data;
            });
            request.on("end", function(data){
                if (parsed.query && parsed.query.cmd === "pubCert"){
                    var msg = JSON.parse(tmp.toString("utf8"));
                    logger.log("got pubcert");
                    //store the pub certificate and send own pub cert back
                    var filename = "otherconn";
                    parent.config.storeKeys(msg.payload.message.cert, filename);
                    parent.pzp_state.connectingPeerAddr = msg.payload.message.addr;
                    //send own public key out
                    var to = msg.from;
                    logger.log("exchange cert message sending to: " + to);
                    //save a local copy
                    var filename = "conn";
                    parent.config.storeKeys(parent.config.cert.internal.conn.cert, filename);
                    var repubcert = {
                        from: parent.pzp_state.sessionId,
                        payload: {
                            status: "repubCert",
                            message:
                            {cert: parent.config.cert.internal.conn.cert }
                        }
                    };
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(repubcert));
                    response.end();

                    var msg = prepMsg("", "pubCert", { "pubCert": true});
                    sendtoClient(msg);

                    return;
                }
                else if (parsed.query && parsed.query.cmd === "pzhCert"){
                    if (!parent.config.cert.external.hasOwnProperty(parsed.query.from)) {
                        var msg = JSON.parse(tmp.toString("utf8"));
                        logger.log("got pzhcert");
                        logger.log("storing external cert");
                        parent.config.cert.external[msg.from] = { cert: msg.payload.message.cert, crl: msg.payload.message.crl};
                        parent.config.storeDetails(path.join("certificates","external"), "certificates", parent.config.cert.external);
                        logger.log("got pzhCert from:" + msg.from); //remeber the other party

                        if(!parent.config.exCertList.hasOwnProperty(msg.from)) {
                            var storepzp = {"exPZP" : msg.from};
                            parent.config.exCertList = storepzp;
                            parent.config.storeDetails(null, "exCertList", parent.config.exCertList);
                        }

                        //send own certificate back
                        var to = msg.from;
                        logger.log("exchange cert message sending to: " + to);

                        var replycert = {
                            from: parent.pzp_state.sessionId,
                            payload: {
                                status: "replyCert",
                                message:
                                {cert: parent.config.cert.internal.master.cert, crl: parent.config.crl}
                            }
                        };
                        response.writeHead(200, {"Content-Type": "application/json"});
                        response.write(JSON.stringify(replycert));
                        response.end();
                    }
                    return;
                }
                else if(parsed.query && parsed.query.cmd === "requestRemoteScanner"){
                    var msg = JSON.parse(tmp.toString("utf8"));
                    logger.log("got requestRemoteScanner");

                    var msg = prepMsg("", "requestRemoteScanner", { "requestRemoteScanner": true});
                    sendtoClient(msg);

                    return;
                }
            });

            handleRequest(parsed.pathname, request, response);
        });

        httpserver.on ("error", function (err) {
            if (err.code === "EADDRINUSE") {
                parent.config.userPref.ports.pzp_webSocket = parseInt (parent.config.userPref.ports.pzp_webSocket, 10) + 1;
                logger.error ("address in use, now trying port " + parent.config.userPref.ports.pzp_webSocket);
                httpserver.listen (parent.config.userPref.ports.pzp_webSocket, "0.0.0.0");
            } else {
                return callback (false, err);
            }
        });

        httpserver.on ("listening", function () {
            logger.log ("httpServer listening at port " + parent.config.userPref.ports.pzp_webSocket + " and hostname localhost");
            return callback (true, httpserver);
        });
        httpserver.listen (parent.config.userPref.ports.pzp_webSocket, "0.0.0.0");
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

                parent.pzpWebSocket.connectedApp(connection);

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

    function sendPzpPeersToApp() {
        parent.webinos_manager.peerDiscovery.findPzp(parent,'zeroconf', parent.config.userPref.ports.pzp_tlsServer, null, function(data){
            var payload = { "foundpeers": data};
            logger.log(data);
            var msg = prepMsg("", "pzpFindPeers", payload);
            sendtoClient(msg);
        });
    }

    function getHashQR(cb) {
        var path = require ("path");
        var os = require("os");
        var infile = path.join(parent.config.metaData.webinosRoot, "keys", "conn.pem");

        var outfile = path.join("/data/data/org.webinos.app/node_modules/webinos/wp4/webinos/web_root", "testbed", "QR.png");

        if(os.platform().toLowerCase() == "android")  {
            try{
                parent.webinos_manager.Sib.createQRHash(infile, outfile, 200, 200, function(data){
                    logger.log("calling SIB create QR Hash");
                    cb(data);
                });
            } catch(e) {
                logger.error("Creating Hash QR for Android failed!" + e);
            }
        }
        else {
            try {
                parent.webinos_manager.Sib.createQRHash(infile, null, 0, 0, function(err, data){
                    if(err === null)
                        cb(data);
                    else
                        logger.log("createQRHash failed");
                });
            } catch (e) {
                logger.error("Creating Hash QR failed!" + e);
            }
        }
    }

    function checkHashQR(hash, cb) {
        var path = require ("path");
        var filename = path.join(parent.config.metaData.webinosRoot, "keys", "otherconn.pem");
        try {
            logger.log("android - check hash QR");
            parent.webinos_manager.Sib.checkQRHash(filename, hash, function(data){
                if(data)
                {
                    logger.log("Correct Hash is passed over");
                    cb(parent.pzp_state.connectingPeerAddr);
                }
                else
                {
                    logger.log("Wrong Hash key");
                    cb(null);
                }
            });
        } catch (e) {
            logger.error("Checking Hash QR Failed!" + e);
        }
    }

    function requestRemoteScanner(to) {
        if(to === "")
        {
            logger.error("No auth party is found - abort action!");
            return;
        }
        else
        {
            logger.log("requestRemoteScanner at: " + to);
            var msg = prepMsg(to, "requestRemoteScanner", {addr: parent.pzp_state.networkAddr});
            if(msg) {
                var options = {
                    host: to,
                    port: 8080,
                    path: '/testbed/client.html?cmd=requestRemoteScanner',
                    method: 'POST',
                    headers: {
                        'Content-Length': JSON.stringify(msg).length
                    }
                };
                var req = http.request(options, function (res) {
                    res.on('data', function (data) {
                    });
                });

                req.on('connect', function(){
                    callback(true);
                });

                req.on('error', function (err) {
                    callback(err);
                });

                req.write(JSON.stringify(msg));
                req.end();
            }
        }
    }

    function connectintra(message, callback) {
        var addr = message.payload.message.peer;
        var name = message.payload.message.name;
        logger.log("connecting to: " + addr + name);
        if(addr !== null)
        {
            var msg={};
            msg.address = addr;
            //fetch PZH id
            msg.name = parent.config.metaData.pzhId + "/" + name + "_Pzp";
            parent.pzpClient.connectPeer(msg);
        }
    }

    function exchangeCert(message, callback) {
        var to =  message.payload.message.peer;
        if(to !== null)
            parent.pzp_state.connectingPeerAddr = to; //remember the party that current is connecting to
        var msg = {};
        if(message.payload.status === "pubCert")
        {
            if(to === "")
                logger.log("please select the peer first");
            else
            {
                var msg = prepMsg(to, "pubCert", {cert: parent.config.cert.internal.conn.cert, addr: parent.pzp_state.networkAddr});
                logger.log("own address is: " + parent.pzp_state.networkAddr);

                // save a local copy - remove when connected
                var filename = "conn";
                parent.config.storeKeys(parent.config.cert.internal.conn.cert, filename);

                if(msg) {
                    var options = {
                        host: to,
                        port: 8080,
                        path: '/testbed/client.html?cmd=pubCert',
                        method: 'POST',
                        headers: {
                            'Content-Length': JSON.stringify(msg).length
                        }
                    };
                }
            }
        }
        else if(message.payload.status === "pzhCert")
        {
            to = parent.pzp_state.connectingPeerAddr;
            logger.log("exchange cert message sending to: " + to);
            if(to === "")
            {
                logger.error("Abort Certificate exchange - the other party's address is not available!");
                return;
            }
            else
            {
                logger.log("msg send to: " + to);
                var msg = prepMsg(to, "pzhCert", {cert: parent.config.cert.internal.master.cert, crl : parent.config.crl});
                if(msg) {
                    var options = {
                        host: to,
                        port: 8080,                              //pzp webserver port number
                        path: '/testbed/client.html?cmd=pzhCert',
                        method: 'POST',
                        headers: {
                            'Content-Length': JSON.stringify(msg).length
                        }
                    };
                }
            }
        }
        if(msg){
            var http = require ("http");
            var req = http.request(options, function (res) {
                var headers = JSON.stringify(res.headers);
                if((headers.indexOf("text/html")) !== -1)
                {
                    logger.log("wrong content type - do nothing.");
                    return;
                }
                res.setEncoding('utf8');
                var tmpdata = "";
                res.on('data', function (data) {
                    logger.log('BODY: ' + data);
                    tmpdata = tmpdata + data;
                    var n=data.indexOf("}}");  //check if data ends with }} 
                    if (n !== -1)
                    {
                        logger.log(tmpdata);
                        var rmsg = JSON.parse("" + tmpdata);
                        if (rmsg.payload && rmsg.payload.status === "repubCert") {
                            logger.log("come to repubCert");
                            var filename = "otherconn";
                            parent.config.storeKeys(rmsg.payload.message.cert, filename);
                            //trigger Hash QR display
                            var payload = { "pubCert": true};
                            var msg = prepMsg("", "pubCert", { "pubCert": true});
                            sendtoClient(msg);
                        }
                        else if (rmsg.payload && rmsg.payload.status === "replyCert") {
                            logger.log("rmsg from: "  + rmsg.from);
                            parent.config.cert.external[rmsg.from] = { cert: rmsg.payload.message.cert, crl: rmsg.payload.message.crl};
                            parent.config.storeDetails(path.join("certificates","external"), "certificates", parent.config.cert.external);

                            if(!parent.config.exCertList.hasOwnProperty(rmsg.from)) {
                                var storepzp = {"exPZP" : rmsg.from};
                                parent.config.exCertList = storepzp;
                                parent.config.storeDetails(null, "exCertList", parent.config.exCertList);
                            }
                            var msg={};
                            logger.log("rmsg.from: " + rmsg.from);
                            msg.name = rmsg.from;
                            msg.address = parent.pzp_state.connectingPeerAddr;
                            parent.pzpClient.connectPeer(msg);
                        }
                    }
                });
            });

            req.on('connect', function(){
                callback(true);
            });

            req.on('error', function (err) {
                callback(err);
            });

            req.write(JSON.stringify(msg));
            req.end();
        }
    }

    this.connectedApp = function(connection, webAppName) {
        var appId, tmp, payload, key, msg, msg2;
        if (connection) {
            if (!webAppName) webAppName = require("crypto").randomBytes(3).toString("hex").toUpperCase();
            //sessionWebApp  += 1;
            sessionWebApp = require("crypto").createHash("md5").update(parent.pzp_state.sessionId + webAppName).digest("hex");
            appId = parent.pzp_state.sessionId  + "/"+ sessionWebApp + "_" + (Date.now()+Math.random()*10000); //patch: http://jira.webinos.org/browse/WP-878
            connectedWebApp[appId] = connection;
            connection.id = appId; // this appId helps in while deleting socket connection has ended

            payload = { "pzhId":(parent.config.metaData.pzhId && parent.pzp_state.connectedPzh[parent.config.metaData.pzhId] &&
                                 parent.pzp_state.connectedPzh[parent.config.metaData.pzhId].friendlyName)|| "",
                "connectedPzp" :getConnectedPzp(),
                "connectedPzh" :getConnectedPzh(),
                "state"        :parent.pzp_state.state,
                "enrolled"     :parent.pzp_state.enrolled};
            msg = prepMsg(appId, "registeredBrowser", payload);
            self.sendConnectedApp(appId, msg);

            if(Object.keys(connectedWebApp).length == 1 ) {
                getVersion(appId);
            }
        } else {
            for (key in connectedWebApp) {
                if (connectedWebApp.hasOwnProperty (key)) {
                    tmp = connectedWebApp[key];
                    payload = { "pzhId":parent.config.metaData.pzhId || "",
                        "connectedPzp" :getConnectedPzp(),
                        "connectedPzh" :getConnectedPzh(),
                        "state"        :parent.pzp_state.state,
                        "enrolled"     :parent.pzp_state.enrolled};
                    msg = prepMsg(key, "update", payload);
                    self.sendConnectedApp(key, msg);
                }
            }
        }
    };

    this.startWebSocketServer = function (_callback) {
        startHttpServer (function (status, value) {
            if (status) {
                if (wrtServer) {
                    startAndroidWRT ();
                }
                var WebSocketServer = require ("websocket").server;
                var wsServer = new WebSocketServer ({
                    httpServer           :value,
                    autoAcceptConnections:false
                });
                logger.addId (parent.config.metaData.webinosName);
                wsServer.on ("request", function (request) {
                    logger.log ("Request for a websocket, origin: " + request.origin + ", host: " + request.host);
                    if (request.host && request.host.split (":") &&
                        (request.host.split(":")[0] === "localhost" || request.host.split(":")[0] === "127.0.0.1")) {
                        var connection = request.accept ();
                        logger.log ("Request accepted");
                        //_parent.pzpWebSocket.connectedApp(connection);
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

    function sendtoClient(msg) {
        var appId;
        for(appId in connectedWebApp) {
            if(connectedWebApp.hasOwnProperty(appId)) {
                msg.to = appId;
                connectedWebApp[appId].sendUTF(JSON.stringify(msg));
            }
        }
    }

    this.sendConnectedApp = function (address, message) {
        if (address && message) {
            if (connectedWebApp.hasOwnProperty (address)) {
                message.from = setInternalParams(message.from);
                message.resp_to = setInternalParams(message.resp_to);
                message.to = setInternalParams(message.to);

                if(message.payload && message.payload.method && message.payload.method.indexOf("servicefound") > -1) {
                    message.payload.params.serviceAddress = setInternalParams(message.payload.params.serviceAddress);
                }

                try {
                    var jsonString = JSON.stringify(message);
                    connectedWebApp[address].socket.pause ();
                    connectedWebApp[address].sendUTF(jsonString);
                } catch (err) {
                    logger.error ("exception in sending message to pzp - " + err);
                } finally {
                    logger.log ('send to web app - ' + address + ' message ' + jsonString);
                    connectedWebApp[address].socket.resume ();
                }
            } else {
                logger.error ("unknown destination " + address);
            }
        } else {
            logger.error ("message or address is missing");
        }
    };
    this.pzhDisconnected = function () {
        var key;
        for (key in connectedWebApp) {
            if (connectedWebApp.hasOwnProperty (key)) {
                var msg = prepMsg (key, "pzhDisconnected", "pzh disconnected");
                self.sendConnectedApp (key, msg);
            }
        }
    }
};

module.exports = PzpWSS;
