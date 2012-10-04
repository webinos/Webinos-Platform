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
var crypto   = require('crypto');

var webinos = require('webinos')(__dirname);
var logger   = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var content = webinos.global.require(webinos.global.util.location, "lib/content.js");

var openid     = require("./pzh_openid.js");
var enrollment = require("./pzh_deviceEnrollment.js");
var qrcode     = require("../lib/pzh_qrcode.js");
var revoke     = require("../lib/pzh_revoke.js");
var pzh_api    = require("../lib/pzh_internal_apis.js");

/**
 *
 * @constructor
 */
var PZH_WebServer = function() {
  "use strict";
  enrollment.call(this);
  var storeInfo = {};
  var parent = this;
  var hostname;
  /**
   *
   * @param response
   */
  function result(response) {
    if (response && response.to && storeInfo.hasOwnProperty(response.to)) {
      storeInfo[response.to].writeHeader(200, {'Content-Type':
        'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
      logger.log("sending response " + JSON.stringify(response));
      storeInfo[response.to].write(JSON.stringify(response));
      storeInfo[response.to].end();
      delete storeInfo[response.to];
    }
  }

  function sendRedirectionMsg(res, path, msg) {
    res.writeHead(302, {Location: path + "?" +msg});
    res.end();
  }

  /**
   *
   * @param res
   * @param filename
   */
  function sendFile(res, filename) {
    fs.stat(filename, function(err, stats) {
      if(err) {
        res.writeHeader(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
        return;
      }
      if (stats.isDirectory()) {
        filename = path.join(__dirname, "index.html");
      }
      // Security check, if not logged in, we redirect to index.html
      fs.readFile(filename, "binary", function(err, file) {
        if(err) {
          res.writeHeader(500, {"Content-Type": "text/plain"});
          res.write(err + "\n");
          res.end();
          return;
        }
        res.writeHeader(200, content.getContentType(filename));
        res.write(file, "binary");
        res.end();
      });
    });
  }

  /**
   *
   * @param res
   * @param id
   * @param details
   */
  function verifyPzhHandling(res, id, details){
    var crypt = new Buffer(id).toString('base64')
    if (parent.fetchPzh(id) !== "undefined"){
      parent.createPzh(details, function(status, value) {
        if (status) {
          sendRedirectionMsg(res, "/main.html", 'provider='+details.provider+'&id='+crypt);
        } else {
          sendRedirectionMsg(res, "/index.html", 'cmd=error&reason='+value);
        }
      });
    } else {
      sendRedirectionMsg(res,"/main.html", 'provider='+details.provider+'&id='+crypt);
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
      if(value) {
        var id = hostname+'/'+details.email+"/";
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
  function handleAuthorizedConnection(res, query ){
    var instance, pzhId;
    pzhId = new Buffer(query.from, 'base64').toString('ascii');
    instance = parent.fetchPzh(pzhId);
    if(!instance) {
      res.write(JSON.stringify({cmd:"error", message:"pzh requested does not exist"}));
      res.end();
      return;
    }

    storeInfo[pzhId] = res;
    switch(query.payload.status) {
      case 'listDevices':
        pzh_api.listZoneDevices(instance, res, result);
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
        parent.refreshCert(instance.getSessionId());
        break;
      case 'pzhPzh':
        instance.addOtherZoneCert(query.payload.message, parent.sendCertificate, result);
        break;
      case 'listPzp':
        pzh_api.listPzp(instance,result);  // USED BEFORE REVOKE..
        break;
      case 'revokePzp':
        revoke.revokePzp(pzpid, instance, result);
        break;
      case 'addPzp':
        qrcode.addPzpQRAgain(instance, result);
        break;
      case 'logout':
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

  function handleData(port, res, data) {
    var query = JSON.parse(data.toString("utf8")), pzhId;
    if (query.from) {
      pzhId = new Buffer(query.from, 'base64').toString('ascii');
    }
    if (pzhId && parent.fetchPzh(pzhId)) {
      handleAuthorizedConnection(res, query);
    } else if (query.payload && query.payload.status) {
      parent.handleEnrollmentReq(hostname, port, res, query);
    }
  }

  this.sendCertificate = function(to, serverName, webServerPort, masterCert, masterCrl, callback) {
    var payload = {
        to  : to, from: serverName,
        payload: {
          status: "sendCert", message:{cert: masterCert, crl : masterCrl}}
      },
      options= {
        host: to.split('/')[0],
        port: webServerPort,
        path: "/main.html?cmd=transferCert",
        method:"POST",
        headers: { 'Content-Length': JSON.stringify(payload).length}
      };
    logger.log("pzh to pzh connection initiated");
    var req = https.request(options, function(res) {
      res.on('data', function(data) {
        var parse = JSON.parse(data);
        if (parse.payload && parse.payload.status === "receiveCert") {
          logger.log("pzh to pzh receive response");
          var instance = parent.fetchPzh(parse.to);
          if(instance) {
            instance.addExternalCert(parse, function(serverName, options){
              parent.refreshCert(serverName, options);
              instance.connectOtherPZH(to, options, webServerPort, callback);
            });
          } else {
            callback({to: parse.to, cmd: 'pzhPzh', payload: "Pzh does not exist in this farm"});
          }
        } else if (parse.payload.status === "error") {
          logger.error(parse.payload.message);
          callback({to: parse.to, cmd: 'pzhPzh', payload: parse.payload.message});
        }
      });
    });
    req.on('error', function(err) {
      logger.error(err);
    });
    req.write(JSON.stringify(payload));
    req.end();
  };


  this.startWebServer = function(_hostname, _address, _port, _webServerConfig, _callback) {
    hostname = _hostname;
    var server = https.createServer(_webServerConfig, function(req, res){
      req.on('data', function(data){
        handleData(_port, res, data);
      });
    });

    server.on('error', function(error) {
      if (_callback) _callback(false, error.message);
    });

    server.on('request', function(req, res) {
      var parsed = url.parse(req.url, true);
      if (parsed.query && parsed.query.cmd ) {
        if(parsed.query.cmd === "verify") {
          verifyConnection(res, req, parsed.query);
        }
      } else {
        if(parsed.pathname === "/undefined") { parsed.pathname = "index.html"}
        var filename = path.join(__dirname, parsed.pathname);

        sendFile(res, filename);
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
