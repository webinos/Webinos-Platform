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
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');
var log     = new webinos.global.require(webinos.global.util.location, "lib/logging.js")("pzh_web");
var content = new webinos.global.require(webinos.global.util.location, "lib/content.js")

var pzh_api = require('../lib/pzh_internal_apis');
var openid  = require('./pzh_openid.js');

var PZH_WebServer = function() {
  "use strict";
  openid.call(this);
};

util.inherits(PZH_WebServer, openid);

PZH_WebServer.prototype.result = function(response) {
  if (response && self.pzhs[response.to].res !== "undefined") {
    self.pzhs[response.to].res.writeHeader(200, {'Content-Type':
        'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
    log.info("sending response " + JSON.stringify(response));
    self.pzhs[response.to].res.write(JSON.stringify(response));
    self.pzhs[response.to].res.end();
  }
};

PZH_WebServer.prototype.sendUserDetails = function(currentPzh) {
  var self = this;
  if (self.pzhs[currentPzh]) {
    var payload = {email:  self.pzhs[currentPzh].config.email,
      country: self.pzhs[currentPzh].config.country,
      image:   self.pzhs[currentPzh].config.image,
      name:    self.pzhs[currentPzh].config.name,
      servername: self.pzhs[currentPzh].config.serverName};
    self.result({to: self.pzhs[currentPzh].config.serverName, cmd:'userDetails', payload: payload});
  }
};
PZH_WebServer.prototype.loadCertificates = function(callback) {
  var self = this;
  if (self.config && self.config.cert.web && typeof self.config.cert.web.cert === "undefined") {
    var cn = "PzhWS" + ":"+ self.config.serverName + ":" + self.config.webinosName;
    self.config.generateSelfSignedCertificate("PzhWS", cn, function(status, value, key ) {
      if (status) {
        self.config.generateSignedCertificate(value, 2, function(status, value) {
          if(status) {
            self.config.cert.web.cert = value;
            var wss = {
              key : key,
              cert: self.config.cert.web.cert,
              ca  : self.config.cert.master.cert
            };
            return callback(true,  wss);
          } else {
            return callback(false, value);
          }
        });
      } else {
        return callback(false, value);
      }
    });
  } else {
    if (self.config.cert.web.cert !== ""){
      var wss = {
        key : '',
        cert: self.config.cert.web.cert,
        ca  : self.config.cert.master.cert
      };
      self.config.fetchKey(self.config.cert.web.key_id, function(status, value){
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
PZH_WebServer.prototype.login = function (res, query) {
  var filename = path.join(__dirname, "index.html");
  fs.readFile(filename, "binary", function(err, file) {
    if(err) {
      res.writeHeader(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
    } else {
      res.writeHeader(200, content.getContentType(filename));
      var msg = {"type" : "prop",
        "to"   : query.id,
        "payload":{"status":query.cmd,
                  "message":file}};
      res.write(JSON.stringify(msg));
      res.end();
    }
  });
};

PZH_WebServer.prototype.addPzhCertificate = function(res, query, currentPzh) {
  var self = this;
  var store = res;
  pzh_api.addPzhCertificate(self.pzhs[currentPzh], query.to, function(status) {
    store.writeHeader(200, {'Content-Type': 'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
    log.info("sending response " + JSON.stringify(status));
    store.write(JSON.stringify(status));
    store.end();
  });
}

PZH_WebServer.prototype.addOtherCert = function (res, query) {
  var self = this;
  var instance = self.pzhs[query.to];
  if (self.pzhs && instance && query) {
    if (query.name && query.cert && query.crl && instance.options.ca &&
    instance.options.crl && instance.config && instance.config.otherCert[payload.name]) {
      instance.config.otherCert[payload.name] = { cert: payload.cert, crl: payload.crl};
      instance.options.ca.push(instance.config.otherCert[payload.name].cert);
      instance.options.crl.push(instance.config.otherCert[payload.name].crl);
      self.server._contexts.some(function(elem) {
        if (instance.config.serverName.match(elem[0]) !== null) {
          elem[1] =  crypto.createCredentials(instance.options).context;
        }
      });
      self.config.storeConfig(instance.config, function(status) {
        if (status) {
          log.info("stored certificates of other pzh");
          var payload = {cmd: "receiveCert",
            cert: self.pzhs[query.to].config.master.cert,
            crl:  self.pzhs[query.to].config.master.crl};
          res.write(JSON.stringify(payload));
          res.end();
        } else {
        }
      });
    } else{
      log.error("missing information in the certificate receive message");
    }
  }
};

PZH_WebServer.prototype.registerPzh = function(res, query) {
  var self = this;
  if (self.storeInfo[query.to]) {
    self.createPzh(self.hostname, self.storeInfo[query.to], function(id) {
      var msgSend = {"type":"prop","from":query.to, "to": query.id, "payload":
                        {
                          "status":"auth-status", "message": "true", "pzhid":id
                        }
                    }
      if (self.pzhs[id]) {
        pzh_api.addPzpQR(self.pzhs[id], function(result) {
          msgSend.payload.authCode = result.payload.code;
          res.write(JSON.stringify(msgSend));
          res.end();
        });
      }
    });
  }
};

PZH_WebServer.prototype.enrollPzp = function(res, query) {
  var self = this;
  if (self.pzhs[query.to]) {
    var pzh = self.pzhs[query.to];
    pzh.expecting.isExpected(function(expected) {
      if (!expected){
        //we"re not expecting anything - disallow.
        //not expecting a pzp
      } else {
        var validMsgObj = { "type":"prop", "from": query.id, "to": query.to, "payload":
        { "status":"clientCert", "message":
        { "code": query.authCode, "csr": query.csr}
        }
        };
        pzh.addNewPZPCert(validMsgObj, function(err, msgSend) {
          if (err !== null) {
            pzh.log.error(err);
            return;
          } else {
            msgSend.payload.pzhid = query.to;
            res.write(JSON.stringify(msgSend));
            res.end();
          }
        });
      }
    });
  }
};

PZH_WebServer.prototype.verifyConnection  = function (res, req, query) {
  var self = this;
  self.fetchOpenIdDetails(req, res, self.storeInfo[query.id], function(host, details) {
    if (query.id === "undefined") {
      if (!self.pzhs[self.hostname +'/'+details.username+"/"]) {
        self.createPzh(details, function(status, value) {
          if (status) {
            log.info("***** created pzh " + id+ " *****");
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
      var storeDetails = self.storeInfo[query.id], status, auth_code;
      var id = self.hostname+'/'+details.username+"/";
      if (self.pzhs[id]) {
        status = true;
        pzh_api.addPzpQR(self.pzhs[id], function(result) {
          auth_code = result.payload.code;
          res.writeHead(302, {Location: "http://"+storeDetails.returnPath +"?cmd=auth-status&status="+status+"&pzhid="+id+"&auth_code="+auth_code});
          res.end();
        });
        delete self.storeInfo[query.id];
      } else {
        status = false;
        self.storeInfo[id]=details;
        res.writeHead(302, {Location: "http://"+storeDetails.returnPath +"?cmd=auth-status&status="+status+"&pzhid="+id});
        res.end();
      }
    }
  });
}


PZH_WebServer.prototype.sendFile = function (res, filename) {
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
};

PZH_WebServer.prototype.handleUnauthorizedConnection = function(res, query) {
  var self = this;
  switch(query.cmd) {
    case "login":
      self.login(res, query);
      break;
    case "sendCert":
      self.addOtherCert(res, query);
      break;
    case 'authenticate-google':
      self.authenticate( 'http://www.google.com/accounts/o8/id', res, query);
      break;
    case 'authenticate-yahoo':
      self.authenticate('http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds', res, query);
      break;
    case "registerPzh":
      self.registerPzh(res, query);
      break;
    case 'enrollPzp':
      self.enrollPzp(res, query);
      break;
  }
}
PZH_WebServer.prototype.handleAuthorizedConnection = function(req, res, query ){
  var self = this;
  var currentPzh = new Buffer(query.from, 'base64').toString('ascii');
  if (self.pzhs[currentPzh] && self.pzhs[currentPzh].config) {
    self.pzhs[currentPzh].res = res;
    switch(query.cmd) {
      case 'listDevices':
        pzh_api.listZoneDevices(self.pzhs[currentPzh], self.result);
        break;
      case 'userDetails':
        self.sendUserDetails(currentPzh);
        break;
      case 'pzhPzh':
        self.addPzhCertificate(res, query, currentPzh);
        break;
      case 'crashLog':
        pzh_api.crashLog(self.pzhs[currentPzh], self.result);
        break;
      case 'addPzp':
        pzh_api.addPzpQR(self.pzhs[currentPzh], self.result);
        break;
      case 'logout':
        self.pzhs[currentPzh].res.socket.end()
        break;
      case 'restartPzh':
        pzh_api.restartPzh(self.pzhs[currentPzh], self.result);
        break;
      case 'revokePzp':
        pzh_api.revoke(self.pzhs[currentPzh], query.pzpid, self.result);
        break;
      case 'listPzp':
        pzh_api.listPzp(self.pzhs[currentPzh], self.result);
        break;
    }
  }
};

// Create HTTPS Server
PZH_WebServer.prototype.startWebServer = function(callback) {
  var self = this;
  if (typeof callback !== "function" ){
    callback(false, "failed starting PZH web server, invalid parameters");
  } else {
    self.loadCertificates(function (status, webServer) {
      if (status) {
        var server = https.createServer(webServer, function(req, res){
          req.on('data', function(data){
            var query = JSON.parse(data.toString());
            if (query.cmd) {
              self.handleUnauthorizedConnection(res, query);
            }

            if (query.from) {
              self.handleAuthorizedConnection(req, res, query);
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
              self.verifyConnection(res, req, query);
            }
          } else {
            self.sendFile(res, filename);
          }
        });

        server.listen(self.config.userPref.provider_webServer, self.address, function() {
          //log.info('listening at address ' + self.address + "and port "+ self.config.port.provider_webServerPort);
          console.log('listening at address ' + self.address + " and port "+ self.config.userPref.provider_webServer);
          callback(true);
        });
      }
    });
  }
};

module.exports = PZH_WebServer