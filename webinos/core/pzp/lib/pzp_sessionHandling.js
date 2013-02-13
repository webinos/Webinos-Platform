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
 * Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
 * AUTHORS: Habib Virji (habib.virji@samsung.com), Alexander Futasz, Ziran Sun(ziran.sun@samsung.com)
 *******************************************************************************/

var dependency = require ("find-dependencies") (__dirname);
var util = dependency.global.require (dependency.global.util.location);

var Pzp = function () {
    "use strict";
    var logger = util.webinosLogging (__filename) || console;
    var self = this;
    self.pzp_state = {  // Dynamic state of PZP
        enrolled    :false,
        state       :{"hub":"not_connected", "peer":"not_connected"}, // State is applicable for hub mode but for peer mode, we need to check individually
        connectedPzp:{}, // Stores PZH server details
        connectedPzh:{}, // Stores connected PZP information
        sessionId   :"",
        discoveredPzp: [], // Store Discovered PZP details
        networkAddr: "",
        connectingPeerAddr: ""};
    self.config = {}; // Persistent information
    self.webinos_manager = {}; // Communication with other managers
    self.pzpClient = {};
    self.pzpWebSocket = {};
    var hub;
    var stateListeners = [];

    // Helper functions



    /**
     * Checks current status of certificate present and set hub or virgin mode accordingly
     */
    function checkMode () {
        // Check if it is virgin mode
        if (self.config && (self.config.cert.internal.master.cert && self.config.metaData.pzhId)) {
            self.pzp_state.enrolled = true; // Hub mode
        } else {
            self.pzp_state.mode = false; // Virgin mode
        }
    }

    this.addStateListener = function (listener) {
      if (typeof listener !== "undefined") {
        if (typeof listener.setHubConnected !== "function") {
          listener.setHubConnected = function(isConnected) {};
        }
        if (typeof listener.setPeerConnected !== "function") {
          listener.setPeerConnected = function(isConnected) {};
        }
        stateListeners.push(listener);

        // communicate current state
        listener.setHubConnected(self.pzp_state.state["hub"] === "connected");
        listener.setPeerConnected(self.pzp_state.state["peer"] === "connected");
      }
    };

    this.setConnectState = function (mode, isConnected) {
      self.pzp_state.state[mode] = (isConnected ? "connected" : "not_connected");
      stateListeners.forEach(function(listener) {
        if (mode === "hub") {
          listener.setHubConnected(isConnected);
        } else if (mode === "peer") {
          listener.setPeerConnected(isConnected);
        }
      });
    };

    this.changeFriendlyName = function (name) {
        self.config.metaData.friendlyName = name;
        self.config.storeMetaData (self.config.metaData);
    };

    /**
     * Sets webinos pzp sessionId
     */
    this.setSessionId = function () {
        self.pzp_state.sessionId = self.config.metaData.webinosName;
        if (self.pzp_state.enrolled) {
            self.pzp_state.sessionId = self.config.metaData.pzhId + "/" + self.config.metaData.webinosName;
        }
        logger.addId (self.config.metaData.webinosName);
    };

    /**
     * Sets TLS connection parameters
     * @param callback - Object containing about TLS connection parameters
     */
    this.setConnParam = function (callback) {
        var options;
        self.config.fetchKey (self.config.cert.internal.conn.key_id, function (status, value) {
            if (status) {
                if (self.pzp_state.enrolled) { // enrolled to Hub 
                    var caList = [], crlList = [], key;
                    caList.push(self.config.cert.internal.master.cert);
                    crlList.push(self.config.crl );

                    for ( key in self.config.cert.external) {
                        if(self.config.cert.external.hasOwnProperty(key)) {
                            caList.push(self.config.cert.external[key].cert);
                            crlList.push(self.config.cert.external[key].crl);
                        }
                    }
                    options = {
                        key : value,
                        cert: self.config.cert.internal.conn.cert,
                        crl : crlList,
                        ca  : caList,
                        servername: self.config.metaData.pzhId,
                        rejectUnauthorized: true,
                        requestCert: true
                    };
                }
                else {
                    options = {
                        key               :value,
                        cert              :self.config.cert.internal.conn.cert,
                        servername        :self.config.metaData.serverName,
                        rejectUnauthorized:true,
                        requestCert       :true
                    };
                }
                return callback(options)
            }
        });
    };

    /**
     * Prepares webinos internal message to be sent between webinos endpoints
     * @param from -address of the PZP
     * @param to - address of the entity message is being sent
     * @param status - webinos specific command
     * @param message - message payload
     */
    this.prepMsg = function (from, to, status, message) {
        var msg = {"type":"prop",
            "from"       :from,
            "to"         :to,
            "payload"    :{"status":status,
                "message"          :message}};
        self.sendMessage (msg, to);
    };

    /**
     * It is responsible for sending message to correct entity.Forwards message to either PZH or PZP or Apps
     * @param _message to be sent forward
     * @param _address to forward message
     */
    this.sendMessage = function (_message, _address) {
        if (_message && _address) {
            var jsonString = JSON.stringify (_message);
            var buf = util.webinosMsgProcessing.jsonStr2Buffer (jsonString);
            logger.log ('send to ' + _address + ' message ' + jsonString);

            try {
                if (self.pzp_state.connectedPzp.hasOwnProperty (_address)
                    && self.pzp_state.state["peer"] === "connected") {
                    self.pzp_state.connectedPzp[_address].pause ();
                    self.pzp_state.connectedPzp[_address].write (buf);
                    self.pzp_state.connectedPzp[_address].resume ();
                } else if (self.pzp_state.connectedPzh.hasOwnProperty (_address)
                    && self.pzp_state.enrolled && self.pzp_state.state["hub"] === "connected") {
                    self.pzp_state.connectedPzh[_address].pause ();
                    self.pzp_state.connectedPzh[_address].write (buf);
                    self.pzp_state.connectedPzh[_address].resume ();
                } else { // sending to the app
                    self.pzpWebSocket.sendConnectedApp (_address, _message);
                }
            } catch (err) {
                logger.error ("sending send message" + err);
            }
        } else {
            logger.error ("send message called without message and address field");
        }
    };


    this.sendMessageAll = function (command, payload) {
        var key, msg;
        for (key in self.pzp_state.connectedPzp) {
            if (self.pzp_state.connectedPzp.hasOwnProperty (key)) {
                self.prepMsg (self.pzp_state.sessionId, key, command, payload)
            }
        }

        for (key in self.pzp_state.connectedPzh) {
            if (self.pzp_state.connectedPzh.hasOwnProperty (key)) {
                self.prepMsg (self.pzp_state.sessionId, key, command, payload);
            }
        }
    };
    /**
     * Removes pzp and pzh from the connected list and then updatesApp to update status about connection status
     * @param_ id - identity of the PZP or PZH disconnected
     */
    this.cleanUp = function (_id) {
        var key;
        if (_id) {
            self.webinos_manager.messageHandler.removeRoute (_id, self.pzp_state.sessionId);
            for (key in self.pzp_state.connectedPzp) {
                if (self.pzp_state.connectedPzp.hasOwnProperty (key) && key === _id) {
                    logger.log ("pzp - " + key + " details removed");
                    if (Object.keys (self.pzp_state.connectedPzp) <= 1) self.setConnectState("peer", false);
                    delete self.pzp_state.connectedPzp[key];
                }
            }
            for (key in self.pzp_state.connectedPzh) {
                if (self.pzp_state.connectedPzh.hasOwnProperty (key) && key === _id) {
                    logger.log ("pzh - " + key + " details removed");
                    self.setConnectState("hub", false);
                    delete self.pzp_state.connectedPzh[key];
                }
            }
            self.pzpWebSocket.updateApp ();
            self.pzpWebSocket.pzhDisconnected ();
        }
    };

    /**
     *
     * @param conn
     * @param buffer
     */
    this.handleMsg = function (_conn, _buffer) {
        try {
            _conn.pause (); // This pauses socket, cannot receive messages
            util.webinosMsgProcessing.readJson (self, _buffer, function (obj) {
                self.webinos_manager.processMsg (obj);
            });
        } catch (err) {
            logger.error (err);
        } finally {
            _conn.resume ();// unlocks socket.
        }
    };

    /**
     * Initializes PZP WebSocket Server and then tries connecting with the PZH hub
     * Starting PZP means starting web socket server
     * @param inputConfig - the input configuration includes Provider address, authCode and PZH address
     * @param callback - true or false depending on startup status
     */
    this.initializePzp = function (inputConfig, callback) {
        try {
            util.webinosHostname.getHostName (inputConfig.sessionIdentity, function (_hostname) {
                inputConfig.sessionIdentity = _hostname;
                self.config = new util.webinosConfiguration ();// sets configuration
                self.config.setConfiguration ("Pzp", inputConfig, function (status) {
                    if (status) {
                        checkMode ();   //virgin or hub mode
                        var PzpWebSocket = require ("./pzp_websocket");
                        var WebinosManager = require ("./pzp_otherManager.js");

                        self.setSessionId ();//sets pzp sessionId

                        self.webinos_manager = new WebinosManager (self);
                        self.pzpClient = new PzpClient (self);
                        hub = new ConnectHub (self);
                        self.enrollPzp = new EnrollPzp (self, hub);
                        self.pzpWebSocket = new PzpWebSocket (self);

                        self.pzpWebSocket.startWebSocketServer (function (status, value) {
                            if (status) {
                                self.webinos_manager.initializeRPC_Message (); // Initializes RPC
                                logger.log ("successfully started pzp websocket server ");
                                if (self.pzp_state.enrolled) {
                                    hub.connect (function (status, value) {  // connects hub
                                        if (status) {
                                            logger.log (value);
                                        } else {
                                            logger.error ("connection to PZH failed ");
                                        }
                                    });
                                } else {
                                    self.webinos_manager.setupMessage_RPCHandler ();
                                }
                                return callback (true, self.pzp_state.sessionId, self.config.cert.internal.conn.csr);// retruning csr to make test work
                            } else {
                                return callback (false, value);
                            }
                        });
                    }
                });
            });
        } catch (err) {
            self.state = self.states[0];//disconnected
            return callback (false, err);
        }
    };
};

/**
 * Starts PZP server
 */
var PzpServer = function (_parent) {
    "use strict";
    var logger = util.webinosLogging (__filename + "_PzpServer") || console;
    var tlsServer;

    function pzp_authorization (_conn) {
        var msg, text, clientSessionId;
        text = decodeURIComponent (_conn.getPeerCertificate ().subject.CN);
        var cn = decodeURIComponent(_conn.getPeerCertificate().issuer.CN);
        var n = cn.indexOf(":");
        var cn_part = cn.slice(n + 1);

        // check if in the same zone
        var zoneId = _parent.config.metaData.pzhId;
        if(zoneId.indexOf(cn_part) !=-1)
            var clientSessionId = _parent.config.metaData.pzhId + "/"+ text.split(":")[1];
        else
        {
            var clientSessionId = _parent.config.exCertList.exPZP;
            //clean exPZP
            _parent.config.exCertList.exPZP = "";
        }
        logger.log("Authorised session " + clientSessionId);

        _parent.pzp_state.connectedPzp[clientSessionId] = _conn;
        _parent.setConnectState("peer", true);
        _conn.id = clientSessionId;
        msg = _parent.webinos_manager.messageHandler.registerSender (_parent.pzp_state.sessionId, clientSessionId);
        _parent.sendMessage (msg, clientSessionId);
        logger.log ("pzp server - " + clientSessionId + " connected");
    }

    this.startServer = function () {
        var tls = require ("tls");
        if (tlsServer == null) {
            _parent.setConnParam (function (certConfig) {
                tlsServer = tls.createServer (certConfig, function (conn) {
                    var cn, clientSessionId;
                    if (conn.authorized) {
                        pzp_authorization (conn);
                    } else {
                        logger.error ("pzp server - pzp client connection rejected")
                    }

                    conn.on ("data", function (buffer) {
                        _parent.handleMsg (conn, buffer);
                    });

                    conn.on ("end", function () {
                        logger.log ("pzp server - connection ended with pzp client " + conn.id);
                        _parent.cleanUp (conn.id);
                    });

                    conn.on ("error", function (err) {
                        logger.log ("pzp server -" + err.message);
                    });
                });

                tlsServer.on ("error", function (err) {
                    if (err.code === "EADDRINUSE") {// not starting on next available port as pzp local discovery will not work
                        logger.error ("pzp server - address in use could not start the server");
                    } else {
                        logger.error ("pzp server - " + err.message);
                    }
                });

                tlsServer.on ("listening", function () {
                    logger.log ("pzp server - listening on port :" + _parent.config.userPref.ports.pzp_tlsServer);
                });
                tlsServer.listen (_parent.config.userPref.ports.pzp_tlsServer);
            })
        }

    };
};

/**
 * Connect Peer PZPs. This is either triggered by PZH sending PZPUpdate message or else from PZP local discovery
 * @param msg - msg is an object containing port, address and name of PZP to be connected
 */
var PzpClient = function (_parent) {
    "use strict";
    var logger = util.webinosLogging (__filename + "_PzpClient") || console;

    function pzpClient_Authorized (_msg, _client) {
        var peerSessionId = _msg.name;
        logger.log ("authorized & connected to PZP: " + peerSessionId);
        _parent.pzp_state.connectedPzp[_msg.name] = _client;
        _parent.setConnectState("peer", true);
        _client.id = _msg.name;
        var msg1 = _parent.webinos_manager.messageHandler.registerSender (_parent.pzp_state.sessionId, _msg.name);
        _parent.sendMessage (msg1, _msg.name);
        _parent.pzpWebSocket.updateApp ();
    }

    function pzpClient_PeerCleanup() {
        var path = require("path");
        var fs = require("fs");
        logger.log("Clean up SiB leftovers");
        var own = path.join(_parent.config.metaData.webinosRoot, "keys", "conn.pem");
        var other = path.join(_parent.config.metaData.webinosRoot, "keys", "otherconn.pem");
        var exlist = path.join(_parent.config.metaData.webinosRoot, "exCertList.json");
        if(path.existsSync(own)) {
            fs.unlink(own, function(err){
                if(err) throw err;
                logger.log("removed" + own);
            });
        }
        if(path.existsSync(other)) {
            fs.unlink(other, function(err){
                if(err) throw err;
                logger.log("removed" + other);
            });
        }
        if(path.existsSync(exlist)) {
            fs.unlink(exlist, function(err){
                if(err) throw err;
                logger.log("removed" + exlist);
            });
        }
        _parent.pzp_state.connectingPeerAddr = "";
    }

    this.connectPeer = function (msg) {
        _parent.setConnParam (function (options) {
            var name = msg.name;
            var n;
            if(name && (n = name.indexOf("/")))
            {
                options.servername = name.substring(0, n);
                logger.log("servername: " + options.servername);
            }

            var servername = msg.address;
            var client = require("tls").connect(_parent.config.userPref.ports.pzp_tlsServer, servername, options, function () {
                if (client.authorized) {
                    pzpClient_Authorized(msg, client);
                    pzpClient_PeerCleanup();
                } else {
                    logger.error("pzp client - connection failed, " + client.authorizationError);
                }
            });

            client.on("data", function (buffer) {
                _parent.handleMsg(client, buffer);
            });

            client.on("end", function () {
                _parent.cleanUp(client.id);
            });

            client.on("error", function (err) {
                logger.error("pzp client - " + err.message);
            });
        });
    }
};

/**
 * Connects with PZH and handle respective events
 * @param callback is called after connection is useful or fails to inform startPzp
 */
var ConnectHub = function (_parent) {
    "use strict";
    var self = this;
    var logger = util.webinosLogging (__filename + "_ConnectHub") || console;
    var pzpServer = new PzpServer (_parent);

    /**
     * If PZP fails to connect to PZH, this tries to connect back to PZH
     */
    function retryConnecting () {
        if (_parent.pzp_state.enrolled) {
            setTimeout (function () {
                self.connect (function (status) {
                    logger.log ("retrying to connect back to the PZH " + (status ? "successful" : "failed"));
                });
            }, 60000);//increase time limit to suggest when it should retry connecting back to the PZH
        }
    }

    /**
     * PZH connected details are stored in this function
     * @param conn - connection object of the tls client
     * @param callback - returns true or false depending on the PZH connected status
     */
    function authenticated (conn, callback) {
        if (!_parent.pzp_state.connectedPzh.hasOwnProperty (_parent.pzp_state.sessionId)) {
            _parent.setSessionId ();
            _parent.pzp_state.connectedPzh[_parent.config.metaData.pzhId] = conn;
            _parent.setConnectState("hub", true);
            conn.id = _parent.config.metaData.pzhId;
            _parent.webinos_manager.startOtherManagers ();
            pzpServer.startServer ();
            _parent.pzpWebSocket.updateApp ();//updates webinos clients
            callback (true, "pzp " + _parent.pzp_state.sessionId + " connected to " + _parent.config.metaData.pzhId);
        } else {
            callback (false, "pzh already connected");
        }
    }

    /**
     * @param conn - Socket connection object of the PZH
     * @param code  - Authorization code of the PZP
     * @param callback-  returns back true or false depending on the error
     * @return {*} callback function if not successful
     */
    function unauthenticated (conn, callback) {
        try {
            logger.log ("not authenticated " + conn.authorizationError);
            if (conn.authorizationError === 'CERT_NOT_YET_VALID') {
                return callback (false, "possible clock difference between PZH and your PZP, try updating time and try again")
            }
            return callback (false);
        } catch (err) {
            conn.socket.end ();
            return callback (false, "failed sending client certificate to the PZH");
        }
    }

    /**
     * Calls authenticated or unauthenticated function respectively
     * @param pzpClient - socket information about the
     * @param code - authorization code generated by the PZH
     * @param callback - called from the enrolledPzp or initializePzp function
     */
    function handleAuthorization (pzpClient, callback) {
        logger.log ("connection to pzh status: " + pzpClient.authorized);
        if (pzpClient.authorized) {
            authenticated (pzpClient, callback);
        } else {
            unauthenticated (pzpClient, callback);
        }
    }

    this.connect = function (_callback) {
        var pzpClient, master, options = {};
        var tls = require ("tls");
        try {
            _parent.setConnParam (function (options) {
                options.pzpServerPort = _parent.config.userPref.ports.pzp_tlsServer;
                pzpClient = tls.connect (_parent.config.userPref.ports.provider, _parent.config.metaData.serverName, options, function (conn) {
                    handleAuthorization (pzpClient, _callback);
                });

                pzpClient.on ("data", function (buffer) {
                    _parent.handleMsg (pzpClient, buffer);
                });

                pzpClient.on ("end", function () {
                    _parent.cleanUp (pzpClient.id);
                    retryConnecting ();
                });

                pzpClient.on ("error", function (err) {
                    pzpServer.startServer ();
                    if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
                        logger.error ("Connect  attempt to YOUR PZH " + _parent.config.metaData.pzhId + " failed.");
                        _parent.webinos_manager.startOtherManagers ();
                    } else {
                        logger.error (err);
                    }
                });
            });
        } catch (err) {
            logger.error ("Connect Hub - general error : " + err);
        }
    }
};
/**
 * EnrollPZP stores signed certificate information from the PZH and then triggers connectHub function
 * @param from - Contains PZH Id
 * @param to - Contains PZP Id
 * @param clientCert - Signed PZP certificate from the PZH
 * @param masterCert - PZH master certificate
 * @param masterCrl  -  PZH master CRL
 */
var EnrollPzp = function (_parent, hub) {
    var logger = util.webinosLogging (__filename + "_EnrollPzp") || console;
    this.register = function (_from, _clientCert, _masterCert, _masterCrl) {
        logger.log ("PZP ENROLLED AT  " + _from);    // This message come from PZH web server over websocket
        _parent.config.cert.internal.conn.cert = _clientCert;
        _parent.config.cert.internal.master.cert = _masterCert;
        _parent.config.crl = _masterCrl;
        _parent.config.metaData.pzhId = _from;
        _parent.config.metaData.serverName = _from && _from.split ("_")[0];
        if (_from.indexOf (":") !== -1) {
            _parent.config.metaData.serverName = _parent.config.metaData.serverName.split (":")[0];
        }

        if (!_parent.config.trustedList.pzh.hasOwnProperty (_parent.config.metaData.pzhId)) {
            _parent.config.trustedList.pzh[_parent.config.metaData.pzhId] = {"addr":"", "port":""};
        }
        _parent.config.storeMetaData (_parent.config.metaData);
        _parent.config.storeAll ();

        _parent.pzp_state.enrolled = true; // Moved from Virgin mode to hub mode

        hub.connect (function (status) {
            if (status) {
                logger.log ("successfully connected to the PZH ")
            } else {
                logger.error ("connection to the PZH unsuccessful")
            }
        });
    };
};

var pzpInstance;
exports.initializePzp = function (config, pzpModules, callback) {
    pzpInstance = new Pzp ();
    pzpInstance.initializePzp (config, pzpModules, function (status, result) {
        if (status) {
            logger.log ("initialized pzp");
            callback (true);
        } else {
            callback (false);
        }
    });
};

exports.getSessionId = function () {
    return pzpInstance.pzp_state.sessionId;
};

exports.getWebinosPath = function () {
    return pzpInstance.config.metaData.webinosRoot;
};

exports.getWebinosPorts = function () {
    return { pzp_webSocket:pzpInstance.config.userPref.ports.pzp_webSocket }
};
