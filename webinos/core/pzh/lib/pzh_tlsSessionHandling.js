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
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/

/**
 * Creates a new Pzh object
 * @constructor
 */
var Pzh = function () {
    "use strict";
    var dependency = require ("find-dependencies") (__dirname);
    var util = dependency.global.require (dependency.global.util.location);
    var logging = util.webinosLogging || console;
    var auth_code = require ("./pzh_authcode");
    var pzh_otherManager = require ("./pzh_otherManager");

    var self = this;
    self.pzh_otherManager = "";
    self.pzp_pzh = {};
    self.config = {};// Holds PZH Configuration, it is persistent data
    self.pzh_state = {
        sessionId   :"", // Holds PZH Session Id
        connectedPzp:{}, // Holds connected PZP information such as IP address and socket connection
        connectedPzh:{},
        expecting   :"", // Set by auth-code directly
        logger      :logging (__filename),
        connectedDevicesToOtherPzh: {pzh:{}, pzp:{}}
    };

    function getConnectedList(type) {
        var connList=[], key, list = (type === "pzp") ? self.pzh_state.connectedPzp: self.pzh_state.connectedPzh;
        for (key in list) {
            if (list.hasOwnProperty(key)) {
                connList.push({friendlyName: list[key].friendlyName, key: key});
            }
        }
        list = (type === "pzp") ? self.pzh_state.connectedDevicesToOtherPzh.pzp:self.pzh_state.connectedDevicesToOtherPzh.pzh;
        for (key in list) {
            if (list.hasOwnProperty(key)) {
                connList.push({friendlyName: list[key], key: key});
            }
        }
        return connList;
    }
    this.sendUpdateToAll = function(from) {
        var key, msg, payload = {friendlyName: self.config.metaData.friendlyName,
            connectedPzp: getConnectedList("pzp"),
            connectedPzh: getConnectedList("pzh")};

        for (key in self.pzh_state.connectedPzp) {
            if (self.pzh_state.connectedPzp.hasOwnProperty(key)) {
                msg = self.prepMsg(key, "update", payload);
                self.sendMessage (msg, key);
            }
        }
        for (key in self.pzh_state.connectedPzh) {
            if (from !== key && self.pzh_state.connectedPzh.hasOwnProperty(key)) {
                msg = self.prepMsg(key, "update", payload);
                self.sendMessage (msg, key);
            }
        }
    };
    /**
     * PZP once authorized, following steps are involved:
     * 1. Details are stored in connectedPZP
     * 2. registering with message handler
     * 3. Sending PZP and PZH update
     * 4. Synchronization of files
     * @param _pzpId
     * @param _conn
     */
    function handlePzpAuthorization (_pzpId, _conn) {
        var msg;
        _pzpId = self.config.metaData.serverName + "/" + _pzpId;
        if (self.config.trustedList.pzp.hasOwnProperty (_pzpId)) {
            self.pzh_state.logger.log ("pzp " + _pzpId + "  connected");
            self.pzh_state.connectedPzp[_pzpId] = {"socket":_conn, "address":_conn.socket.remoteAddress};
            if (self.config.trustedList.pzp[_pzpId].addr !== _conn.socket.remoteAddress) {
                self.config.trustedList.pzp[_pzpId].addr = _conn.socket.remoteAddress;
                self.config.storeDetails(null, "trustedList", self.config.trustedList);
            }
            _conn.id = _pzpId;
            msg = self.pzh_otherManager.messageHandler.createRegisterMessage (self.pzh_state.sessionId, _pzpId);
            self.sendMessage (msg, _pzpId);
            self.sendUpdateToAll(self.pzh_state.sessionId);
            self.pzh_otherManager.syncStart(_pzpId);
        } else {
            logger.error ("unregistered pzp " + _pzpId + " trying to connect");
            _conn.socket.end();
        }
    }

    /**
     * This function is used both by PZH connecting and PZH acting as Server
     * PZH once authorized, following functionality are done
     * 1. Storing information in connectedPZH
     * 2. Registering with the message handler
     * 3. Sending connected PZH details across PZH
     * @param _pzhId
     * @param _conn
     */
    this.handlePzhAuthorization = function (_pzhId, _conn) {
        var otherPzh = [], msg, localServices;
        if (_pzhId) {
            if (!self.pzh_state.connectedPzh.hasOwnProperty (_pzhId)) {
                self.pzh_state.logger.log ("pzh " + _pzhId + " connected");
                self.pzh_state.connectedPzh[_pzhId] = {"socket":_conn, "address":_conn.socket.remoteAddress};
                _conn.id = _pzhId;

                setTimeout (function () {
                    msg = self.pzh_otherManager.messageHandler.createRegisterMessage(self.config.metaData.serverName, _pzhId);
                    self.sendMessage (msg, _pzhId);
                    self.sendUpdateToAll(self.pzh_state.sessionId);
                    self.pzh_otherManager.registerServices (_pzhId);
                }, 3000);
            } else {
                self.pzh_state.logger.log ("pzh -" + _pzhId + " already connected");
            }
        }
    };
    /**
     * Responsible for handling authorized pzh and pzp. The main part of this function are processing if the connection
     * is from a PZH or a PZP
     * @param {Object} _conn - Connection object when any new connection is accepted.
     */
    this.handleConnectionAuthorization = function (_conn) {
        if (_conn.authorized === false) {// Allows PZP to connect if it has proper QRCode
            self.pzh_state.logger.log (" connection NOT authorised at pzh - " + _conn.authorizationError);
            _conn.socket.end ();
        }

        if (_conn.authorized) {// PZP/PZH connecting with proper certificate at both ends
            var cn, name;
            self.pzh_state.logger.log ("connection authorised at pzh");
            try {
                cn = decodeURIComponent (_conn.getPeerCertificate ().subject.CN);// Get peer common name from the certificate
                cn = cn.split (":");
            } catch (err) {
                self.pzh_state.logger.error ("exception in reading common name of peer pzh certificate " + err);
                return;
            }

            if (cn[0] === "Pzh") {
                cn = _conn.getPeerCertificate ().subjectaltname.split (":");
                if (cn.length > 2) {
                    name = cn[1] + ":" + cn[2];
                } else {
                    name = cn [1];
                }
                self.handlePzhAuthorization (name, _conn);
            } else if (cn[0] === "Pzp") {
                handlePzpAuthorization (cn[1], _conn);
            }
        }
    };

    /**
     * Helper function - prepares prop message to send between entities in webinos framework
     * @param _from - Session Id of the entity sending message
     * @param _to - Session id of the entity that message is destined to
     * @param _status - Webinos command that other end can interpret
     * @param _message - Message payload
     * @return {Object} - Message represented in format other end can interpret
     */
    this.prepMsg = function (_to, _status, _message) {
        return {"type":"prop",
            "from"    :self.pzh_state.sessionId,
            "to"      :_to,
            "payload" :{"status":_status, "message":_message}
        };
    };

    /**
     * Sends the message over socket to connected endpoints
     * @param _message [mandatory]- JSON-RPC message or PROP message send to the PZH/P
     * @param _address [mandatory]- SessionId of the connected endpoints
     */
    this.sendMessage = function (_message, _address) {
        if (_message && _address) {
            var jsonString = JSON.stringify (_message);
            var buf = util.webinosMsgProcessing.jsonStr2Buffer (jsonString);
            if (self.pzh_state.connectedPzh.hasOwnProperty (_address)) {// If it is connected to pzh it will land here
                try {
                    self.pzh_state.connectedPzh[_address].socket.pause ();
                    self.pzh_state.connectedPzh[_address].socket.write (buf);
                } catch (err) {
                    self.pzh_state.logger.error ("exception in sending message to pzh -" + err);
                } finally {
                    self.pzh_state.logger.log ("send to pzh - " + _address + " message " + jsonString);
                    self.pzh_state.connectedPzh[_address].socket.resume ();
                }
            } else if (self.pzh_state.connectedPzp.hasOwnProperty (_address)) {
                try {
                    self.pzh_state.connectedPzp[_address].socket.pause ();
                    self.pzh_state.connectedPzp[_address].socket.write (buf);
                } catch (err) {
                    self.pzh_state.logger.error ("exception in sending message to pzp " + err);
                } finally {
                    self.pzh_state.logger.log ("send to pzp - " + _address + " message " + jsonString);
                    self.pzh_state.connectedPzp[_address].socket.resume ();
                }
            } else {// It is similar to PZP connecting to PZH but instead it is PZH to PZH connection
                self.pzh_state.logger.log (_address + " is not connected either as pzh or pzp");
            }
        } else {
            self.pzh_state.logger.error ("sendMessage called without proper parameters, message will not be sent");
        }
    };
    /**
     * Helper function is used by PZH connecting to other PZHs. It is also used
     * the PZH Server to set TLS configuration
     * It is very important function as TLS server is dictated via value set here
     * 1. It includes CRL list of all Trusted PZH
     * 2. It includes list of all CA certificates
     * 3. Request certificate enables mutual authentication
     * 4. Reject unauthorized disconnects any PZH which does not have proper certificate
     * @return _callback - Callback with TLS configuration parameters
     */
    this.setConnParam = function (_callback) {
        self.config.fetchKey (self.config.cert.internal.conn.key_id, function (status, value) {
            if (status) {
                var caList = [], crlList = [], key;

                caList.push (self.config.cert.internal.master.cert);
                crlList.push (self.config.crl.value);
                for (key in self.config.cert.internal.signedCert) {
                    if (self.config.cert.internal.signedCert.hasOwnProperty (key)) {
                        caList.push (self.config.cert.internal.signedCert[key]);
                    }
                }
                for (key in self.config.cert.external) {
                    if (self.config.cert.external.hasOwnProperty (key)) {
                        caList.push (self.config.cert.external[key].externalCerts);
                        crlList.push (self.config.cert.external[key].externalCrl);
                    }
                }
                // Certificate parameters that will be added in SNI context of farm
                _callback (true, {
                    key               :value,
                    cert              :self.config.cert.internal.conn.cert,
                    ca                :caList,
                    //crl               :crlList,
                    requestCert       :true,
                    rejectUnauthorized:true
                });
            } else {
                _callback (false, {});
            }
        });
    };
    /**
     * Calls processmsg to handle incoming message to PZH. This is called by PZH provider
     * @param {Object} _conn - Socket connection details of client socket ..
     * @param {Buffer} _buffer - Incoming data received from other PZH or PZP
     */
    this.handleData = function (_conn, _buffer) {
        try {
            _conn.pause ();
            util.webinosMsgProcessing.readJson (self.pzh_state.sessionId, _buffer, function (obj) {
                self.pzh_otherManager.processMsg (obj);
            });
        } catch (err) {
            self.pzh_state.logger.error ("exception in processing received message " + err);
            _conn.resume();
        } finally {
            _conn.resume ();
        }
    };
    /**
     * Removes PZH and PZP that has socket disconnect
     * @param _id - sessionId
     */
    this.removeRoute = function (_id) {
        if(_id) {
            logger.log ("removing route for " + _id);
            if (self.pzh_state.connectedPzp.hasOwnProperty (_id)) {
                self.pzh_otherManager.messageHandler.removeRoute (_id, self.config.metaData.serverName);
                delete self.pzh_state.connectedPzp[_id];
            }
            if (self.pzh_state.connectedPzh.hasOwnProperty (_id)) {
                self.pzh_otherManager.messageHandler.removeRoute (_id, self.config.metaData.serverName);
                delete self.pzh_state.connectedPzh[_id];
            }
            self.pzh_otherManager.discovery.removeRemoteServiceObjects (_id);
        }
        self.sendUpdateToAll(_id);
        self.pzh_otherManager.discovery.removeRemoteServiceObjects (_id);
    };
    /**
     * Delete PZH from the trusted list
     * @param id
     */
    this.removePzh = function(id, refreshCert, callback) {
        // Disconnection is a special case if PZH is already connected..
        if (self.pzh_state.connectedPzh[id]) {
            self.pzh_state.connectedPzh[id].socket.end();
            logger.log("connection with "+id+" terminated as user wishes to remove this PZH");
            delete self.pzh_state.connectedPzh[id];
            self.setConnParam (function (status, options) {
                if (status) {
                    refreshCert (self.config.metaData.serverName, options);
                }
            });
        }
        if (self.config.trustedList.pzh[id]) {
            delete self.config.trustedList.pzh[id];
            self.config.storeDetails(null, "trustedList", self.config.trustedList);
            //self.config.storeDetails(null, "trustedList", self.config.trustedList);
            logger.log("removed pzh "+ id+" from the trusted list ");
            if (self.config.cert.external[id]) {
                delete self.config.cert.external[id];
                self.config.storeDetails(require("path").join("certificates", "external"), "certificates",
                                         self.config.cert.external);
                logger.log("removed pzh "+ id+" certificate details ");
            }
            for (var key in self.pzh_state.connectedPzp) {
                if (self.pzh_state.connectedPzp.hasOwnProperty(key)) {
                    self.pzh_otherManager.syncStart(key);
                }
            }
            callback(true);
        } else {
            callback(false);
        }
    };
    /**
     * ADDs PZH in a provider
     * @param _friendlyName this name is used for creating configuration
     * @param _uri pzh url you want to add, assumption it is of form pzh.webinos.org/bob@webinos.org
     * @param _user details of the owner of the PZH
     * @param _callback returns instance of PZH
     */
    this.addLoadPzh = function (_friendlyName, _uri, _user, _callback) {
        try {
            auth_code.createAuthCounter (function (res) {
                self.pzh_state.expecting = res;
            });
            var inputConfig = {
                "friendlyName"   :_friendlyName,
                "sessionIdentity":_uri,
                "user"           :_user
            };
            self.config = new util.webinosConfiguration ();
            self.config.setConfiguration ("Pzh", inputConfig, function (status, value) {
                if (status) {
                    self.pzh_state.sessionId = _uri;
                    self.pzh_state.logger.addId (self.config.userData.email[0].value);
                    self.pzh_otherManager = new pzh_otherManager (self);
                    self.pzh_pzh = new Pzh_Pzh (self);
                    self.revoke = new RevokePzp (self);
                    self.enroll = new AddPzp (self);
                    self.pzh_otherManager.setMessageHandler_RPC ();
                    self.setConnParam (function (status, options) {
                        return _callback (true, options, _uri);
                    });
                } else {
                    return _callback (false, value);
                }
            });
        } catch (err) {
            console.log (err);
        }
    };
};
module.exports = Pzh;

var Pzh_Pzh = function (parent) {
    var self = this;
    this.connect_ConnectedPzh = function (options) {
        var myKey;
        for (myKey in  parent.config.trustedList.pzh) {
            if (!parent.pzh_state.connectedPzh.hasOwnProperty (myKey) && parent.pzh_state.sessionId !== myKey) {
                self.connectOtherPZH (myKey, options);
            }
        }
    };

    this.connectOtherPZH = function (_to, _options) {
        try {
            var pzhDetails = parent.config.cert.external[_to];
            var connPzh, connDetails;
            var tls = require ("tls"), host = pzhDetails.host;
            if (parseInt (pzhDetails.port) !== 443) {
                host = pzhDetails.host + ":" + pzhDetails.port;
            }
            connDetails = _options;
            connDetails.servername = _to;
            connDetails.host = pzhDetails.host;
            connDetails.port = pzhDetails.serverPort; //parseInt(pzhDetails.port);
            parent.pzh_state.logger.log ("connection from " + parent.pzh_state.sessionId + " - to " + connDetails.servername + " initiated");
            parent.pzh_state.logger.log ("connection at " + connDetails.host + " and port " + connDetails.port);
            connPzh = tls.connect (connDetails, function () {
                parent.pzh_state.logger.log ("connection status : " + connPzh.authorized);
                if (connPzh.authorized) {
                    parent.pzh_state.logger.log ("connected to " + _to);
                    parent.handlePzhAuthorization (_to, connPzh);
                } else {
                    parent.pzh_state.logger.error ("connection authorization Failed - " + connPzh.authorizationError);
                }
            });
            connPzh.on ("data", function (buffer) {
                parent.handleData (connPzh, buffer);
            });
            connPzh.on ("error", function (err) {
                parent.pzh_state.logger.error (err.message);
            });
            connPzh.on ("end", function () {
                parent.removeRoute (connPzh.id);
            });
        } catch (err) {
            parent.pzh_state.logger.error ("connecting other pzh failed in setting configuration " + err);
        }
    };
};

var RevokePzp = function (parent) {
    /**
     * Removes a PZP from the PZH
     * @param _pzpid
     * @param _refreshCert
     * @param _callback
     */
    this.revokeCert = function (_pzpid, _refreshCert, _callback) {
        var pzpCert = parent.config.cert.internal.signedCert[_pzpid];
        parent.config.revokeClientCert (pzpCert, function (status, crl) {
            if (status) {
                parent.pzh_state.logger.log ("revocation success! " + _pzpid + " should not be able to connect anymore ");
                parent.config.crl = crl;
                delete parent.config.cert.internal.signedCert[_pzpid];
                delete parent.config.trustedList.pzp[_pzpid];
                parent.config.cert.internal.revokedCert[_pzpid] = crl;
                parent.config.storeAll ();
                if (parent.pzh_state.connectedPzp[_pzpid]) {
                    parent.pzh_state.connectedPzp[_pzpid].socket.end ();
                    delete parent.pzh_state.connectedPzp[_pzpid];
                }
                parent.setConnParam (function (status, options) {
                    if (status) {
                        _refreshCert (parent.config.metaData.serverName, options);
                    }
                });
                _callback ({cmd:"revokePzp", to:parent.config.metaData.serverName, payload:_pzpid});
            } else {
                _callback ({cmd:"revokePzp", to:parent.config.metaData.serverName, payload:"failed"});
            }
        });
    };
};

var AddPzp = function (parent) {
    /**
     * Adds new PZP certificate. This is triggered by client, which sends its csr certificate and PZH signs
     * certificate and return backs a signed PZP certificate.
     * @param {Object} _msgRcvd It its is an object holding received message.
     * @param {Function} _callback function called once PZP signature are signed
     */
    this.addNewPZPCert = function (_msgRcvd, refreshCert, _callback) {
        try {
            var pzpId = parent.pzh_state.sessionId + "/" + _msgRcvd.message.from, msg;
            if (parent.config.cert.internal.revokedCert[pzpId]) {
                msg = parent.prepMsg(pzpId, "error", "pzp was previously revoked");
                _callback (false, msg);
                return;
            }
            if (parent.config.trustedList.pzp[pzpId]) {
                // Either PZP is already registered or else there is a name clash,,
                // Lets assume there is name clash
                pzpId = pzpId + Math.round((Math.random() * 100));
                if (parent.config.trustedList.pzp[pzpId]) {
                    this.addNewPzpCert(_msgRcvd, _callback); // Random failed to generate something unique, regenerate id
                }
            }
            parent.pzh_state.expecting.isExpectedCode (_msgRcvd.message.code, function (expected) { // Check QRCode if it is valid ..
                if (expected) {
                    parent.config.generateSignedCertificate (_msgRcvd.message.csr, function (status, value) { // Sign certificate based on received csr from client.// pzp = 2
                        if (status) { // unset expected QRCode
                            parent.config.cert.internal.signedCert[pzpId] = value;
                            parent.pzh_state.expecting.unsetExpected (function () {
                                parent.config.storeDetails(require("path").join("certificates", "internal"), "certificates", parent.config.cert.internal);
                                if (!parent.config.trustedList.pzp.hasOwnProperty (pzpId)) {// update configuration with signed certificate details ..
                                    parent.config.trustedList.pzp[pzpId] = {addr:"", port:""};
                                    parent.config.storeDetails(null, "trustedList", parent.config.trustedList);
                                }
                                // Add PZP in list of master certificates as PZP will sign connection certificate at its end.
                                parent.setConnParam(function(status, options){
                                    if (status) {
                                        refreshCert(parent.pzh_state.sessionId, options);
                                        // Send signed certificate and master certificate to PZP
                                        var payload = {"clientCert":parent.config.cert.internal.signedCert[pzpId],
                                                    "masterCert":parent.config.cert.internal.master.cert,
                                                    "masterCrl" :parent.config.crl.value};
                                        msg = parent.prepMsg (pzpId,"signedCertByPzh", payload);
                                        _callback (true, msg);
                                    }
                                });
                            });
                        } else {
                            msg = parent.prepMsg(_msgRcvd.message.from, "error", value);
                            _callback (false, msg);
                        }
                    });
                } else {
                    msg = parent.prepMsg(_msgRcvd.message.from, "error", "not expecting new pzp");
                    _callback (false, msg);// Fail message
                }
            });
        } catch (err) {
            parent.pzh_state.logger.error ("error signing client certificate" + err);
            msg = parent.prepMsg(_msgRcvd.message.from, "error", err.message);
            _callback (false, msg);
        }
    };
};
