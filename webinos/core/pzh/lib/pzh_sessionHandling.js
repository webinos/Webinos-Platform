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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
*******************************************************************************/

/**
 *
 * @type {*}
 */
var tls = require("tls"),
  fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  util = require("util");

try {
  var dependency = require("find-dependencies")(__dirname);
  var logging = dependency.global.require(dependency.global.util.location, "lib/logging.js") || console;
  var session = dependency.global.require(dependency.global.pzp.location, "lib/session.js");
  var auth_code = require("./pzh_authcode");
  var pzh_otherManager = require("./pzh_otherManager");
} catch (err) {
  console.log("webinos modules missing, please check webinos installation" + err);
  return;
}

/**
* Creates a new Pzh object
* @constructor
*/
var Pzh = function () {
  "use strict";
  var self              = this;
  self.pzh_otherManager = "";
  self.pzp_pzh          = {};
  self.config           = {};// Holds PZH Configuration, it is persistent data
  self.pzh_state = {
    sessionId   : "", // Holds PZH Session Id
    connectedPzp: {},// Holds connected PZP information such as IP address and socket connection
    connectedPzh: {},
    expecting   : "", // Set by auth-code directly
    logger      :new logging(__filename)
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
  function handlePzpAuthorization(_pzpId, _conn) {
    var msg;
    _pzpId = self.config.metaData.serverName + "/" + _pzpId;
    if (self.config.trustedList.pzp.hasOwnProperty(_pzpId)) {
      self.pzh_state.logger.log("pzp " + _pzpId + "  connected");
      self.pzh_state.connectedPzp[_pzpId] = {"socket": _conn,  "address": _conn.socket.remoteAddress};
      if (self.config.trustedList.pzp[_pzpId].addr !== _conn.socket.remoteAddress) {
        self.config.trustedList.pzp[_pzpId].addr = _conn.socket.remoteAddress;
        self.config.storeTrustedList(self.config.trustedList);
      }
      console.log(self.config.trustedList.pzp);
      _conn.id = _pzpId;
      msg = self.pzh_otherManager.messageHandler.registerSender(self.pzh_state.sessionId, _pzpId);
      self.sendMessage(msg, _pzpId);
      self.pzh_otherManager.syncStart(_pzpId);
    } else {
      logger.error("unknown pzp " + _pzpId + " trying to connect")
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
  this.handlePzhAuthorization = function(_pzhId, _conn) {
    var  otherPzh = [], msg, localServices;
    if (!self.pzh_state.connectedPzh.hasOwnProperty(_pzhId)) {
      self.pzh_state.logger.log("pzh " + _pzhId+" connected");
      self.pzh_state.connectedPzh[_pzhId] = {"socket": _conn,  "address": _conn.socket.remoteAddress};
      _conn.id = _pzhId;

      msg = self.pzh_otherManager.messageHandler.registerSender(self.config.metaData.serverName, _pzhId);
      self.sendMessage(msg, _pzhId);

    } else {
      self.pzh_state.logger.log("pzh -" + _pzhId + " already connected");
    }
  };
  /**
   * Responsible for handling authorized pzh and pzp. The main part of this function are processing if the connection
   * is from a PZH or a PZP
   * @param {Object} _conn - Connection object when any new connection is accepted.
   */
  this.handleConnectionAuthorization = function(_conn) {
    if(_conn.authorized === false) {// Allows PZP to connect if it has proper QRCode
      self.pzh_state.logger.log(" connection NOT authorised at pzh - " +  _conn.authorizationError);
      _conn.socket.end();
    }

    if(_conn.authorized) {// PZP/PZH connecting with proper certificate at both ends
      var cn;
      self.pzh_state.logger.log("connection authorised at pzh");
      try {
        cn = decodeURIComponent(_conn.getPeerCertificate().subject.CN);// Get peer common name from the certificate
        cn = cn.split(":");
      } catch(err) {
        self.pzh_state.logger.error("exception in reading common name of peer pzh certificate " + err);
        return;
      }

      if(cn[0] === "Pzh" ) {
        cn = _conn.getPeerCertificate().subjectaltname.split(":");
        self.handlePzhAuthorization(cn[1], _conn);
      } else if(cn[0] === "Pzp" ) {
        handlePzpAuthorization(cn[1], _conn);
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
  this.prepMsg = function(_from, _to, _status, _message) {
    return {"type"  : "prop",
        "from" : _from,
        "to"   : _to,
        "payload" : {"status" : _status, "message" : _message}
    };
  };

  /**
   * Sends the message over socket to connected endpoints
   * @param _message [mandatory]- JSON-RPC message or PROP message send to the PZH/P
   * @param _address [mandatory]- SessionId of the connected endpoints
   */
  this.sendMessage = function(_message, _address) {
    if (_message && _address){
      var jsonString = JSON.stringify(_message);
      var buf = session.common.jsonStr2Buffer(jsonString);

      self.pzh_state.logger.log("send to "+ _address + " _message " + jsonString);

      try {
        if (self.pzh_state.connectedPzh.hasOwnProperty(_address)) {// If it is connected to pzh it will land here
          self.pzh_state.connectedPzh[_address].socket.pause();
          self.pzh_state.connectedPzh[_address].socket.write(buf);
          self.pzh_state.connectedPzh[_address].socket.resume();
        } else if (self.pzh_state.connectedPzp.hasOwnProperty(_address)) {
          self.pzh_state.connectedPzp[_address].socket.pause();
          self.pzh_state.connectedPzp[_address].socket.write(buf);
          self.pzh_state.connectedPzp[_address].socket.resume();
        } else {// It is similar to PZP connecting to PZH but instead it is PZH to PZH connection
          self.pzh_state.logger.log("client " + _address + " is not connected");
        }
      } catch(err) {
        self.pzh_state.logger.error("exception in sending packet " + err);
      }
    } else {
      self.pzh_state.logger.error("sendMessage called without proper parameters, message will not be sent");
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
  this.setConnParam = function(_callback) {
    self.config.fetchKey(self.config.cert.internal.conn.key_id, function(status, value){
      if(status){
        var caList = [], crlList = [], key;

        caList.push(self.config.cert.internal.master.cert);
        crlList.push(self.config.crl);

        for ( key in self.config.cert.external) {
          if(self.config.cert.external.hasOwnProperty(key)) {
            caList.push(self.config.cert.external[key].cert);
            crlList.push(self.config.cert.external[key].crl);
          }
        }
        // Certificate parameters that will be added in SNI context of farm
        _callback(true, {
          key  : value,
          cert : self.config.cert.internal.conn.cert,
          ca   : caList,
          crl  : crlList,
          requestCert: true,
          rejectUnauthorized: true
        });
      } else {
        _callback(false, {});
      }
    });
  };
  /**
   * Calls processmsg to handle incoming message to PZH. This is called by PZH provider
   * @param {Object} _conn - Socket connection details of client socket ..
   * @param {Buffer} _buffer - Incoming data received from other PZH or PZP
   */
  this.handleData=function(_conn, _buffer) {
    try {
      _conn.pause();
      session.common.readJson(self, _buffer, function(obj) {
        self.pzh_otherManager.processMsg(obj);
      });
    } catch (err) {
      self.pzh_state.logger.error("exception in processing received message " + err);
    } finally {
      _conn.resume();
    }
  };
  /**
   * Removes PZH and PZP that has socket disconnect
   * @param _id - sessionId
   */
  this.removeRoute = function(_id) {
    if (self.pzh_state.connectedPzp.hasOwnProperty(_id)) {
      self.pzh_otherManager.messageHandler.removeRoute(_id, self.config.metaData.serverName);
      delete self.pzh_state.connectedPzp[_id];
    }
    if (self.pzh_state.connectedPzh.hasOwnProperty(_id)) {
      self.pzh_otherManager.messageHandler.removeRoute(_id, self.config.metaData.serverName);
      delete self.pzh_state.connectedPzh[_id];
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
    auth_code.createAuthCounter(function (res) {
      self.pzh_state.expecting = res;
    });
    var inputConfig = {
      "friendlyName": _friendlyName,
      "sessionIdentity": _uri
    };
    self.config  = new session.configuration();
    self.config.setConfiguration("Pzh", inputConfig, function (status, value) {
      if (status) {
        self.config.storeUserDetails(_user);
        self.pzh_state.sessionId = _uri;
        self.pzh_state.logger.addId(self.config.userData.email);
        self.pzh_otherManager = new pzh_otherManager(self);
        self.pzh_pzh = new Pzh_Pzh(self);
        self.revoke  = new RevokePzh(self);
        self.enroll  = new AddPzp(self);
        self.pzh_otherManager.setMessageHandler_RPC();
        self.setConnParam(function(status, options){
          self.pzh_pzh.connect_ConnectedPzh(options);
          return _callback(true, options, _uri);
        });
      } else {
        return _callback(false, value);
      }
    });
  };
};
module.exports = Pzh;

var Pzh_Pzh = function(_parent){
  var self    = this;
  var pzh_pzh = require("../web/pzh_pzh_certificateExchange.js");

  this.connect_ConnectedPzh = function(options) {
    var myKey;
    for (myKey in  _parent.config.trustedList.pzh) {
      if (!_parent.pzh_state.connectedPzh.hasOwnProperty(myKey) && _parent.pzh_state.sessionId !== myKey) {
        self.connectOtherPZH(myKey, options, function(status, errorDetails) {
          if (!status) {
            _parent.pzh_state.logger.error("connecting to pzh failed - due to" + errorDetails);
          }
        });
      }
    }
  };

  /**
   *
   * @param to
   * @param options
   * @param port
   * @param callback
   */
  this.connectOtherPZH = function(_to, _options, _callback) {
    try {
      var connPzh, serverName = _to.split("_")[0];
      _options.servername = _to;
      connPzh = tls.connect(_parent.config.userPref.ports.provider, serverName, _options, function() {
        _parent.pzh_state.logger.log("connection status : "+connPzh.authorized);
        if(connPzh.authorized) {
          _parent.pzh_state.logger.log("connected to " + _to);
          _parent.handlePzhAuthorization(_to, connPzh);
        } else {
          _parent.pzh_state.logger.error("connection authorization Failed - "+connPzh.authorizationError);
        }
        if (_callback) {_callback({cmd:'pzhPzh', to: _parent.config.metaData.serverName, payload:connPzh.authorized});}
      });
      connPzh.on("data", function(buffer) {
        _parent.handleData(connPzh, buffer);
      });
      connPzh.on("error", function(err) {
        _parent.pzh_state.logger.error(err.message);
      });
      connPzh.on("end", function() {
        _parent.removeRoute(connPzh.id);
      });
    } catch (err) {
      _parent.pzh_state.logger.error("connecting other pzh failed in setting configuration " + err);
      _callback(false, err);
    }
  };

  /**
   * This is a function on receiving end in PZH - PZH certificate exchange.
   * @param msg
   * @param callback
   */
  this.addExternalCert = function(_msg, _callback) {
    if (!_parent.config.cert.external.hasOwnProperty(_msg.from)) {
      _parent.config.cert.external[_msg.from] = { cert: _msg.payload.message.cert, crl: _msg.payload.message.crl};
      _parent.config.storeCertificate(_parent.config.cert.external,"external");
    }
    if (_parent.config.trustedList.pzh.hasOwnProperty(_msg.from)) {
      _parent.config.trustedList.pzh[_msg.from] = { ip_addr: ""};
      _parent.config.storeTrustedList(_parent.config.trustedList);
    }
    _parent.setConnParam(function(status, options){
      if (status) {
        return _callback (_parent.config.metaData.serverName, options, _parent.config.cert.internal.master.cert, _parent.config.crl);
      } else {
        return _callback();
      }
    });
  };

  /**
   * This is function that triggers PZH - PZH certificate exchange
   * @param from - PZH that we are trying to connect
   * @param fetchPzh - function that sendCertificates uses to fetch PZH instance
   * @param refreshCert - refreshes SNI context of the server
   * @param callback - result callback invoked to inform client about the status
   */
  this.addOtherZoneCert = function(_from, _fetchPzh, _refreshCert, _callback) {
    if(_parent.config.trustedList.pzh.hasOwnProperty(_from)) {
      _callback({to: _parent.config.metaData.serverName, cmd: 'pzhPzh', payload: "PZH already connected"})
    } else if (_from === _parent.config.metaData.serverName) {
      _callback({to: _parent.config.metaData.serverName, cmd: 'pzhPzh', payload: "Trying to connect own PZH"})
    } else {
      pzh_pzh.sendCertificate(_from, _parent.config, _fetchPzh, _refreshCert, _callback);
    }
  };
};

var RevokePzh = function(parent) {
  /**
   * Removes a PZP from the PZH
   * @param pzpid
   * @param refreshCert
   * @param callback
   */
  this.revokeCert = function(_pzpid, _refreshCert, _callback) {
    var pzpCert = _parent.config.cert.internal.signedCert[_pzpid];
    _parent.config.revokeClientCert(pzpCert, function(status, crl) {
      if (status) {
        _parent.pzh_state.logger.log("revocation success! " + _pzpid + " should not be able to connect anymore ");
        _parent.config.crl = crl;
        delete _parent.config.cert.internal.signedCert[_pzpid] ;
        delete parent.config.trustedList.pzp[_pzpid] ;
        _parent.config.cert.internal.revokedCert[_pzpid] = crl;
        _parent.config.storeAll();
        if (_parent.pzh_state.connectedPzp[_pzpid]){
          _parent.pzh_state.connectedPzp[_pzpid].socket.end();
          delete _parent.pzh_state.connectedPzp[_pzpid];
        }
        _parent.setConnParam(function(status, options){
          if(status){
            _refreshCert(_parent.config.metaData.serverName, options);
          }
        });
        _callback({cmd:"revokePzp", to: _parent.config.metaData.serverName, payload: _pzpid});
      } else {
        _callback({cmd:"revokePzp", to: _parent.config.metaData.serverName, payload: "failed"});
      }
    });
  };
};

var AddPzp = function(_parent) {
  /**
   * Adds new PZP certificate. This is triggered by client, which sends its csr certificate and PZH signs
   * certificate and return backs a signed PZP certificate.
   * @param {Object} msgRcvd It its is an object holding received message.
   */
  this.addNewPZPCert = function(_msgRcvd, _callback) {
    try {
      var pzpId =_parent.pzh_state.sessionId +"/"+ _msgRcvd.from, msg;
      if (_parent.config.cert.internal.revokedCert[pzpId]) {
        msg = _parent.prepMsg(_parent.config.metaData.serverName, pzpId, "error", "pzp was previously revoked");
        _callback(false, msg);
        return;
      }
      _parent.pzh_state.expecting.isExpectedCode(_msgRcvd.payload.message.code, function(expected) { // Check QRCode if it is valid ..
        if (expected) {
          _parent.config.generateSignedCertificate(_msgRcvd.payload.message.csr, 2, function(status, value) { // Sign certificate based on received csr from client.// pzp = 2
            if (status) { // unset expected QRCode
              _parent.config.cert.internal.signedCert[pzpId] = value;
              _parent.pzh_state.expecting.unsetExpected(function() {
                _parent.config.storeCertificate(_parent.config.cert.internal, "internal");
                if(!_parent.config.trustedList.pzp.hasOwnProperty(pzpId)) {// update configuration with signed certificate details ..
                  _parent.config.trustedList.pzp[pzpId] = {addr: "", port:""};
                  _parent.config.storeTrustedList(_parent.config.trustedList);
                }
                var payload = {"clientCert": _parent.config.cert.internal.signedCert[pzpId], "masterCert": _parent.config.cert.internal.master.cert, "masterCrl": _parent.config.crl};// Send signed certificate and master certificate to PZP
                msg = _parent.prepMsg(_parent.config.metaData.serverName, pzpId, "signedCert", payload);
                _callback(true, msg);
              });
            } else {
              msg = _parent.prepMsg(_parent.config.metaData.serverName, _msgRcvd.from, "error", value);
              _callback(false, msg);
            }
          });
        } else {
          msg = _parent.prepMsg(_parent.config.metaData.serverName, _msgRcvd.from, "error", "not expecting new pzp");
          _callback(false, msg);// Fail message
        }
      });
    } catch (err) {
      _parent.pzh_state.logger.error("error signing client certificate" + err);
      msg = _parent.prepMsg(_parent.config.metaData.serverName, _msgRcvd.from, "error", err.message);
      _callback(false, msg);
    }
  };
};


