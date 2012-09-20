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
var log     = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);
var content = webinos.global.require(webinos.global.util.location, "lib/content.js");

var enrollment = require("./pzh_deviceEnrollment.js");
var qrcode     = require("../lib/pzh_qrcode.js");
var revoke     = require("../lib/pzh_revoke.js");

var PZH_WebServer = function() {
  "use strict";
  enrollment.call(this);
  var storeInfo = [];
  var self = this;

  function result(response) {
    if (response && response.to && storeInfo.hasOwnProperty(response.to)) {
      storeInfo[response.to].writeHeader(200, {'Content-Type':
        'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
      log.info("sending response " + JSON.stringify(response));
      storeInfo[response.to].write(JSON.stringify(response));
      storeInfo[response.to].end();
      delete storeInfo[response.to];
    }
  }

  function loadCertificates(self, callback) {
    if (typeof self.config.cert.internal.web.cert === "undefined") {
      var cn = "PzhWS" + ":"+ self.config.metaData.serverName + ":" + self.config.metaData.webinosName;
      self.config.generateSelfSignedCertificate("PzhWS", cn, function(status, value, key ) {
        if (status) {
          self.config.generateSignedCertificate(value, 2, function(status, value) {
            if(status) {
              self.config.cert.internal.web.cert = value;
              self.config.storeCertificate(self.config.cert.internal, "internal", function(status, value){
                if (status) {
                  var wss = {
                    key : key,
                    cert: self.config.cert.internal.web.cert,
                    ca  : self.config.cert.internal.master.cert
                  };
                  return callback(true,  wss);
                }
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
      if (self.config.cert.internal.web.cert !== ""){
        var wss = {
          key : '',
          cert: self.config.cert.internal.web.cert,
          ca  : self.config.cert.internal.master.cert
        };
        self.config.fetchKey(self.config.cert.internal.web.key_id, function(status, value){
          if (status) {
            wss.key = value;
            return callback(true, wss);
          } else {
            return callback(false, value);
          }

        });
      }
    }
  }

  function verifyConnection(res, req, query) {
    var store, instance;
    if (query && query.id) {
      store = self.getStoreInfo(query.id);
    }
    self.fetchOpenIdDetails(req, res, function(value, details) {
      if(value) {
        if (query.id === "undefined") {
          if (self.config.trustedList.pzh.indexOf(self.hostname +'/'+details.username+"/") === -1){
            self.createPzh(details, function(status, value, pzhId) {
              if (status) {
                log.info("***** created pzh " + pzhId+ " *****");
                var crypt = new Buffer(self.hostname + '/' +details.username+'/').toString('base64');
                res.writeHead(302, {Location: '/main.html?provider='+details.provider+'&id='+crypt});
                res.end();
              } else {
                res.writeHead(302, {Location: '/index.html?error='+value});
                res.end();
              }
            });
          } else {
            var crypt = new Buffer(self.hostname + '/' +details.username+'/').toString('base64');
            res.writeHead(302, {Location: '/main.html?provider='+details.provider+'&id='+crypt});
            res.end();
          }
        } else {
          var status, id = self.hostname+'/'+details.username+"/";
          if (self.config.trustedList.pzh.indexOf(id) !== -1) {
            status = true;
            instance = self.fetchPzh(id);
            qrcode.addPzpQRAgain(instance, function(result) {
              res.writeHead(302, {Location: "http://"+store.payload.message.returnPath +"?cmd=authStatus&connected="+status+"&pzhid="+id+"&authCode="+result.payload.code});
              res.end();
            });

          } else {
            self.setStoreInfo(store.from.split("/")[0], details);
            status = false;
            res.writeHead(302, {Location: "http://"+store.payload.message.returnPath +"?cmd=authStatus&connected="+status+"&pzhid="+id});
            res.end();
          }
        }
      } else {

        if (store) {
          res.writeHead(302, {Location: "http://"+store.payload.message.returnPath+"?cmd=error&reason="+details});
        } else {
          res.writeHead(302, {Location: "/index.html?cmd=error&reason="+err.message});
        }
        res.end();
      }
    });
  }

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

  function handleAuthorizedConnection(self, res, query ){
    var instance, currentPzh = new Buffer(query.from, 'base64').toString('ascii');
    log.info("auth msg: " + JSON.stringify(query));

    instance = self.fetchPzh(currentPzh);
    if(!instance) {
      res.write(JSON.stringify({cmd:"error", message:"pzh requested does not exist"}));
      res.end();
      return;
    }
    storeInfo[currentPzh] = res;
    switch(query.payload.status) {
      case 'listDevices':
        instance.listZoneDevices(result);
        break;
      case 'userDetails':
        instance.fetchUserData(result);
        break;
      case 'crashLog':
        instance.fetchLogs("error", result);
        break;
      case 'infoLog':
        instance.fetchLogs("info", result);
        break;
      case 'restartPzh':
        instance.restartPzh(result);  // TODO: NOT SUPPORTED CURRENTLY
        break;
      case 'listPzp':
        instance.listPzp(result);  // USED BEFORE REVOKE..
        break;
      case 'pzhPzh':
        instance.addOtherZoneCert(query.payload.message, result);
        break;
      case 'revokePzp':
        revoke.revokePzp(pzpid, instance, result);
        break;
      case 'addPzp':
        qrcode.addPzpQRAgain(instance, result);
        break;
      case 'logout':
        instance.res.socket.end();

        break;
    }

  }

  this.startWebServer = function(callback) {
    if (typeof callback !== "function" ){
      callback(false, "failed starting PZH web server, invalid parameters");
    } else {
      loadCertificates(self, function (status, webServer) {
        if (status) {
          var server = https.createServer(webServer, function(req, res){
            req.on('data', function(data){
              var query = JSON.parse(data.toString()), currentPzh;
              if (query.from) {
                currentPzh = new Buffer(query.from, 'base64').toString('ascii');
              }
              if (currentPzh && self.config.trustedList.pzh.indexOf(currentPzh) !== -1) {
                handleAuthorizedConnection(self, res, query);
              } else if (query.payload && query.payload.status) {
                self.handleEnrollmentReq(res, query);
              }
            });
          });

          server.on('error', function(err) {
            callback(false, err);
          });

          server.on('request', function(req, res) {
            var parsed = url.parse(req.url, true), query = {};
            var filename = path.join(__dirname, parsed.pathname);

            if (parsed.query) {
              query = parsed.query;
            }

            if (query && query.cmd){
              if(query.cmd === "verify") {
                verifyConnection(res, req, query);
              }
            } else {
              sendFile(res, filename);
            }
          });

          server.listen(self.config.userPref.ports.provider_webServer, self.address, function() {
            //log.info('listening at address ' + self.address + "and port "+ self.config.port.provider_webServerPort);
            log.info('listening at address ' + self.address + " and port "+ self.config.userPref.ports.provider_webServer);
            callback(true);
          });
        }
      });
    }
  };
};

util.inherits(PZH_WebServer, enrollment);

module.exports = PZH_WebServer