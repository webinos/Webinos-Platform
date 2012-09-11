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
*******************************************************************************/
/**
* @description: Starts PZH farm and handles adding of new PZH
*/

var tls         = require("tls");
var path        = require("path");
var util        = require("util");
var fs          = require("fs");
var net         = require("net");

var webinos     = require("webinos")(__dirname);
var logging     = webinos.global.require(webinos.global.util.location, "lib/logging.js");
var log         = new logging("pzh_provider");

var session     = webinos.global.require(webinos.global.pzp.location, "lib/session");
var pzhWI       = webinos.global.require(webinos.global.pzh.location, "web/pzh_webserver");

var pzh_session = require("./pzh_sessionHandling.js");

var Provider = function(hostname, friendlyName) {
  pzhWI.call(this);
  this.server ="";
  this.address      = "0.0.0.0";
  this.friendlyName = friendlyName;
  this.hostname     = hostname;
};
util.inherits(Provider, pzhWI);
/**
* @description: Starts provider.
* @param {function} callback: true in case successful or else false in case unsuccessful
*/
Provider.prototype.start = function (callback) {
  "use strict";
  var connectingAddress, hostname;
  var self = this;
   // Configuration setting for pzh, returns set values and connection key
  if (self.hostname === "") {
    session.common.fetchIP(function(resolvedAddress){
      self.hostname = resolvedAddress;
      self.load(function(status, config){
        return callback(status, config);
      });
    });
  } else {
    self.load(function(status, config) {
      return callback(status, config);
    });
  }
};
Provider.prototype.function = function (conn) {
  var self = this;
  // if server name exists in conn and pzh_provider.pzhs has details about pzh instance,
  // message will be routed to respective PZH authorization function
  if (conn.servername && self.pzhs[conn.servername]) {
    self.pzhs[conn.servername].handleConnectionAuthorization(conn);
  } else {
    conn.socket.end();
    log.error("server is not registered in "+conn.servername);
  }
  // In case data is received at pzh_provider
  conn.on("data", function(data){
    // forward message to respective PZH handleData function
    if(conn.servername && self.pzhs[conn.servername]) {
      self.pzhs[conn.servername].handleData(conn, data);
    } else {
      log.info("("+conn.servername+") is not registered in the provider");
    }
  });
  // In case of error
  conn.on("end", function(err) {
    log.info("("+conn.servername+") client ended connection");
  });

  // It calls removeClient to remove PZH from list.
  conn.on("close", function() {
    try {
      log.info("("+conn.servername+") Pzh/Pzp  closed");
      if(conn.servername && self.pzhs[conn.servername]) {
        var cl      = self.config.trustedList[conn.servername];
        var removed = self.removeClient(cl, conn);
        if (removed !== null && typeof removed !== "undefined"){
          cl.messageHandler.removeRoute(removed, conn.servername);
          cl.discovery.removeRemoteServiceObjects(removed);
        }
      }
    } catch (err) {
      log.error("("+conn.servername+") remove client from connectedPzp/connectedPzh failed" + err);
    }
  });

  conn.on("error", function(err) {
    log.error("("+conn.servername+") general error " + err);
  });
};

Provider.prototype.load = function(callback) {
  var self = this;
  self.config  = new session.configuration();
  self.config.setConfiguration(self.friendlyName, "PzhP", self.hostname, function (status, value) {
    if (!status) {
      return callback(status, value);
    } else {
    // Connection parameters for PZH pzh_provider TLS server.
    // Note this is the main server, pzh started are stored as SNIContext to this server
      var options = {
        key  : value,
        cert : self.config.cert.internal.conn.cert,
        ca   : self.config.cert.internal.master.cert,
        requestCert       : true,
        rejectUnauthorised: false
      };
      // Main pzh_provider TLS server
      self.server = tls.createServer (options, function (conn) {
        self.handleConnection(conn);
      });

      self.server.on("error", function(error) {
        if(error && error.code ==="EACCES") {
          if (callback !== "undefined") {
            callback("error", "starting pzh_provider failed, try running with sudo");
          }
        }
        log.error(error);
      });

      self.server.on("listening", function(){
        log.info("initialized at " + self.address +" and port " +self.config.userPref.ports.provider);
        // Load PZH"s that we already have registered ...
        self.loadPzhs();
        // Start web interface, this web interface will adapt depending on user who logins
        self.startWebServer(function (status, value) {
          if (status) {
            return callback(status, "pzh provider and pzh web server initialized");
          } else {
            return callback(status, "failed starting pzh web server initialized");
          }
        });
      });
      self.server.listen(self.config.userPref.ports.provider, self.address);
    }
  });
};

Provider.prototype.loadPzhs = function() {
  "use strict";
  var myKey, pzh, self = this;
  for ( myKey in self.config.trustedList.Pzh) {
    if(self.config.trustedList.Pzh.hasOwnProperty(myKey)) {
      pzh = new pzh_session();
      pzh.addPzh(myKey, function(status, value) {
        if (status) {
          self.config.trustedList.Pzh[value]= pzh;
          log.info("started pzh " + value);
        } else {
          log.error("failed starting pzh " + value);
        }
      });
    }
  }
};

/** @description It removes the connected PZP/Pzh details.
 */
Provider.prototype.removeClient = function(instance, conn) {
  "use strict";
  var id;
  for (id in instance.config.trustedList.Pzp){
    if (instance.config.trustedList.Pzp.hasOwnProperty(id) && instance.config.trustedList.Pzp[id].socket === conn) {
      log.info("removed pzp instance details -" + id);
      delete instance.config.trustedList.Pzp[id];
      return id;
    }
  }

  for (id in instance.config.trustedList.Pzh) {
    if (instance.config.trustedList.Pzh.hasOwnProperty(id) && instance.config.trustedList.Pzp[id].socket === conn) {
      log.info("removed pzh instance details -" + id);
      delete instance.connectedPzh[id];
      return id;
    }
  }
};

Provider.prototype.createPzh = function(user, callback) {
  var self = this;
  var name = user.email;
  var pzhId = self.hostname+"/"+name+"/";
  if (self.config.trustedList[pzhId] || user.username === self.friendlyName)  {
   callback(false, "pzh exists, with same id");
  } else {
    log.info("adding new PZH - " + pzhId);

    var pzh = new pzh_session();
    pzh.addPzh(user, self.server, pzhId, function(status, errorDetails){
      if (status) {
        self.config.trustedList.pzh[pzhId] = pzh ;
        self.config.storeTrustedList(self.config.trustedList, function(status, value) {
          if (status) {
            return callback(true, pzhId);
          } else {
            return callback(false, "pzh created, but failed saving config");
          }
        });
      } else {
        return callback(false, "failed adding pzh");
      }
    });
  }
};

/*
// This keeps pzh running but you cannot find where error occurred
process.on("uncaughtException", function(err) {
  log.error("uncaught exception " + err);
});
*/

module.exports = Provider;
