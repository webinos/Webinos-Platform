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
********************************************************************************/

var util     = require("util");
var https    = require('https');
var url      = require('url');
var path     = require('path');
var fs       = require('fs');

var webinos = require("find-dependencies")(__dirname);
var crypto   = require('crypto');
var logger   = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var content  = webinos.global.require(webinos.global.util.location, "lib/content.js");
var session  = webinos.global.require(webinos.global.pzp.location, "lib/session.js");

var openid     = require("./pzh_openid.js");
var enrollment = require("./pzh_deviceEnrollment.js");
var qrcode     = require("../lib/pzh_qrcode.js");
var pzh_api    = require("../lib/pzh_internal_apis.js");
var cert_exch  = require("./pzh_pzh_certificateExchange.js");

var PZH_WebServer = function() {
  "use strict";
  enrollment.call(this);
  var authenticatedUser = {};
  var pzhId = "";
  var parent = this;
  var hostname;
  /**
   * A generic function to send response back to the User that sent request
   * @param response
   */
  function result(response) {
    if (response && response.to && authenticatedUser.hasOwnProperty(response.to)) {
      authenticatedUser[response.to].res.writeHeader(200, {'Content-Type':
        'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
      logger.log("sending response " + JSON.stringify(response));
      authenticatedUser[response.to].res.write(JSON.stringify(response));
      authenticatedUser[response.to].res.end();
      authenticatedUser[response.to].res = "";
    }
  }

  /**
   * A redirection message after completing verification
   * @param res
   * @param path
   * @param msg
   */
  function sendRedirectionMsg(res, path, msg) {
    res.writeHead(302, {Location: path + "?" +msg});
    res.end();
  }

  function authenticateUser(id, provider, res) {
    if (!authenticatedUser.hasOwnProperty(id)){
      authenticatedUser[id] = {id: crypto.randomBytes(24).toString("base64"), expiry: (new Date().getTime()) + 60*60*1000};//
      res.setHeader('Set-Cookie', "id="+authenticatedUser[id].id+",Expires="+authenticatedUser[id].expiry + ",Provider="+provider);
      res.writeHead(302, {Location: "/main.html"});
      res.end();
    }
  }
  /**
   *
   * @param res
   * @param id
   * @param details
   */
  function verifyPzhHandling(res, id, details){
    if (parent.fetchPzh(id) !== "undefined"){
      parent.createPzh(details, function(status, value) {
        if (status) {
          authenticateUser(id, details.provider, res);
        } else {
          sendRedirectionMsg(res, "/index.html", 'cmd=error&reason='+value);
        }
      });
    } else {
      authenticateUser(id, details.provider, res);
    }
  }

  /**
   *
   * @param res
   * @param req
   * @param query
   */
  function verifyConnection(res, req, query) {
    openid.fetchOpenIdDetails(req, function(value, details) {
      var id = hostname+'_'+details.email;
      if(value) {
        if (query.returnPath === "undefined") {
          verifyPzhHandling(res, id, details);//If from pzh web interface
        } else {
          parent.verifyPzpHandling(res, id, query, details); // if from pzp
        }
      } else {
        if(query.returnPath) {
          sendRedirectionMsg(res,"http://"+query.returnPath, "cmd=error&reason="+details);
        } else {
          sendRedirectionMsg(res,"/index.html", "cmd=error&reason="+details);
        }
      }
    });
  }

  /**
   *
   * @param parent
   * @param res
   * @param query
   */
  function handleAuthorizedConnection(res, pzhId, query ){
    var instance;
    instance = parent.fetchPzh(pzhId);
    if(!instance) {
      res.write(JSON.stringify({cmd:"error", message:"pzh requested does not exist"}));
      res.end();
      return;
    }

    authenticatedUser[pzhId].lastSeen = new Date().getTime();
    authenticatedUser[pzhId].res = res;
    switch(query.payload.status) {
      case 'listDevices':
        pzh_api.listZoneDevices(instance, result);
        break;
      case 'userDetails':
        pzh_api.fetchUserData(instance, result);
        break;
      case 'crashLog':
        pzh_api.fetchLogs(instance, "error", result);
        break;
      case 'infoLog':
        pzh_api.fetchLogs(instance, "info", result);
        break;
      case 'restartPzh':
        parent.refreshCert(instance.pzh_state.sessionId);
        break;
      case 'pzhPzh':
        instance.pzh_pzh.addOtherZoneCert(query.payload.message, parent.fetchPzh, parent.refreshCert, result);
        break;
      case 'listPzp':
        pzh_api.listPzp(instance,result);  // USED BEFORE REVOKE..
        break;
      case 'revokePzp':
        instance.revoke.revokeCert(query.payload.pzpid, parent.refreshCert, result);
        break;
      case 'addPzp':
        qrcode.addPzpQRAgain(instance, result);
        break;
      case 'logout':
        delete authenticatedUser[pzhId];
        res.socket.end();
        break;
      case 'listAllServices':
        pzh_api.listAllServices(instance, result);
        break;
      case 'listUnregServices':
        pzh_api.listUnregServices(instance, query.at, result);
        break;
      case 'registerService':
        pzh_api.registerService(instance, query.at, query.name, result);
        break;
      case 'unregisterService':
        pzh_api.unregisterService(instance, query.at, query.svId, query.svAPI, result);
        break;
    }
  }

  function handleData(port, req,  res, data) {
    var expiry, query;

    if (req.headers.cookie) {
      var id, authData = req.headers.cookie && req.headers.cookie.split(",");
      pzhId = "";
      id = authData[0] && authData[0].split("=") && authData[0].split("=")[1];
      expiry = authData[1] && authData[1].split("=") && authData[1].split("=")[1];
      expiry = parseInt(expiry);
      id = decodeURIComponent(id);
      for (var user in  authenticatedUser ) {
        if (authenticatedUser[user].id === id && authenticatedUser[user].expiry === expiry) {
          if(expiry < (new Date().getTime())) { // Time expired
            delete authenticatedUser[pzhId];
            pzhId = "";
            sendRedirectionMsg(res,"/index.html", "cmd=error&reason=logged out");
            return;
          } else {
            pzhId = user;
          }
        }
      }
    } else {
      pzhId = "";
    }
    if (data.toString("utf8") !== "") {
      query = JSON.parse(data.toString("utf8"));
      logger.log(query);
      if(pzhId !== "" && parent.fetchPzh(pzhId)) {
        handleAuthorizedConnection(res, pzhId, query);
      } else if (query.payload && query.payload.status) {
        parent.handleEnrollmentReq(hostname, port, res, query);
      }
    }
  }

  this.startWebServer = function(_hostname, _address, _port, _webServerConfig, _callback) {
    hostname = _hostname;
    var tempData = "";
    var server = https.createServer(_webServerConfig, function(req, res){

      req.on('data', function(data){
        tempData = tempData  + data;
      });
      req.on("end", function(data){
        handleData(_port, req, res, tempData);
        tempData = "";
      });
    });
    server.on('error', function(error) {
      if (_callback) _callback(false, error.message);
    });

    server.on('request', function(req, res) {
      var parsed = url.parse(req.url, true);
      if (parsed.query && parsed.query.cmd ) {
        if (parsed.query.cmd === "verify") {
          verifyConnection(res, req, parsed.query);
        }
      } else {
        var filename = path.join(__dirname, parsed.pathname);
        var indexFile = authenticatedUser[pzhId] ? "main.html" : "index.html";
        content.sendFile(res, __dirname, filename, indexFile);
      }
    });

    server.listen(_port, _address, function() {
      logger.log('listening at address ' + _address + " and port "+ _port);
      return _callback(true);
    });
  };
};

util.inherits(PZH_WebServer, enrollment);

module.exports = PZH_WebServer
