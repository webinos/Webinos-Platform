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

var tls         = require("tls");
var path        = require("path");
var util        = require("util");
var fs          = require("fs");
var net         = require("net");
var crypto      = require("crypto");

var webinos     = require("find-dependencies")(__dirname);
var logger      = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;

var session     = webinos.global.require(webinos.global.pzp.location, "lib/session");
var pzhWI       = webinos.global.require(webinos.global.pzh.location, "web/pzh_webserver");

var pzh_session = require("./pzh_sessionHandling.js");

/**
 * Defines the constructor for the provider  and initializes the provider functions
 * @param _hostname : hostname is specified if the pzh provider
 * @param _friendlyName : friendly name of the provider
 * @constructor
 */
var Provider = function(_hostname, _friendlyName) {
  "use strict";
  pzhWI.call(this);
  var server       = {}; // TLS server socket on which provider listens
  var pzhs         = {}; // instances of the pzh currently loaded
  var address      = "0.0.0.0";
  var config       = {};
  var friendlyName = _friendlyName;
  var hostname     = _hostname;
  var self         = this;


  /**
   * Fetches the public IP address if hostname is not specified
   * @param callback :
   */
  function setHostName(callback) {
    if (hostname === "") {
      var socket = net.createConnection(80, "www.google.com");
      socket.on('connect', function() {
        socket.end();
        hostname =  socket.address().address;
        return callback();
      });
      socket.on('error', function() { // Assuming this will happen as internet is not reachable
        hostname =  "0.0.0.0";
        return callback();
      });
    } else {
      return callback();
    }
  }


  /**
   *  PZH already registered, are reloaded in case Provider is restarted
   */
  function loadPzhs() {
    var myKey, key, email;
    for (myKey = 0 ; myKey < config.trustedList.pzh.length; myKey=myKey+1) {
      key = config.trustedList.pzh[myKey];
      pzhs[key] = new pzh_session();
      email = key.split("_")[1].split("/")[0];
      pzhs[key].addLoadPzh(email, key, "", function(status, value, pzhId) {
        if (status) {
          server.addContext(pzhId, value);
          logger.log("started zone hub " + pzhId);
        } else {
          logger.error("failed starting zone hub" + value);
        }
      });
    }
  }

  /**
   * Sets TLS server connection parameters
   *
   */
  function setParam (type, callback) {
    var key_id;
    if (type === "conn") { key_id =config.cert.internal.conn.key_id; } else { key_id = config.cert.internal.web.key_id;}
    config.fetchKey(key_id, function(status, value) {
      if(status) {
        callback(true, {
          key  : value,
          cert : (type === "conn"? config.cert.internal.conn.cert: config.cert.internal.web.cert),
          ca   : config.cert.internal.master.cert,
          requestCert       : true,
          rejectUnauthorised: false
        });
      } else {
        callback(false)
      }
    });
  }

  /**
   * Loads provider session/certificate details and starts the TLS server
   * @param callback: If successful returns true or false uf server fails to start
   */
  function loadSession (callback) {
    config  = new session.configuration();
    config.setConfiguration(friendlyName, "PzhP", hostname, function (status, value) {
      if (!status) {
        logger.error("setting configuration for the zone provider failed, needs deletion of the .webinos directory")
        return callback(status, value);
      } else {
        setParam("conn", function(status, options) {
          if(status) {
            server = tls.createServer (options, function (conn) {   // This is the main TLS server, pzh started are stored as SNIContext to this server
              handleConnection(conn);
            });
            server.on("error", function(error) {
              logger.error(error.message);
              if(error && error.code ==="EACCES") {
                callback(false, "could not start zone provider due to access restrictions, check your access rights or change your configuration");
              }
            });

            server.on("listening", function(){
              logger.log("initialized at " + address +" and port " +config.userPref.ports.provider);
              loadPzhs();
              return callback(true);
            });
            server.listen(config.userPref.ports.provider, address);
          }
        });
      }
    });
  }

  /**
   *  Server name matches with pzhId in the pzhs object, message will be routed to respective authorization function
   * @param conn
   */
  function handleConnectionAuthorization(conn){
    if (conn.servername && pzhs[conn.servername]) {
      pzhs[conn.servername].handleConnectionAuthorization(conn);
    } else {
      conn.socket.end();
      logger.error("pzh  -  " + conn.servername +" is not registered in this provider");
    }
  }
  /**
   * Handle connection coming from pzh or pzp and forwards request to respective pzh.
   * The mechanism relies on "servername" received from the client.
   * @param conn : Socket information of the client connecting
   */
  function handleConnection(conn) {
    handleConnectionAuthorization(conn); // This is called only when new client connects

    conn.on("data", function(data){
      if(conn.servername && pzhs[conn.servername]) { // forward message to respective PZH handleData function
        pzhs[conn.servername].handleData(conn,data);
      } else {
        logger.log("pzh "+conn.servername+" is not registered in the provider");
      }
    });

    conn.on("end", function(err) {
      logger.log(conn.servername+" ended connection");
    });

    conn.on("close", function() {
      if(conn.servername && pzhs[conn.servername]) {
        pzhs[conn.servername].removeRoute(conn.id);
      } else {
        logger.log("not registered entity ended connection");
      }
    });

    conn.on("error", function(err) {
      logger.error(conn.servername+" general error " + err.message);
    });
  }

  function loadWebServerCertificates(callback) {
    if (!config.cert.internal.web.cert) {
      var cn = "PzhWS" + ":"+ config.metaData.serverName;
      console.log(cn);
      config.generateSelfSignedCertificate("PzhWS", cn, function(status, value ) {
        console.log(status);
        if (status) {
          config.generateSignedCertificate(value, 2, function(status, value) {
            if(status) {
              config.cert.internal.web.cert = value;
              config.storeCertificate(config.cert.internal, "internal");
              setParam("web", function(status, wss){
                if (status) { return callback(true,  wss);}
                else { return callback(false);}
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
      setParam("web", function(status, wss){
        if(status) { return callback(true, wss);}
        else { return callback(false);}
      });
    }
  }

  // Webinos provider APIs exposed to the Zone Web Server

  /**
   * FetchPzh is called from the WebServer to fetch information about Pzh instance
   * @param pzhId: pzhId of the entity connecting to the pzh web server
   * @return {*}: returns pzh instance
   */
  this.fetchPzh = function(pzhId){
    return pzhs[pzhId];
  };
  /**
   * Refreshes the SNI context of the running PZH. Used during pzh-pzh connection and revoke certificate
   * @param serverName
   * @param options
   */
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
    var pzhId = hostname + "_" + user.email;
    if (config.trustedList.pzh.indexOf(pzhId) !== -1 )  {
      callback(true, pzhId);
    } else {
      logger.log("adding new zone hub - " + pzhId);
      pzhs[pzhId] = new pzh_session();
      pzhs[pzhId].addLoadPzh(user.email, pzhId, user, function(status, options, uri){
        if (status) {
          server.addContext(uri, options);
          config.trustedList.pzh.push(uri);
          config.storeTrustedList(config.trustedList);
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
  this.startProvider = function (callback) {
    "use strict";
    setHostName(function() {
      loadSession(function(status, value){
        if (status) { // pzh provider TLS server started
          logger.log("zone provider tls server started");
          loadWebServerCertificates(function(status, connParam){
            self.startWebServer(hostname, address, config.userPref.ports.provider_webServer, connParam, function (status, value) {
              if(status) {
                logger.log("zone provider web server started");
                return callback(true);
              } else{
                logger.log("zone provider web server failed to start " + value);
                return callback(false, value);
              }
            });
          });
        } else {
          logger.error("zone provider tls server failed to start " + value);
          return callback(false, value);
        }
      });
    });
  };
};
util.inherits(Provider, pzhWI);

/*// This keeps pzh running but you cannot find where error occurred
process.on("uncaughtException", function(err) {
  logger.error("uncaught exception " + err.message);
});*/


module.exports = Provider;
