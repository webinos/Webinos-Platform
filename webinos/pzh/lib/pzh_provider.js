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
var crypto      = require("crypto");

var webinos     = require("webinos")(__dirname);
var log         = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);

var session     = webinos.global.require(webinos.global.pzp.location, "lib/session");
var pzhWI       = webinos.global.require(webinos.global.pzh.location, "web/pzh_webserver");

var pzh_session = require("./pzh_sessionHandling.js");
/**
 *
 * @param input_hostname
 * @param input_friendlyName
 * @constructor
 */
var Provider = function(input_hostname, input_friendlyName) {
  pzhWI.call(this);
  this.address       = "0.0.0.0";
  var server         = [];
  var pzhs          = [];
  this.config       = [];
  this.friendlyName = input_friendlyName;
  this.hostname     = input_hostname;
  var self = this;

  /**
   *
   * @param callback
   */
  function setHostName(callback) {
    "use strict";
    var socket = net.createConnection(80, "www.google.com");
    socket.on('connect', function() {
      socket.end();
      return callback(socket.address().address);
    });
    socket.on('error', function() { // Assuming this will happen as internet is not reachable
      return callback("0.0.0.0");
    });
  }

  /**
   *
   * @param instance
   * @param conn
   * @return {*}
   */
  function removeClient(instance, conn) {
    "use strict";
    var id;
    for (id in instance.connectedPzp){
      if (instance.connectedPzp.hasOwnProperty(id) && instance.connectedPzp[id].socket === conn) {
        log.info("removed pzp instance details -" + id);
        delete instance.connectedPzp[id];
        return id;
      }
    }

    for (id in instance.connectedPzh) {
      if (instance.connectedPzh.hasOwnProperty(id) && instance.connectedPzh[id].socket === conn) {
        log.info("removed pzh instance details -" + id);
        delete instance.connectedPzh[id];
        return id;
      }
    }
  }

  /**
   *
   * @param conn
   */
  function handleConnection(conn) {
    "use strict";
    // if server name exists in conn and pzh_provider.pzhs has details about pzh instance,
    // message will be routed to respective PZH authorization function
    if (conn.servername && pzhs[conn.servername]) {
      pzhs[conn.servername].handleConnectionAuthorization(conn);
    } else {
      conn.socket.end();
      log.error("server is not registered in "+conn.servername);
    }
    // In case data is received at pzh_provider
    conn.on("data", function(data){
      // forward message to respective PZH handleData function
      if(conn.servername && pzhs[conn.servername]) {
        pzhs[conn.servername].handleData(conn, data);
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
        if(conn.servername && pzhs[conn.servername]) {
          var cl      = pzhs[conn.servername];
          var removed = removeClient(cl, conn);
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
  }

  /**
   *
   * @param pzhs
   * @param server
   * @param trustedPzh
   */
  function loadPzhs(pzhs, server, trustedPzh) {
    "use strict";
    var myKey, key;
    for (myKey = 0 ; myKey < trustedPzh.length; myKey=myKey+1) {
      key = trustedPzh[myKey];
      pzhs[key] = new pzh_session();
      pzhs[key].addPzh(key.split("/")[1], key, "", function(status, value, pzhId) {
        if (status) {
          console.log(pzhId);
          console.log(value);
          server.addContext(pzhId, value);
          log.info("started pzh " + pzhId);
          pzhs[key].connectOtherPzh();
        } else {
          log.error("failed starting pzh " + value);
        }
      });
    }
  }



  /**
   *
   * @param callback
   */
  function loadSession (callback) {
    "use strict";
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
        server = tls.createServer (options, function (conn) {
          handleConnection(conn);
        });

        server.on("error", function(error) {
          if(error && error.code ==="EACCES") {
            if (callback !== "undefined") {
              callback("error", "starting pzh_provider failed, try running with sudo");
            }
          }
          log.error(error);
        });

        server.on("listening", function(){
          log.info("initialized at " + self.address +" and port " +self.config.userPref.ports.provider);
          // Load PZH"s that we already have registered ...
          loadPzhs(pzhs, server, self.config.trustedList.pzh);
          // Start web interface, this web interface will adapt depending on user who logins
          callback(true);
        });
        server.listen(self.config.userPref.ports.provider, self.address);
      }
    });
  }

  /**
   *
   * @param pzh
   * @param pzhId
   * @param options
   */
  function storeServerDetails(pzh, pzhId, options){
    log.info(options);
    server.addContext(pzhId, options);
    pzhs[pzhId] = pzh;
  }

  /**
   *
   * @param currentPzh
   */
  this.fetchPzh = function(currentPzh){
    return pzhs[currentPzh];
  };


  this.refreshCert = function (serverName, options) {
    server._contexts.some(function(elem) {
      if (serverName.match(elem[0]) !== null) {
        elem[1] =  crypto.createCredentials(options).context;
      }
    });
  };
  /**
   *
   * @param user
   * @param callback
   */
  this.createPzh = function(user, callback) {
    var self = this;
    var name = user.username;
    var pzhId = self.hostname+"/"+name+"/";
    if (self.config.trustedList.pzh.indexOf(pzhId) !== -1 || user.username === self.friendlyName)  {
      callback(false, "pzh exists, with same id");
    } else {
      log.info("adding new PZH - " + pzhId);
      var pzh = new pzh_session();
      pzh.addPzh(name, pzhId, user, function(status, options, uri){
        if (status) {
          // This adds SNI context to existing running PZH server
          storeServerDetails(pzh, uri, options);
          self.config.trustedList.pzh.push(uri);

          self.config.storeTrustedList(self.config.trustedList, function(status, value) {
            if (status) {
              log.info("added " + pzhId + " in the provider trusted list");
            } else {
              log.error("failed adding " + pzhId + " in the trusted list");
            }
          });
          return callback(true, pzhId);
        } else {
          return callback(false, "failed adding pzh");
        }
      });
    }
  };
  /**
   *
   * @param callback
   */
  this.start = function (callback) {
    "use strict";
    if (self.hostname === "") { // Configuration setting for pzh, returns set values and connection key
      setHostName(function(hostname) {
        self.hostname = hostname;//self.pzhs, self.server, self.config, self.friendlyName, self.hostname,
        loadSession(function(status, config){
          if (status) { // loaded session data
            self.startWebServer(function (status, value) {
              if(status) {
                return callback(status, "pzh provider and pzh web server initialized");
              } else{
                return callback(status, "pzh web server failed initializing "+value);
              }
            });
          } else {
            return callback(status, "failed starting pzh provider " + value);
          }
        });
      });
    } else {
      loadSession(function(status, config){
        if (status) { // loaded session data
          self.startServer(function (status, value) {
            if(status) {
              return callback(status, "pzh provider and pzh web server initialized");
            } else{
              return callback(status, "pzh web server failed initializing "+value);
            }
          });
        } else {
          return callback(status, "failed starting pzh provider " + value);
        }
      });
    }
  };
};
util.inherits(Provider, pzhWI);
/*
// This keeps pzh running but you cannot find where error occurred
process.on("uncaughtException", function(err) {
  log.error("uncaught exception " + err);
});
*/

module.exports = Provider;
