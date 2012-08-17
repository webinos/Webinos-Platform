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
* @author <a href="mailto:habib.virji@samsung.com">Habib Virji</a>
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
  this.pzhs = [];
  this.server;
  this.address      = "0.0.0.0";
  this.friendlyName = friendlyName;
  this.hostname     = hostname;
};

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
      self.load(function(status, errorDetails){
        callback(status, errorDetails);
      });
    });
  } else {
    self.load(function(status, errorDetails) {
      callback(status, errorDetails);
    });
  }
};

Provider.prototype.load = function(callback) {
  var self = this;
  console.log(self);
  self.config  = new session.configuration(self.friendlyName, "PzhProvider", self.hostname);
  console.log(self);
  self.config.setConfiguration("PzhProvider", function (status, errorDetails, key) {
    if (status === "error") {
      log.error(errorDetails);
      callback("error", errorDetails);
    } else {
    // Connection parameters for PZH pzh_provider TLS server.
    // Note this is the main server, pzh started are stored as SNIContext to this server
      var options = {
        key  : key,
        cert : self.config.cert.conn.cert,
        ca   : self.config.cert.master.cert,
        requestCert       : true,
        rejectUnauthorised: false
      };
      // Main pzh_provider TLS server
      self.server = tls.createServer (options, function (conn) {
        // if servername existes in conn and pzh_provider.pzhs has details about pzh instance,
        // message will be routed to respective PZH authorization function
        if (conn.servername && self.pzhs[conn.servername]) {
          self.pzhs[conn.servername].handleConnectionAuthorization(conn);
        } else {
          log.error("server is not registered in "+conn.servername);
          conn.socket.end();
          return;
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
              var cl      = self.pzhs[conn.servername];
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
          log.error("("+conn.servername+") general error" + err);
        });
      });

      self.server.on("error", function(error) {
        if(error && error.code ==="EACCES") {
          if (callback !== "undefined") {
            callback("error", "starting provider failed, try with sudo");
          }
        }
        log.error(error);
      });

      self.server.on("listening", function(){
        log.info("initialized at " + self.address +" and port " +self.config.port.providerPort);
        // Load PZH"s that we already have registered ...
        self.loadPzhs();
        // Start web interface, this webinterface will adapt depending on user who logins
        pzhWI.start(self.hostname, self.address, function (status, errorDetails) {
          if (status === "success") {
            callback("success", "", provider.config);
          } else {
            callback("error", errorDetails);
          }
        });
      });
      console.log(self);
      self.server.listen(self.config.port.providerPort, self.address);
    }
  });
};

Provider.prototype.loadPzhs = function() {
  "use strict";
  var myKey;
  for ( myKey in this.pzhs) {
    if(typeof this.pzhs[myKey] !== "undefined") {
      this.pzhs[myKey] = new pzh_session();
      this.pzhs[myKey].addPzh(myKey, function(res, instance) {
        if (res) {
          log.info("started pzh " + instance.config.webinosName);
        } else {
          log.error("failed starting pzh ");
        }
      });
    }
  }
};

/** @desription It removes the connected PZP/Pzh details.
 */
Provider.prototype.removeClient = function(instance, conn) {
  "use strict";
  var id;
  for (id in instance.connectedPzp){
    if (instance.connectedPzp[id].socket === conn) {
      log.info("removed pzp instance details -" + id)
      delete instance.connectedPzp[id];
      return id;
    }
  }

  for (id in self.connectedPzh){
    if (instance.connectedPzh[id].socket === conn) {
      console.log("removed pzh instance details -" + id)
      delete instance.connectedPzh[id];
      return id;
    }
  }
};

Provider.prototype.createPzh = function(user, callback) {
  var name = user.email;
  var pzhId = this.hostname+"/"+name+"/";
  if (self.pzhs[pzhId])  {
    log.info("pzh exists, with same id, cannot create add this instance");
    callback("error", "pzh already exists");
  } else {
    log.info("adding new PZH - " + pzhId);
    var pzhModules = session.config.pzhDefaultServices;
    self.pzhs[pzhId] = new pzh_session();
    self.pzhs[pzhId].addPzh(pzhId, pzhModules, function(status, errorDetails){
      if (status) {
        self.pzhs[pzhId].config.name     = name;
        self.pzhs[pzhId].config.email    = user.email;
        self.pzhs[pzhId].config.country  = user.country;
        self.pzhs[pzhId].config.image    = user.image;
        self.config.pzhs[pzhId]          = pzhModules;
        self.config.storeConfig(self.config, function() {
          provider.pzhs[pzhId].config.storeConfig(provider.pzhs[pzhId].config, function(status, errorDetails) {
            if (status === "success") {
              callback("success", "", pzhId);
            } else {
              callback("error", "pzh created, but failed saving config");
            }
          });
        });
      } else {
        callback("error", "failed creating pzh");
      }
    });
  }
}

/*
// This keeps pzh running but you cannot find where error occurred
process.on("uncaughtException", function(err) {
  log.error("uncaught exception " + err);
});
*/

module.exports = Provider;
